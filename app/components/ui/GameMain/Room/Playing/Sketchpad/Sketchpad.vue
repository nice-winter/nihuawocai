<template>
  <div ref="Sketchpad" class="relative size-full bg-white">
    <UIcon
      v-show="showBrushIcon"
      ref="BrushCursor"
      :name="sketchpadStore.currentBrushObjetc?.icon"
      class="absolute z-114 size-6 pointer-events-none"
    />

    <div
      class="absolute z-2 size-full pointer-events-none"
      style="box-shadow: rgb(0 0 0 / 30%) 0px 0px 3px 1px inset"
    />

    <canvas ref="Canvas" class="size-full sketchpad" />
  </div>
</template>

<script setup lang="ts">
import { Point } from 'fabric'
import { SketchpadCanvas } from './fabric/SketchpadCanvas'
import { PencilBrush } from './fabric/brushes/PencilBrush'
import { EraserBrush } from './fabric/brushes/EraserBrush'

/* ---------------- refs & stores ---------------- */
const SketchpadRef = useTemplateRef('Sketchpad')
const SketchpadCanvasRef = useTemplateRef('Canvas')
const BrushCursor = useTemplateRef('BrushCursor')

const sketchpadStore = useSketchpadStore()
const gameStore = useGameStore()

let canvas: SketchpadCanvas

/* ---------------- 坐标状态 ---------------- */
const drawerLastXY = reactive({ x: -1, y: -1 }) // 网络回放坐标
let localX = -1
let localY = -1
const isOutside = ref(true)

/* ---------------- 鼠标事件 ---------------- */
const onPointerMove = (e: PointerEvent) => {
  const box = SketchpadRef.value?.getBoundingClientRect()
  if (!box) return
  localX = e.clientX - box.left
  localY = e.clientY - box.top
}
const onPointerEnter = () => (isOutside.value = false)
const onPointerLeave = () => {
  isOutside.value = true
  localX = -1
  localY = -1
}

/* ---------------- 是否显示 Brush 图标 ---------------- */
const showBrushIcon = computed(() => {
  if (gameStore.state.draw) return !isOutside.value

  if (gameStore.state.turnPhase === 'drawing') {
    return (
      drawerLastXY.x >= 0 &&
      drawerLastXY.y >= 0 &&
      drawerLastXY.x <= SketchpadRef.value!.clientWidth &&
      drawerLastXY.y <= SketchpadRef.value!.clientHeight
    )
  }
  return false
})

/* ---------------- raf 动画循环：同步指针位置 ---------------- */
const animate = () => {
  const el = BrushCursor.value?.$el as HTMLSpanElement
  if (!el) return requestAnimationFrame(animate)

  let x = -1,
    y = -1

  if (gameStore.state.draw && !isOutside.value) {
    x = localX
    y = localY
  } else if (gameStore.state.turnPhase === 'drawing') {
    x = drawerLastXY.x
    y = drawerLastXY.y
  }

  if (x >= 0 && y >= 0) {
    el.style.transform = `translate(${x - 2}px, ${y - 22}px)`
  }

  requestAnimationFrame(animate)
}

/* ---------------- 挂载：初始化canvas ---------------- */
onMounted(async () => {
  canvas = new SketchpadCanvas(SketchpadCanvasRef.value!, {
    width: SketchpadRef.value?.clientWidth,
    height: SketchpadRef.value?.clientHeight,
    isDrawingMode: false,
    selection: false,
    skipTargetFind: true
  })

  // 本地绘制 → 上报到 ws
  canvas.on('stream:points', (points) => {
    sketchpadStore.draw(points)
  })

  /* ----- 初始化画笔实例 ----- */
  const brushes = {
    pencil: new PencilBrush(canvas),
    eraser: new EraserBrush(canvas)
  }

  /* ----- 画笔切换 ----- */
  const updateBrush = () => {
    const brush = brushes[sketchpadStore.currentBrush]
    if (brush) canvas.freeDrawingBrush = brush

    const bo = sketchpadStore.brushOptions

    if (!canvas.freeDrawingBrush) return
    canvas.freeDrawingBrush.width = sketchpadStore.currentBrushObjetc?.widths[bo.width] || 0
    canvas.freeDrawingBrush.color = sketchpadStore.currentBrush !== 'eraser' ? bo.color : '#fff'
  }

  watch(() => sketchpadStore.currentBrush, updateBrush, { immediate: true })
  watch(() => sketchpadStore.brushOptions, updateBrush, {
    immediate: true,
    deep: true
  })

  await nextTick()
  requestAnimationFrame(animate)
})

/* ---------------- Sketchpad 指针监听 ---------------- */
useEventListener(SketchpadRef, 'pointerenter', onPointerEnter)
useEventListener(SketchpadRef, 'pointermove', onPointerMove)
useEventListener(SketchpadRef, 'pointerleave', onPointerLeave)

/* ---------------- 暴露给父组件的画布操作 API ---------------- */
defineExpose({
  replayPoints: (points: { point: { x: number; y: number }; action: 'down' | 'move' | 'up' }[]) => {
    if (!canvas?.freeDrawingBrush) return

    const b = canvas.freeDrawingBrush as PencilBrush
    for (const p of points) {
      const point = new Point(p.point)
      drawerLastXY.x = point.x
      drawerLastXY.y = point.y

      switch (p.action) {
        case 'down':
          b.onMouseDown(point)
          break
        case 'move':
          b.onMouseMove(point)
          break
        case 'up':
          b.onMouseUp()
          break
      }
    }
  },
  undo: () => canvas?.undo(),
  redo: () => canvas?.redo(),
  clear: () => canvas?.realClear(),
  reset: () => {
    canvas?.reset()
    drawerLastXY.x = -1
    drawerLastXY.y = -1
  },
  setDrawingMode: (enabled: boolean) => {
    if (canvas) canvas.isDrawingMode = enabled
  }
})
</script>

<style scoped></style>
