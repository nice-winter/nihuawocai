<template>
  <span
    class="inline-flex flex-cow gap-1 cursor-pointer select-none"
    :class="{
      'text-(--game-font-color)': color === 'normal',
      'hover:text-(--game-primary-color)': color === 'normal',
      'text-[#E20032]': color === 'red',
      'hover:text-[#FF0038]': color === 'red'
    }"
  >
    <ULink
      as="button"
      class="text-light cursor-pointer transition-none"
      :class="{
        underline: type === 'link'
      }"
    >
      <slot />
    </ULink>

    <UIcon v-if="icon" :name="icon" />
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
