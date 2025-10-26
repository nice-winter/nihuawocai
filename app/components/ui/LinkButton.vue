<template>
  <span
    class="flex flex-cow gap-1 text-(--game-font-color) hover:text-default cursor-pointer select-none"
  >
    <ULink as="button" class="text-[13px] text-light cursor-pointer transition-none">
      <slot />
    </ULink>

    <UIcon v-if="icon" :name="icon" />
  </span>
</template>

<script setup lang="ts">
const { icon = undefined } = defineProps<{
  icon?: string
}>()
</script>

<style scoped></style>
