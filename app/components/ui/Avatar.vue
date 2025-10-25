<template>
  <span
    class="inline-flex items-center justify-center size-8 bg-[#ddc9a9]"
    :class="{ 'cursor-pointer': !disabled }"
    @click="onClick"
  >
    <UPopover
      :content="{
        align: 'end',
        side: 'right',
        sideOffset: 8
      }"
      arrow
    >
      <UAvatar v-if="player" class="game-avatar size-full cursor-pointer" :src="player.avatar" />
      <template #content>
        <div class="w-30 h-50 inline-flex bg-[#f5e4d2]">
          <UAvatar class="game-avatar w-30 h-30" :src="player?.avatar" />
        </div>
      </template>
    </UPopover>

    <slot v-if="!player || !player.avatar" name="placeholder" />

    <template v-if="mode === 'seat' && !player">
      <UIcon v-if="!open" :name="`fe:disabled`" class="text-[#E20032] size-14" />
      <span v-if="open">等待玩家</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import type { Player } from '~/interfaces/player'

interface AvatarProps {
  id?: number | string
  mode?: 'display' | 'seat'
  disabled?: boolean
  player?: Player
}

const {
  id = undefined,
  mode = 'display',
  disabled = true,
  player = undefined
} = defineProps<AvatarProps>()

const open = defineModel<boolean>('open', { default: true })

const emit = defineEmits<{
  (e: 'switch', open: boolean, id?: number | string): void
}>()

const onClick = () => {
  if (mode === 'seat' && !disabled) {
    if (!player) {
      open.value = !open.value
      emit('switch', open.value, id)
    }
  }
}
</script>

<style scoped></style>
