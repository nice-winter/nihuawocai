<
<template>
  <div ref="Sketchpad" class="relative bg-white" style="">
    <div
      class="absolute z-2 size-full pointer-events-none"
      style="box-shadow: rgb(0 0 0 / 40%) 0px 0px 3px 1px inset"
    />
    <canvas ref="SketchpadCanvas" class="size-full sketchpad" />
  </div>
</template>

<script setup lang="ts">
import { Canvas } from 'fabric'
import { useSketchpadStore } from '~/stores/sketchpad/sketchpadStore'
import { pencil } from './brushes/pencil'
import { eventBus } from '~/common/eventBus'

const SketchpadRef = useTemplateRef('Sketchpad')
const SketchpadCanvasRef = useTemplateRef('SketchpadCanvas')
const sketchpadStore = useSketchpadStore()

let canvas: Canvas

const eventsHander = {
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

onMounted(() => {
  canvas = new Canvas(SketchpadCanvasRef.value!, {
    width: SketchpadRef.value?.clientWidth,
    height: SketchpadRef.value?.clientHeight,
    isDrawingMode: true
  })

  eventBus.on('sketchpad:clear', eventsHander.onClear)
  eventBus.on('sketchpad:undo', eventsHander.onUndo)
  eventBus.on('sketchpad:redo', eventsHander.onUndo)

  const updateCanvasBrushOptions = (bo: { color: string; width: number }) => {
    if (canvas?.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = sketchpadStore.getCurrentBrushObjetc()?.widths[bo.width] || 0

      if (sketchpadStore.currentBrush !== 'eraser') {
        canvas.freeDrawingBrush.color = bo.color
      } else {
        canvas.freeDrawingBrush.color = '#fff'
      }
    }
    console.log(
      `[sketchpad]`,
      `[update]`,
      canvas.freeDrawingBrush?.width,
      canvas.freeDrawingBrush?.color
    )
  }

  const brushes = {
    pencil: pencil(canvas),
    eraser: pencil(canvas)
  }

  watch(
    () => sketchpadStore.currentBrush,
    (newVavle) => {
      if (canvas) {
        const brush = brushes[sketchpadStore.currentBrush]
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
})

onUnmounted(() => {
  eventBus.off('sketchpad:clear', eventsHander.onClear)
  eventBus.off('sketchpad:undo', eventsHander.onUndo)
  eventBus.off('sketchpad:redo', eventsHander.onUndo)
})
</script>

<style scoped></style>
