<template>
  <span class="text-[3.5rem] leading-12 font-black italic text-[#ecd3c1] select-none">
    {{ displayText }}
  </span>
</template>

<script setup lang="ts">
interface RoomNumberProps {
  roomNumber: number
}

const { roomNumber } = defineProps<RoomNumberProps>()

const displayText = computed(() => roomNumber.toString().padStart(3, '0'))
</script>

<style scoped>
span {
  text-shadow: -2px -0.5px 0px #cbad91;
}
</style>
