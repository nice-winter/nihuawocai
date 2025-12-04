<template>
  <span class="inline-flex flex-cow gap-1 cursor-pointer select-none">
    <ULink
      as="button"
      class="text-shadow-light cursor-pointer transition-none"
      :class="{
        underline: type === 'link',
        'select-text': type === 'link',
        'text-text-600': color === 'normal',
        'hover:text-text-900': color === 'normal',
        'text-game-red-500': color === 'red',
        'hover:text-game-red-400': color === 'red'
      }"
    >
      <slot />
      <UIcon v-if="icon" :name="icon" />
    </ULink>
  </span>
</template>

<script setup lang="ts">
const {
  icon = undefined,
  type = 'link',
  color = 'normal'
} = defineProps<{
  icon?: string
  type?: 'link' | 'button'
  color?: 'normal' | 'red'
}>()
</script>

<style scoped></style>
