import type { Brush, BrushesNameString } from '@/interfaces/brush'
import type { CachedPoint } from '@/components/ui/GameMain/Room/Playing/Sketchpad/fabric/InputBatcher'

export const useSketchpadStore = defineStore('sketchpad', () => {
  const { wsEventBus, send, sendRaw } = useWsStore()
  const gameStore = useGameStore()

  const options = reactive({
    colors: [
      '#000000',
      '#8F928E',
      '#F1EFF1',
      '#DA0C12',
      '#F8921C',
      '#F1EE04',
      '#34CD05',
      '#1BAAE5',
      '#0200F8',
      '#FA81CE',
      '#652C8F',
      '#DBAB82',
      '#603710',
      '#B1CB03'
    ],
    widths: [6, 10, 14, 18, 22]
  })

  const brushes = ref<Brush[]>([
    {
      name: 'pencil',
      icon: 'custom:icon-pencil',
      widths: [1.4, 4, 8, 24, 48],
      defaultOptions: {
        color: '#000000',
        width: 1
      }
    },
    {
      name: 'eraser',
      icon: 'custom:icon-eraser',
      widths: [4, 8, 16, 32, 64],
      defaultOptions: {
        color: '#ffffff',
        width: 1
      }
    }
  ])

  const currentBrush = ref<BrushesNameString>('pencil')

  const brushOptions = reactive({
    color: '#000000',
    width: 1
  })

  const currentBrushObjetc = computed(() =>
    brushes.value.find((b) => b.name === currentBrush.value)
  )

  const setCurrentBrush = async (brushName: BrushesNameString) => {
    if (brushes.value.find((b) => b.name === brushName)) {
      currentBrush.value = brushName

      await send({
        type: 'game:drawing:sketchpad',
        command: 'pencil_switch',
        payload: {
          name: currentBrush.value
        }
      })
    }
  }

  const updateBrushOptions = async (bo: Partial<typeof brushOptions>) => {
    Object.assign(brushOptions, bo)

    await send({
      type: 'game:drawing:sketchpad',
      command: 'pencil_options_update',
      payload: {
        options: toRaw(brushOptions) // 这里不要把响应式层的东西发到 worker，否则会报错
      }
    })
  }

  const draw = (points: CachedPoint[]) => {
    sendRaw({
      type: 'game:drawing:sketchpad',
      command: 'draw',
      payload: {
        points
      }
    })
  }

  const undo = async () => {
    eventBus.emit('sketchpad:undo')

    await send({
      type: 'game:drawing:sketchpad',
      command: 'undo'
    })
  }
  const redo = async () => {
    eventBus.emit('sketchpad:redo')

    await send({
      type: 'game:drawing:sketchpad',
      command: 'redo'
    })
  }
  const clear = async () => {
    eventBus.emit('sketchpad:clear')

    await send({
      type: 'game:drawing:sketchpad',
      command: 'clear'
    })
  }

  const handleSketchpadEvents = (
    command: 'pencil_switch' | 'pencil_options_update' | 'draw' | 'undo' | 'redo' | 'clear',
    payload: unknown
  ) => {
    switch (command) {
      // 切换笔触
      case 'pencil_switch': {
        // @TODO: 笔触名称存在验证
        const { name } = payload as { name: BrushesNameString }
        currentBrush.value = name
        break
      }
      // 更新笔触设置
      case 'pencil_options_update': {
        const { options } = payload as { options: { color: string; width: number } }
        Object.assign(brushOptions, options)
        break
      }
      // 绘画
      case 'draw': {
        const { points } = payload as {
          points: {
            point: {
              x: number
              y: number
            }
            sequence: number
            timestamp: number
            action: 'down' | 'move' | 'up'
          }[]
        }
        eventBus.emit('sketchpad:draw', {
          points
        })
        break
      }
      // 撤销
      case 'undo': {
        eventBus.emit('sketchpad:undo')
        break
      }
      // 重做
      case 'redo': {
        eventBus.emit('sketchpad:redo')
        break
      }
      // 清空画板
      case 'clear': {
        eventBus.emit('sketchpad:clear')
        break
      }
    }
  }

  wsEventBus.on('ws:message', (msg) => {
    if (msg.type.startsWith('game:event:sketchpad')) {
      const { command, payload } = msg as WebsocketMessage<{
        command: 'pencil_switch' | 'pencil_options_update' | 'draw' | 'undo' | 'redo' | 'clear'
        payload: unknown
      }>
      handleSketchpadEvents(command, payload)
    }
  })

  return {
    options,
    brushes,
    brushOptions,
    currentBrush,
    currentBrushObjetc,
    setCurrentBrush,
    updateBrushOptions,
    draw,
    undo,
    redo,
    clear
  }
})
