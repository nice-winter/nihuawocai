<script setup lang="ts">
import FlyingItem, { type IKeyframe } from './FlyingItem.vue'
import { createFlowerAnimation } from '@/animations/flower'
import flowerSvg from '@/assets/icons/flower.svg?raw'

interface Props {
  container: HTMLElement | null
}

const { container } = defineProps<Props>()

interface Item {
  id: number
  x: number
  keyframes: IKeyframe[]
  svg: string
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
      svg: flowerSvg
    })
  }
}

const remove = (id: number) => {
  items.value = items.value.filter((i) => i.id !== id)
}

defineExpose({
  throwFlower
})
</script>

<template>
  <FlyingItem
    v-for="item in items"
    :id="item.id"
    :key="item.id"
    :svg="item.svg"
    :keyframes="item.keyframes"
    :duration="1000"
    :width="90"
    :height="90"
    @done="remove"
  />
</template>

<style lang="css" scoped></style>
