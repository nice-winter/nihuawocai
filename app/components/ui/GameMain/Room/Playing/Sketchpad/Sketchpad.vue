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
import { SketchpadCanvas } from './fabric/SketchpadCanvas'
import { PencilBrush } from './fabric/brushes/PencilBrush'
import { EraserBrush } from './fabric/brushes/EraserBrush'

const SketchpadRef = useTemplateRef('Sketchpad')
const SketchpadCanvasRef = useTemplateRef('Canvas')
const sketchpadStore = useSketchpadStore()
const gameStore = useGameStore()

let canvas: SketchpadCanvas

const eventsHandler = {
  onClear: () => {
    canvas.realClear()
  },
  onUndo: () => {
    canvas.undo()
  },
  onRedo: () => {
    canvas.redo()
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
  canvas.on('cache:flush', (points) => {
    sketchpadStore.draw(points)
  })

  const updateCanvasBrushOptions = (bo: { color: string; width: number }) => {
    if (canvas?.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = sketchpadStore.currentBrushObjetc?.widths[bo.width] || 0

      if (sketchpadStore.currentBrush !== 'eraser') {
        canvas.freeDrawingBrush.color = bo.color
      } else {
        canvas.freeDrawingBrush.color = '#fff' // 橡皮擦模式下，设置为画板的背景色，其实这里设不设也无所谓
      }
    }
  }

  const brushes = {
    pencil: new PencilBrush(canvas),
    eraser: new EraserBrush(canvas)
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

  // 监听 draw 状态，判断是否可绘画
  // watch(
  //   () => gameStore.state.draw,
  //   (newState) => (canvas.isDrawingMode = newState),
  //   { immediate: true }
  // )
})

// 绘画消息
useEventBus('sketchpad:draw', ({ points }) => {
  if (!canvas || !canvas.freeDrawingBrush) return
  const canvasBrush = canvas.freeDrawingBrush as unknown as PencilBrush
  // ws 转发来的坐标是纯 xy，这里要把 xy 转为 fabric.js 的 Point 对象
  const _points = points.map((p) => {
    return {
      ...p,
      point: new Point(p.point)
    }
  })
  // 遍历坐标点，绘制
  _points.forEach((p) => {
    switch (p.action) {
      case 'down':
        canvasBrush.onMouseDown(p.point)
        break
      case 'move':
        canvasBrush.onMouseMove(p.point)
        break
      case 'up':
        canvasBrush.onMouseUp()
        break
    }
  })
})
// 新回合开始，清除画板画作
useEventBus('game:event:round:prepare', () => {
  // 短暂开启 isDrawingMode，否则 clear 会不生效
  canvas.isDrawingMode = true
  canvas?.realClear()
  canvas.isDrawingMode = false
})
useEventBus('game:event:drawing:start', () => {
  if (gameStore.isMyTurn) canvas.isDrawingMode = true
})
// 进入互动阶段，此时重置画板的状态，但仍然保留画作直至下一回合开始
useEventBus('game:event:interaction:start', () => {
  canvas.reset() // 重置缓存状态
  canvas.isDrawingMode = false
})
</script>

<style scoped></style>
