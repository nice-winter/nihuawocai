<template>
  <div class="flex h-36 select-none">
    <ul class="w-16 flex flex-col justify-evenly text-white text-sm font-cuyuan">
      <li class="px-2">积 分</li>
      <li class="px-2">鲜 花</li>
      <li class="px-2">人 气</li>
    </ul>

    <div class="flex-1 flex justify-between items-center px-4">
      <div v-for="i in 6" :key="i" class="w-24 h-full flex flex-col justify-between">
        <div
          class="size-24 flex justify-center items-center bg-tint-dark-400 border-2 border-(--border-color) rounded-md"
        >
          <div class="size-18 flex justify-center items-center border-2 border-(--border-color)">
            <span class="text-(--border-color) text-[2rem]">?</span>
          </div>
        </div>

        <span class="text-sm2 text-center text-wood-450 text-shadow-light truncate">虚位以待</span>
        <span class="text-sm2 text-center text-wood-450 text-shadow-light truncate">0</span>
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
