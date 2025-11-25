import { safeSend, isOpen } from '~~/server/ws/utils'
import { players } from '~~/server/services/player'
import { channels } from './channel'
import type { WsPeer } from '~~/server/ws/utils'

export const sendToAll = <T>(msg: WebsocketMessage<T>, peers: Set<WsPeer>) => {
  for (const peer of peers) safeSend(peer, msg)
}

export const sendToChannel = <T>(msg: WebsocketMessage<T>, channel: string | string[]) => {
  const topics = Array.isArray(channel) ? channel : [channel]
  const target = new Set<WsPeer>()

  for (const t of topics) {
    const set = channels.get(t)
    if (set) for (const p of set) target.add(p)
  }
  for (const p of target) safeSend(p, msg)
}

export const sendToUser = <T>(msg: WebsocketMessage<T>, id: string | string[]) => {
  const ids = Array.isArray(id) ? id : [id]
  for (const i of ids) {
    const u = players.get(i)
    if (u && isOpen(u.peer)) safeSend(u.peer, msg)
  }
}
