/**
 * 频道订阅管理，按 topic 向 peer 分组广播
 * @author Winter <littlewiinter@gmail.com>
 */

import type { WsPeer } from '~~/server/ws/utils'

export const channels = new Map<string, Set<WsPeer>>()

/** 房间频道 topic 命名，键为 room.id（不可复用的 nanoid） */
export const roomTopic = (roomId: string) => `room:${roomId}`

export const subscribePeerToChannel = (peer: WsPeer, topic: string) => {
  peer.topics.add(topic)
  if (!channels.has(topic)) channels.set(topic, new Set())
  channels.get(topic)!.add(peer)
}

export const unsubscribePeerFromChannel = (peer: WsPeer, topic: string) => {
  peer.topics.delete(topic)
  const set = channels.get(topic)
  set?.delete(peer)
  if (set && set.size === 0) channels.delete(topic)
}

/**
 * 将 peer 从所有频道摘除（连接关闭/出错时的兜底清扫，防止 channels 泄漏已断开的 peer）
 * 注意：必须先拷贝 topics 再逐个退订，边遍历边删会踩 Set 迭代陷阱
 */
export const unsubscribePeerFromAllChannels = (peer: WsPeer) => {
  for (const topic of [...peer.topics]) {
    unsubscribePeerFromChannel(peer, topic)
  }
}
