<template>
  <div id="game-frame" class="relative flex flex-col">
    <div id="header" class="relative flex justify-center items-center h-12">
      <div class="w-[900px] h-full">
        <slot name="header" />
      </div>
    </div>

    <div id="main" class="min-h-[640px]">
      <slot name="main" />
    </div>

    <div id="footer" class="relative flex justify-center items-center h-20">
      <div class="w-[900px] h-full">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
