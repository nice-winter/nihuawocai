import mitt from 'mitt'
import type { WsEvents } from '~~/server/ws/utils'

export const wsEventBus = mitt<WsEvents>()
