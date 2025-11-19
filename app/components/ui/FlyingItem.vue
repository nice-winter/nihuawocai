<script lang="ts" setup>
export interface IKeyframe extends Keyframe {
  transform: string
  opacity: number
}

interface Props {
  id: number
  svg: string
  keyframes: IKeyframe[]
  duration: number
  width: number
  height: number
}

const { id, svg, keyframes, duration, width, height } = defineProps<Props>()

const emit = defineEmits<{
  (e: 'done', id: number): void
}>()

onMounted(() => {
  const el = document.getElementById(`item-${id}`)
  if (!el) return

  el.animate(keyframes, {
    duration,
    fill: 'forwards'
  }).onfinish = () => emit('done', id)
})
</script>

<template>
  <div
    :id="`item-${id}`"
    class="flying-item"
    :style="{
      width: width + 'px',
      height: height + 'px'
    }"
    v-html="svg"
  />
</template>

<style scoped>
.flying-item {
  position: absolute;
  pointer-events: none;
}

.flying-item:deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
