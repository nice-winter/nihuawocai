<template>
  <div class="flex h-36 select-none">
    <ul class="flex w-16 flex-col justify-evenly font-cuyuan text-sm text-white">
      <li class="px-2">积 分</li>
      <li class="px-2">鲜 花</li>
      <li class="px-2">人 气</li>
    </ul>

    <div class="flex flex-1 items-center justify-between px-4">
      <div v-for="i in 6" :key="i" class="flex h-full w-24 flex-col justify-between">
        <div
          class="flex size-24 items-center justify-center rounded-md border-2 border-(--border-color) bg-tint-dark-400"
        >
          <div class="flex size-18 items-center justify-center border-2 border-(--border-color)">
            <span class="text-(--border-color) text-[2rem]">?</span>
          </div>
        </div>

        <span class="truncate text-center text-sm2 text-wood-450 text-shadow-light">
          虚位以待
        </span>
        <span class="truncate text-center text-sm2 text-wood-450 text-shadow-light"> 0 </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
div {
  --border-color: #ffd7a1;
}
</style>
