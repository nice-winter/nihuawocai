<template>
  <div class="relative flex flex-col">
    <div class="relative flex justify-center items-center h-12">
      <div class="w-[900px] h-full">
        <slot name="header" />
      </div>
    </div>

    <div class="min-h-[640px]">
      <slot name="main" />
    </div>

    <div class="relative flex justify-center items-center h-20">
      <div class="w-[900px] h-full">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
