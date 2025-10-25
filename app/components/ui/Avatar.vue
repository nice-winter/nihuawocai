<template>
  <UPopover
    :content="{
      align: 'end',
      side: 'right',
      sideOffset: 8
    }"
    arrow
  >
    <UAvatar class="game-avatar" :src="player.avatar" />

    <template #content>
      <div class="w-30 h-50 inline-flex bg-[#f5e4d2]">
        <UAvatar class="game-avatar w-30 h-30" :src="player.avatar" />
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import type { Player } from '~/interfaces/player'

interface AvatarProps {
  player: Player
}

const { player } = defineProps<AvatarProps>()
</script>

<style scoped></style>
