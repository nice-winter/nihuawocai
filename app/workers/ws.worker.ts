import { encode, decode } from '#shared/utils/crypto'
import { nanoid } from 'nanoid'

type WorkerCommand =
  | { type: 'CONNECT'; url: string }
  | { type: 'SEND'; data: unknown }
  | { type: 'CLOSE'; code?: number; reason?: string }

export type WorkerMessage =
  | { type: 'STATUS'; status: 'OPEN' | 'CONNECTING' }
  | { type: 'MESSAGE'; data: unknown }
  | { type: 'ERROR'; error: unknown }
  | { type: 'DISCONNECTED'; event: { code: number; reason: string } }

// --- 心跳配置 ---

const PING_INTERVAL = 30_000 // 30s
// 类型标注为 number：Worker 环境的 setInterval 返回 number，@types/node 的类型是污染
let pingTimer: number | null = null

const createPingMessage = () => {
  return encode({
    ...WS_MESSAGE_PING,
    payload: {
      msg: 'いいよ！こいよ！',
      code: 1145141919810,
      reason: 'keep_alive',
      random: nanoid(),
      t: Date.now()
    }
  })
}
const PONG_MESSAGE_ENCODED = encode(WS_MESSAGE_PONG)

const sendPing = () => {
  ws?.send(createPingMessage())
}
const startPingTimer = () => {
  if (!pingTimer) pingTimer = setInterval(sendPing, PING_INTERVAL) as unknown as number
}
const stopPingTimer = () => {
  if (pingTimer) {
    clearInterval(pingTimer)
    pingTimer = null
  }
}

// --- WebSocket 状态 ---

let ws: WebSocket | null = null
let connectGeneration = 0

const postMsg = (msg: WorkerMessage) => self.postMessage(msg)

// --- 消息处理 ---

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

// --- WebSocket 初始化 ---

function initWebSocket(url: string) {
  if (ws) {
    ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null
    ws.close()
  }

  ws = new WebSocket(url)
  ws.binaryType = 'arraybuffer'

  const gen = ++connectGeneration

  postMsg({ type: 'STATUS', status: 'CONNECTING' })

  ws.onopen = () => {
    if (gen !== connectGeneration) return
    startPingTimer()
    postMsg({ type: 'STATUS', status: 'OPEN' })
  }

  ws.onmessage = (e) => {
    if (gen !== connectGeneration) return

    try {
      const decoded = decode(new Uint8Array(e.data)) as WebsocketMessage<unknown>

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

  ws.onerror = () => {
    if (gen !== connectGeneration) return
    stopPingTimer()
    postMsg({ type: 'ERROR', error: 'WebSocket error occurred' })
  }

  ws.onclose = (e) => {
    if (gen !== connectGeneration) return
    stopPingTimer()
    postMsg({ type: 'DISCONNECTED', event: { code: e.code, reason: e.reason } })
    ws = null
  }
}
