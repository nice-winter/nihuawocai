<
<template>
  <div ref="Sketchpad" class="relative bg-white" style="">
    <div
      class="absolute z-2 size-full pointer-events-none"
      style="box-shadow: rgb(0 0 0 / 40%) 0px 0px 3px 1px inset"
    />
    <canvas ref="Canvas" class="size-full sketchpad" />
  </div>
</template>

<script setup lang="ts">
import type { Canvas } from 'fabric'
import { useSketchpadStore } from '~/stores/sketchpad/sketchpadStore'
import { useEventBus } from '~/composables/eventBus'
import { SketchpadCanvas } from './fabric/SketchpadCanvas'
import { PencilBrush } from './fabric/brushes/PencilBrush'

const SketchpadRef = useTemplateRef('Sketchpad')
const SketchpadCanvasRef = useTemplateRef('Canvas')
const sketchpadStore = useSketchpadStore()

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
  canvas = new SketchpadCanvas(SketchpadCanvasRef.value!, {
    width: SketchpadRef.value?.clientWidth,
    height: SketchpadRef.value?.clientHeight,
    isDrawingMode: true
  })

  canvas.on('cache:flush', (points) => {
    console.log('[Cache]', points)
  })

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
      `[Sketchpad-Component]`,
      `[update]`,
      canvas.freeDrawingBrush?.width,
      canvas.freeDrawingBrush?.color
    )
  }

  const brushes = {
    pencil: new PencilBrush(canvas),
    eraser: new PencilBrush(canvas)
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
</script>

<style scoped></style>
