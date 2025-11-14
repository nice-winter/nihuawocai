import { defineStore } from 'pinia'
import mitt from 'mitt'
import { encode, decode } from '#shared/utils/crypto'
import { WS_MESSAGE_PING, WS_MESSAGE_PONG, WS_MESSAGE_DUPLICATE_LOGIN } from '#shared/interfaces/ws'
import { consola } from 'consola/browser'
import { colors } from 'consola/utils'
import type { WebsocketMessage, WS_RECV } from '#shared/interfaces/ws'

type WsEvents = {
  'ws:connected': WebSocket
  'ws:message': WebsocketMessage
  'ws:error': unknown
  'ws:disconnected': CloseEvent
}

const logger = consola.withTag('WebSocket')

export const useWsStore = defineStore('ws', () => {
  const wsEventBus = mitt<WsEvents>()

  const {
    status,
    data,
    send: rawSend,
    open,
    close
  } = useWebSocket('/_ws/server', {
    immediate: false,
    autoReconnect: true,
    heartbeat: {
      message: encode(WS_MESSAGE_PING),
      responseMessage: encode(WS_MESSAGE_PONG),
      interval: 10000,
      pongTimeout: 5000
    },
    onConnected(ws) {
      ws.binaryType = 'arraybuffer'
      setTimeout(() => {
        wsEventBus.emit('ws:connected', ws)
      }, 100)
    },
    onMessage(_, e) {
      const msg = decode(e.data) as WebsocketMessage & { _rid?: string; _reply?: boolean }

      // 如果是后端对前端请求的回复，先走 pending 路由（下面会处理）
      if ((msg as WebsocketMessage<{ _error: boolean; message: string }>)._error) {
        gameMessageBox.show((msg as WebsocketMessage<{ message: string }>).message)
      }

      // 广播原始消息（仍然需要给外部订阅）
      wsEventBus.emit('ws:message', msg)

      // 日志（除 pong 外）
      if (msg.type !== 'pong') logger.log(colors.blue('[收到消息] --->>>>'), msg)

      // 如果这是对前端请求的回复（_reply: true 并带有 _rid），路由到 pending
      if ((msg as WS_RECV)._reply && (msg as WS_RECV)._rid) {
        const rid = (msg as WS_RECV)._rid as string
        const pending = pendingRequests.get(rid)
        if (pending) {
          clearTimeout(pending.timer)
          pendingRequests.delete(rid)
          pending.resolve(msg)
          return // 已处理，避免再次处理
        }
      }
    },
    onError(_, e) {
      wsEventBus.emit('ws:error', e)
    },
    onDisconnected(_, e) {
      // code: 4001 为重复登录，服务端主动要求关闭，执行不重连逻辑
      if (e.code === 4001) {
        logger.warn(
          e.code,
          e.reason,
          '客户端收到重复登录通知，主动关闭当前连接，并且不再自动重连。'
        )
        close(4001, 'Duplicate login')
      }

      // 断开时：拒绝所有未完成的请求
      for (const [rid, pending] of pendingRequests) {
        clearTimeout(pending.timer)
        pending.reject(new Error(`WebSocket disconnected (code: ${e.code})`))
      }
      pendingRequests.clear()

      wsEventBus.emit('ws:disconnected', e)
    }
  })

  const _data = computed(() => (data.value ? decode(data.value) : {}))

  /**
   * pendingRequests 存储：rid -> { resolve, reject, timer }
   */
  type Pending<T> = {
    resolve: (v: T) => void
    reject: (err: unknown) => void
    timer: number
  }
  const pendingRequests = new Map<string, Pending<WebsocketMessage>>()

  /**
   * _send：发送并等待后端带有 _rid 和 _reply: true 的回应
   * - msg: 要发送的消息体（会自动追加 rid 字段）
   * - opts.timeout: 毫秒（默认 10000 ms）
   *
   * 返回值 Promise<WebsocketMessage>，在超时 / 断线 / 发送失败时 reject
   */
  const _send = <T = object, R extends WebsocketMessage = WebsocketMessage>(
    msg: WebsocketMessage<T>,
    opts?: { timeout?: number }
  ): Promise<R> => {
    const rid = shortHash()
    const _msg = { ...(msg as object), rid } as WebsocketMessage & { rid: string }
    const timeout = opts?.timeout ?? 10000

    return new Promise<R>((resolve, reject) => {
      // 先注册 pending，避免超快的后端先返回导致丢失
      const timer = window.setTimeout(() => {
        pendingRequests.delete(rid)
        reject(new Error('WS request timeout'))
      }, timeout) as unknown as number

      pendingRequests.set(rid, {
        resolve: (v) => resolve(v as unknown as R),
        reject,
        timer
      })

      try {
        rawSend(encode(_msg))
        logger.log(colors.green('[发送消息] <<<<---'), _msg)
      } catch (err) {
        // 发送失败：清理并 reject
        clearTimeout(timer)
        pendingRequests.delete(rid)
        reject(err)
      }
    })
  }

  // 无等待发送
  const sendFireAndForget = (msg: WebsocketMessage) => {
    rawSend(encode(msg))
    logger.log(colors.green('[发送消息-不等待] <<<<---'), msg)
  }

  return {
    wsEventBus,
    status,
    data: _data,
    send: _send,
    sendRaw: sendFireAndForget,
    open,
    close
  }
})
