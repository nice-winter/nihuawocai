<script setup lang="ts">
import FlyingItem, { type IKeyframe } from './FlyingItem.vue'
import { createFlowerAnimation } from '@/animations/flower'
import { createSlipperAnimation, createPrintAnimation } from '@/animations/slipper'
import flowerSvg from '@/assets/icons/flower.svg?raw'
import slipperSvg from '@/assets/icons/icon-slipper-big.svg?raw'
import slipperPrintSvg from '@/assets/icons/icon-slipper-big-1.svg?raw'

interface Props {
  container: HTMLElement | null
}

const { container } = defineProps<Props>()

interface Item {
  id: number
  x: number
  keyframes: IKeyframe[]
  svg: string
  width: number
  height: number
  duration: number
  zIndex?: number
}

const items = ref<Item[]>([])
let autoId = 0

const throwFlower = (count = 1, startHeight = 100, endHeight = 400) => {
  const el = container
  if (!el) return

  const width = el.clientWidth
  // const endY = el.clientHeight - 64

  for (let i = 0; i < count; i++) {
    const randomX = Math.random() * (width - 128)

    items.value.push({
      id: autoId++,
      x: randomX,
      keyframes: createFlowerAnimation(randomX, startHeight, endHeight),
      svg: flowerSvg,
      width: 90,
      height: 90,
      duration: 1000
    })
  }
}

const throwSlipper = () => {
  const el = container
  if (!el) return

  const width = el.clientWidth
  const height = el.clientHeight

  // 随机目标位置
  const targetX = Math.random() * (width - 80) + 20
  const targetY = Math.random() * 100 + 100

  // 从屏幕外飞入（随机从左边或右边）
  const startFromRight = Math.random() > 0.5
  const startX = startFromRight ? width + 50 : -80
  const startY = -50

  // 拖鞋尺寸 60x132，鞋印尺寸 60x130
  // 计算鞋印位置：让鞋印脚底对齐拖鞋脚底
  // 拖鞋脚底中心 X = targetX + 30 (60/2)
  // 鞋印左上角 X = 拖鞋脚底中心 X - 30 (60/2) = targetX
  const printX = targetX
  // 拖鞋脚底 Y = targetY + 132
  // 鞋印左上角 Y = 拖鞋脚底 Y - 130 (鞋印高度) = targetY + 2
  const printY = targetY + 2

  // 1. 立即添加拖鞋飞行动画（z-index 较高）
  const slipperId = autoId++
  items.value.push({
    id: slipperId,
    x: 0,
    keyframes: createSlipperAnimation(startX, startY, targetX, targetY, height),
    svg: slipperSvg,
    width: 60,
    height: 132,
    duration: 2500,
    zIndex: 10
  })

  // 2. 延迟添加鞋印（拖鞋到达目标位置时出现）
  setTimeout(() => {
    const printId = autoId++
    items.value.push({
      id: printId,
      x: 0,
      keyframes: createPrintAnimation(printX, printY),
      svg: slipperPrintSvg,
      width: 60,
      height: 130,
      duration: 2500, // 从出现到渐隐的时间
      zIndex: 5
    })

    // 鞋印动画结束后自动移除
    setTimeout(() => {
      remove(printId)
    }, 2500)
  }, 600) // 拖鞋到达目标位置的时间
}

const remove = (id: number) => {
  items.value = items.value.filter((i) => i.id !== id)
}

defineExpose({
  throwFlower,
  throwSlipper
})
</script>

<template>
  <FlyingItem
    v-for="item in items"
    :id="item.id"
    :key="item.id"
    :svg="item.svg"
    :keyframes="item.keyframes"
    :duration="item.duration"
    :width="item.width"
    :height="item.height"
    :z-index="item.zIndex"
    @done="remove"
  />
</template>

<style scoped></style>
