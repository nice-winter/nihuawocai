import { defineStore } from 'pinia'
import mitt from 'mitt'
import { encode } from '#shared/utils/crypto'
import { WS_MESSAGE_PING, WS_MESSAGE_PONG, WS_MESSAGE_DUPLICATE_LOGIN } from '#shared/interfaces/ws'
import { consola } from 'consola/browser'
import { colors } from 'consola/utils'
import type { WebsocketMessage } from '#shared/interfaces/ws'

type WsEvents = {
  'ws:connected': WebSocket
  'ws:message': WebsocketMessage
  'ws:error': unknown
  'ws:disconnected': CloseEvent
}

const logger = consola.withTag('WebSocket')

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
      setTimeout(() => {
        wsEventBus.emit('ws:connected', ws)
      }, 100)
    },
    onMessage(_, e) {
      const msg = decode(e.data) as WebsocketMessage

      if ((msg as WebsocketMessage<{ _error: boolean; message: string }>)._error) {
        gameMessageBox.show((msg as WebsocketMessage<{ message: string }>).message)
      }

      wsEventBus.emit('ws:message', msg)

      if (msg.type !== 'pong') logger.log(colors.blue('[收到消息] --->>>>'), msg)
    },
    onError(_, e) {
      wsEventBus.emit('ws:error', e)
    },
    onDisconnected(_, e) {
      if (e.code === 4001) {
        console.warn(
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

  const _send = <T = object>(msg: WebsocketMessage<T>) => {
    const _msg = { ...msg, rid: shortHash() }
    send(encode(_msg))

    if (status.value !== 'OPEN') {
      logger.log(colors.green('[发送消息] <<<<---'), _msg)
    } else {
      logger.log(colors.green('[发送消息] <<<<---'), _msg)
    }
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
