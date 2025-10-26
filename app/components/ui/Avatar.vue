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
    >
      <UAvatar v-if="player" class="game-avatar size-full cursor-pointer" :src="player.avatar" />
      <template #content>
        <div class="w-35 h-75 inline-flex flex-col select-none bg-[#EFC189] custom-bg">
          <div class="p-1.5">
            <UAvatar class="game-avatar size-32" :src="player?.avatar" />
          </div>

          <span class="pr-1.5 pl-1.5 text-[13px] text-(--game-primary-color) text-light">
            <UiGenderIcon :gender="player?.gender" class="align-text-bottom" />
            {{ player?.nickname }}
          </span>

          <div class="mt-4 flex flex-col gap-1 p-2 bg-[#c5630e69]">
            <div class="flex flex-row text-(--game-primary-color)">
              <span class="text-[1rem] font-bold italic min-w-[42px]">LV.60</span>
              <span class="text-right text-[12px] mt-1.5 ml-[0.6rem] leading-none">空前绝后</span>
            </div>

            <div class="flex flex-col text-[12px]">
              <span class="text-[#804B19]">
                鲜ㅤ花：
                <span class="text-(--game-primary-color)">{{ player?.exinfo.flowers }}</span>
              </span>
              <span class="text-[#804B19]">
                盘ㅤ数：
                <span class="text-(--game-primary-color)">{{ player?.exinfo.count }}</span>
              </span>
            </div>
          </div>
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

<style scoped>
.custom-bg {
  background-image: url(~/assets/icons/common-bg-texture.jpg);
  background-repeat: repeat;
  background-size: 46px;
}
</style>
