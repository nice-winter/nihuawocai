/**
 * WebSocket 事件总线（mitt），跨模块事件解耦
 * @author Winter <littlewiinter@gmail.com>
 */

import mitt from 'mitt'
import type { WsEvents } from '~~/server/ws/utils'

export const wsEventBus = mitt<WsEvents>()
