<template>
  <span class="room-number">{{ displayText }}</span>
</template>

<script setup lang="ts">
interface RoomNumberProps {
  roomNumber: number
}

const { roomNumber } = defineProps<RoomNumberProps>()

const displayText = computed(() => roomNumber.toString().padStart(3, '0'))
</script>

<style scoped>
span.room-number {
  font-size: 3.5rem;
  line-height: 3rem;
  font-weight: bolder;
  font-style: italic;
  color: #ecd3c1;
  text-shadow: -2px -0.5px 0px #cbad91;
  user-select: none;
}
</style>
