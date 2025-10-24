<template>
  <div class="relative flex justify-center items-center">
    <div
      class="relative z-20 w-[900px] h-[640px] rounded-[14px] overflow-hidden border border-[#eae0d0] bg-[#f7ebdf] shadow-[0_0_4px_2px_rgb(176,129,73)] custom-foreground-bg"
    >
      <slot />
    </div>
    <div
      class="absolute z-10 w-[900px] h-[640px] rounded-[14px] bg-[#cdb69b] shadow-[0_0_4px_2px_rgb(176,129,73)] rotate-[-1.6deg] custom-background-bg"
    />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.custom-foreground-bg {
  background-image:
    linear-gradient(#eae0d0 1px, transparent 1px),
    linear-gradient(90deg, #eae0d0 1px, transparent 1px);
  background-size: 16px 16px;
}

.custom-background-bg {
  background-image: repeating-linear-gradient(
    -45deg,
    #b19b79 0,
    #c3b6a2 1px,
    #cdb59a 1px,
    #cdb59a 3px
  );
}
</style>
