import { defineStore } from 'pinia'
import mitt from 'mitt'
import { consola } from 'consola/browser'
import { nanoid } from 'nanoid'
import type { WorkerMessage } from '@/workers/ws.worker'
import WsWorker from '@/workers/ws.worker?worker'

type WsEvents = {
  'ws:connected': unknown
  'ws:message': WebsocketMessage
  'ws:error': unknown
  'ws:disconnected': { code: number; reason: string }
}

const logger = consola.withTag('WebSocket')

export const useWsStore = defineStore('ws', () => {
  const wsEventBus = mitt<WsEvents>()

  // 状态管理
  const status = ref<'OPEN' | 'CONNECTING' | 'CLOSED'>('CLOSED')

  // Pending Requests (Promise 映射)
  type Pending<T> = {
    resolve: (v: T) => void
    reject: (err: unknown) => void
    timer: number
  }
  const pendingRequests = new Map<string, Pending<WebsocketMessage>>()

  // Worker 实例
  let worker: Worker | null = null

  // --- 核心方法 ---

  const initWorker = () => {
    if (worker) return
    worker = new WsWorker()

    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const msg = e.data

      switch (msg.type) {
        case 'STATUS':
          status.value = msg.status
          if (msg.status === 'OPEN') {
            // 模拟原逻辑的 setTimeout
            setTimeout(() => {
              wsEventBus.emit('ws:connected')
            }, 100)
          }
          break

        case 'MESSAGE':
          handleIncomingMessage(msg.data as WebsocketMessage<unknown>)
          break

        case 'ERROR':
          logger.error.raw(msg.error)
          wsEventBus.emit('ws:error', msg.error)
          break

        case 'DISCONNECTED':
          logger.warn.raw(msg.event)
          handleDisconnected(msg.event)
          break
      }
    }
  }

  const open = () => {
    if (!worker) initWorker()
    // 发送指令给 Worker
    worker?.postMessage({ type: 'CONNECT', url: getWsUrl('/_ws/server') })
  }

  const close = (code = 1000, reason = 'Client closed') => {
    worker?.postMessage({ type: 'CLOSE', code, reason })
  }

  const handleIncomingMessage = (msg: WebsocketMessage & { _rid?: string; _reply?: boolean }) => {
    // 错误处理弹窗逻辑
    const { successful, message } = msg as WebsocketMessage<WS_RECV & { message?: string }>
    if (successful === false && typeof message === 'string') {
      gameMessageBox.show(message)
    }

    // 广播事件
    wsEventBus.emit('ws:message', msg)

    // 日志
    if (msg.type !== 'pong') {
      logger.withTag('⬇').log.raw(msg)
    }

    // 请求/响应 Promise 处理
    if (msg._reply && msg._rid) {
      const rid = msg._rid
      const pending = pendingRequests.get(rid)
      if (pending) {
        clearTimeout(pending.timer)
        pendingRequests.delete(rid)
        pending.resolve(msg)
      }
    }
  }

  // --- 断开处理逻辑 ---

  const handleDisconnected = (e: { code: number; reason: string }) => {
    // 4001 重复登录处理
    if (e.code === 4001) {
      logger.warn(e.code, e.reason, '客户端收到重复登录通知，主动关闭当前连接，并且不再自动重连。')
    }

    // 拒绝所有 pending 请求
    for (const [rid, pending] of pendingRequests) {
      clearTimeout(pending.timer)
      pending.reject(new Error(`WebSocket disconnected (code: ${e.code})`))
    }
    pendingRequests.clear()

    wsEventBus.emit('ws:disconnected', e as CloseEvent) // 类型兼容 hack
  }

  // --- 发送逻辑 ---

  const _send = <T = object, R extends WebsocketMessage = WebsocketMessage>(
    msg: WebsocketMessage<T>,
    opts?: { timeout?: number }
  ): Promise<R> => {
    const rid = nanoid(8) // 生成请求唯一标识
    const _msg = { ...(msg as object), rid } as WebsocketMessage & { rid: string }
    const timeout = opts?.timeout ?? 5000 // 默认 5s 超时

    return new Promise<R>((resolve, reject) => {
      // 1. 注册 Pending
      const timer = window.setTimeout(() => {
        pendingRequests.delete(rid)
        reject(new Error('WS request timeout'))
        logger.error.raw('请求超时未响应', msg)
      }, timeout)

      pendingRequests.set(rid, {
        resolve: (v) => resolve(v as unknown as R),
        reject,
        timer
      })

      // 2. 发送给 Worker (Worker 负责 encode 和 send)
      if (worker && status.value === 'OPEN') {
        worker.postMessage({ type: 'SEND', data: _msg })
        logger.withTag('⬆').log(_msg)
      } else {
        // 如果连接未打开，直接失败
        clearTimeout(timer)
        pendingRequests.delete(rid)
        reject(new Error('WebSocket is not open'))
      }
    })
  }

  const sendFireAndForget = <T>(msg: WebsocketMessage<T>) => {
    if (worker && status.value === 'OPEN') {
      worker.postMessage({ type: 'SEND', data: msg })
      logger.withTag('⬆').log(msg)
    }
  }

  // 辅助函数：处理 URL 相对路径
  function getWsUrl(path: string) {
    const loc = window.location
    const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${proto}//${loc.host}${path}`
  }

  return {
    wsEventBus,
    status,
    send: _send,
    sendRaw: sendFireAndForget,
    open,
    close
  }
})
