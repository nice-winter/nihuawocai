/**
 * 消息发送工具：单播/广播/频道广播封装
 * @author Winter <littlewiinter@gmail.com>
 */

import { safeSend } from '~~/server/ws/utils'
import { channels } from './channel'
import type { WsPeer } from '~~/server/ws/utils'

export const sendToAll = <T>(msg: WebsocketMessage<T>, peers: Set<WsPeer>) => {
  for (const peer of peers) safeSend(peer, msg)
}

export const sendToChannel = <T>(
  msg: WebsocketMessage<T>,
  channel: string | string[],
  opts?: { excludePeers?: Set<WsPeer> }
) => {
  const topics = Array.isArray(channel) ? channel : [channel]
  const target = new Set<WsPeer>()

  for (const t of topics) {
    const set = channels.get(t)
    if (set) for (const p of set) target.add(p)
  }
  for (const p of target) {
    if (opts?.excludePeers?.has(p)) continue
    safeSend(p, msg)
  }
}
