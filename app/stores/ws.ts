import { defineStore } from 'pinia'
import mitt from 'mitt'
import { encode } from '#shared/utils/crypto'
import { WS_MESSAGE_PING, WS_MESSAGE_PONG, WS_MESSAGE_DUPLICATE_LOGIN } from '#shared/interfaces/ws'
import type { WebsocketMessage } from '#shared/interfaces/ws'

type WsEvents = {
  'ws:connected': WebSocket
  'ws:message': WebsocketMessage
  'ws:error': unknown
  'ws:disconnected': CloseEvent
}

export const useWsStore = defineStore('ws', () => {
  const wsEventBus = mitt<WsEvents>()

  const { status, data, send, open, close } = useWebSocket('/_ws/server', {
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
      wsEventBus.emit('ws:connected', ws)
    },
    onMessage(_, e) {
      const msg = decode(e.data) as WebsocketMessage
      console.log('[ws]', '[收到消息] --->>>>', msg)

      wsEventBus.emit('ws:message', msg)
    },
    onError(_, e) {
      wsEventBus.emit('ws:error', e)
    },
    onDisconnected(_, e) {
      if (e.code === 4001) {
        console.warn(
          '[ws]',
          e.code,
          e.reason,
          '客户端收到重复登录通知，主动关闭当前连接，并且不再自动重连。'
        )
        close(4001, 'Duplicate login, close.')
      }

      wsEventBus.emit('ws:disconnected', e)
    }
  })

  const _data = computed(() => (data.value ? decode(data.value) : {}))

  const _send = <T = {}>(msg: WebsocketMessage<T>) => {
    if (status.value !== 'OPEN') {
      console.warn('[ws(未连接)]', '[发送消息] <<<<---', msg)
    } else {
      console.log('[ws]', '[发送消息] <<<<---', msg)
    }

    send(encode(msg))
  }

  return {
    wsEventBus,
    status,
    data: _data,
    send: _send,
    open,
    close
  }
})
