import { encode, decode } from '#shared/utils/crypto'
import { nanoid } from 'nanoid'

type WorkerCommand =
  | { type: 'CONNECT'; url: string }
  | { type: 'SEND'; data: unknown }
  | { type: 'CLOSE'; code?: number; reason?: string }

export type WorkerMessage =
  | { type: 'STATUS'; status: 'OPEN' | 'CLOSED' | 'CONNECTING' }
  | { type: 'MESSAGE'; data: unknown }
  | { type: 'ERROR'; error: unknown }
  | { type: 'DISCONNECTED'; event: { code: number; reason: string } }

type Idle = {
  timer: number | null
  i: number
}

const PING_MESSAGE_ENCODED = encode({
  ...WS_MESSAGE_PING,
  payload: {
    msg: 'いいよ！ こいよ！',
    code: 1145141919810,
    reason: 'keep_alive',
    random: nanoid()
  }
})
const PONG_MESSAGE_ENCODED = encode(WS_MESSAGE_PONG)

let ws: WebSocket | null = null

const idle: Idle = {
  timer: null,
  i: 30_000 // 30s
}
const _idle = () => {
  ws?.send(PING_MESSAGE_ENCODED)
}
const startIdle = () => {
  if (!idle.timer) idle.timer = setInterval(_idle, idle.i)
}
const stopIdle = () => {
  if (idle.timer) clearInterval(idle.timer)
}

const postMsg = (msg: WorkerMessage) => self.postMessage(msg)

self.onmessage = (e: MessageEvent<WorkerCommand>) => {
  const { type } = e.data

  switch (type) {
    case 'CONNECT':
      initWebSocket(e.data.url)
      break
    case 'SEND':
      if (ws && ws.readyState === WebSocket.OPEN) {
        const encoded = encode(e.data.data)
        ws.send(encoded)
      }
      break
    case 'CLOSE':
      if (ws) {
        ws.close(e.data.code, e.data.reason)
      }
      break
  }
}

function initWebSocket(url: string) {
  if (ws) ws.close()

  ws = new WebSocket(url)
  ws.binaryType = 'arraybuffer'
  postMsg({ type: 'STATUS', status: 'CONNECTING' })

  ws.onopen = () => {
    startIdle()
    postMsg({ type: 'STATUS', status: 'OPEN' })
  }

  ws.onmessage = (e) => {
    try {
      const decoded = decode(e.data) as WebsocketMessage<unknown>

      if (decoded.type === 'ping') {
        // 心跳包消息，回复 pong
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(PONG_MESSAGE_ENCODED)
        }
      } else {
        // 非心跳消息发回主线程
        postMsg({ type: 'MESSAGE', data: decoded })
      }
    } catch (err) {
      console.error('WS Decode Error in Worker', err)
    }
  }

  ws.onerror = (e) => {
    stopIdle()
    postMsg({ type: 'ERROR', error: 'WebSocket error' })
  }

  ws.onclose = (e) => {
    stopIdle()
    postMsg({ type: 'STATUS', status: 'CLOSED' })
    postMsg({ type: 'DISCONNECTED', event: { code: e.code, reason: e.reason } })
    ws = null
  }
}
