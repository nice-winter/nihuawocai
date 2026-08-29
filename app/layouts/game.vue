<template>
  <div class="w-full min-w-5xl flex justify-center custom-bg">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.custom-bg {
  --line-color: #eae0d0ba;
  --size: 24px;
  background-color: antiquewhite;
  background-image:
    linear-gradient(var(--line-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--line-color) 1px, transparent 1px);
  background-size: var(--size) var(--size);
}

/* 游戏内文本色覆盖 @nuxt/ui 默认色 */
:deep(*) {
  --ui-text: var(--color-text-900);
}
</style>
