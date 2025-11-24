<
<template>
  <div ref="Sketchpad" class="relative size-full bg-white" style="">
    <div
      class="absolute z-2 size-full pointer-events-none"
      style="box-shadow: rgb(0 0 0 / 40%) 0px 0px 3px 1px inset"
    />
    <canvas ref="Canvas" class="size-full sketchpad" />
  </div>
</template>

<script setup lang="ts">
import { Point, type Canvas } from 'fabric'
import { useSketchpadStore } from '~/stores/sketchpad/sketchpadStore'
import { useEventBus } from '~/composables/eventBus'
import { SketchpadCanvas } from './fabric/SketchpadCanvas'
import { PencilBrush } from './fabric/brushes/PencilBrush'

const SketchpadRef = useTemplateRef('Sketchpad')
const SketchpadCanvasRef = useTemplateRef('Canvas')
const sketchpadStore = useSketchpadStore()
const gameStore = useGameStore()

let canvas: Canvas

const eventsHandler = {
  onClear: () => {
    canvas.clear()
    console.log(`[Sketchpad-Component]`, 'clear')
  },
  onUndo: () => {
    console.log(`[Sketchpad-Component]`, 'undo')
  },
  onRedo: () => {
    console.log(`[Sketchpad-Component]`, 'redo')
  }
}
useEventBus('sketchpad:undo', eventsHandler.onUndo)
useEventBus('sketchpad:redo', eventsHandler.onRedo)
useEventBus('sketchpad:clear', eventsHandler.onClear)

onMounted(() => {
  // 创建 canvas 实例
  canvas = new SketchpadCanvas(SketchpadCanvasRef.value!, {
    width: SketchpadRef.value?.clientWidth,
    height: SketchpadRef.value?.clientHeight,
    isDrawingMode: false, // 默认禁止操作
    selection: false,
    skipTargetFind: true
  })

  // 监听 canvas 绘画事件
  canvas.on('cache:flush', async (points) => {
    await sketchpadStore.draw(points)
  })

  const updateCanvasBrushOptions = (bo: { color: string; width: number }) => {
    if (canvas?.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = sketchpadStore.currentBrushObjetc?.widths[bo.width] || 0

      if (sketchpadStore.currentBrush !== 'eraser') {
        canvas.freeDrawingBrush.color = bo.color
      } else {
        canvas.freeDrawingBrush.color = '#fff'
      }
    }
  }

  const brushes = {
    pencil: new PencilBrush(canvas),
    eraser: new PencilBrush(canvas)
  }

  watch(
    () => sketchpadStore.currentBrush,
    (newBrushName) => {
      if (canvas) {
        const brush = brushes[newBrushName]
        if (brush) {
          canvas.freeDrawingBrush = brush
        }

        updateCanvasBrushOptions(sketchpadStore.brushOptions)
      }
    },
    {
      immediate: true
    }
  )

  watch(
    () => sketchpadStore.brushOptions,
    (newValue) => {
      updateCanvasBrushOptions(newValue)
    },
    { immediate: true, deep: true }
  )

  watch(
    () => gameStore.state.draw,
    (newState) => (canvas.isDrawingMode = newState),
    { immediate: true }
  )
})

useEventBus('sketchpad:draw', ({ points }) => {
  if (!canvas || !canvas.freeDrawingBrush) return
  const canvasBrush = canvas.freeDrawingBrush as unknown as PencilBrush

  const _points = points.map((p) => {
    return {
      ...p,
      point: new Point(p.point)
    }
  })

  _points.forEach((p) => {
    if (p.action === 'down') canvasBrush.onMouseDown(p.point)
    if (p.action === 'move') canvasBrush.onMouseMove(p.point)
    if (p.action === 'up') canvasBrush.onMouseUp()
  })
})
useEventBus('game:event:interaction:start', () => {
  if (!canvas || !canvas.freeDrawingBrush) return
  const canvasBrush = canvas.freeDrawingBrush as unknown as PencilBrush
  canvasBrush.onMouseUp()
})
</script>

<style scoped></style>
