import { eventBus } from '~/common/eventBus'
import type { Brush, BrushesNameString } from '~/interfaces/brush'

export const useSketchpadStore = defineStore('sketchpad', () => {
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
      icon: 'mdi:pencil-outline',
      widths: [1.3, 4, 8, 24, 48],
      defaultOptions: {
        color: '#000000',
        width: 1
      }
    },
    {
      name: 'eraser',
      icon: 'mdi:eraser',
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

  const setCurrentBrush = (brushName: BrushesNameString) => {
    if (brushes.value.find((b) => b.name === brushName)) {
      currentBrush.value = brushName
    }
  }

  const getCurrentBrushObjetc = () => {
    return brushes.value.find((b) => b.name === currentBrush.value)
  }

  const updateBrushOptions = (bo: Partial<typeof brushOptions>) => {
    Object.assign(brushOptions, bo)
    console.log(`[Sketchpad-Store]`, brushOptions)
  }

  const undo = () => {
    eventBus.emit('sketchpad:undo')
    console.log('[Sketchpad-Store]', 'undo')
  }
  const redo = () => {
    eventBus.emit('sketchpad:redo')
    console.log('[Sketchpad-Store]', 'redo')
  }
  const clear = () => {
    eventBus.emit('sketchpad:clear')
    console.log('[Sketchpad-Store]', 'clear')
  }

  return {
    options,
    brushes,
    brushOptions,
    currentBrush,
    setCurrentBrush,
    getCurrentBrushObjetc,
    updateBrushOptions,
    undo,
    redo,
    clear
  }
})
