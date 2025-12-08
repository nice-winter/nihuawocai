<template>
  <div id="game-frame" class="relative flex flex-col">
    <div id="header" class="relative flex h-12 items-center justify-center">
      <div class="h-full w-[900px]">
        <slot name="header" />
      </div>
    </div>

    <div id="main" class="min-h-[640px]">
      <slot name="main" />
    </div>

    <div id="footer" class="relative flex h-20 items-center justify-center">
      <div class="h-full w-[900px]">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
