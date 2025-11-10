import type { WsPeer } from '~~/server/ws/utils'

export const channels = new Map<string, Set<WsPeer>>()

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
