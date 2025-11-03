<template>
  <span
    class="relative inline-flex items-center justify-center size-4 bg-[#ddc9a9]"
    :class="{ 'cursor-pointer': !disabled }"
    @click="onClick"
  >
    <UPopover
      :content="{
        side: (position.split('-')[0] as Side) || 'right',
        align: (position.split('-')[1] as Align) || 'end',
        sideOffset: 8,
        collisionBoundary: panelDom
      }"
    >
      <UAvatar
        v-if="player"
        class="game-avatar size-full cursor-pointer"
        :src="player.avatar_url"
      />
      <img
        v-if="player?.verification.verified"
        class="absolute right-0 bottom-0 size-3"
        src="~/assets/icons/verified-v.png"
      />

      <template #content>
        <div class="w-35 h-75 inline-flex flex-col select-none bg-[#EFC189] custom-bg">
          <div class="relative p-1.5">
            <UAvatar class="game-avatar size-32" :src="player?.avatar_url" />
          </div>

          <span class="px-1.5 text-[13px] truncate">
            <UiGenderIcon :gender="player?.gender" class="align-text-bottom" />
            {{ player?.nickname }}
          </span>

          <span
            class="w-full h-4.5 flex items-center gap-1.5 px-1.5 text-xs truncate"
            style="margin: 2px 0 6px 0"
          >
            <template v-if="player?.verification.verified">
              <img class="size-3.5 inline-block align-middle" src="~/assets/icons/verified-v.png" />
              <span class="text-[#804B19]">{{ player.verification.verified_description }}</span>
            </template>
          </span>

          <div class="px-3.5 py-2 flex flex-col gap-1 bg-[#c5630e69]">
            <div class="inline-flex items-end gap-2">
              <span class="text-base font-bold italic leading-4 min-w-10.5">LV.60</span>
              <span class="text-xs leading-[15px] grow">空前绝后</span>
            </div>

            <div class="flex flex-col gap-1">
              <div class="h-3.5 text-xs leading-3.5 inline-flex items-end gap-0.5">
                <span class="text-[#804B19] min-w-[42px]"> 鲜ㅤ花： </span>
                <span class="grow leading-[13px]">{{ player?.exinfo.flowers }}</span>
              </div>

              <div class="h-3.5 text-xs leading-3.5 inline-flex items-end gap-0.5">
                <span class="text-[#804B19] min-w-[42px]"> 盘ㅤ数： </span>
                <span class="grow leading-[13px]">{{ player?.exinfo.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UPopover>

    <slot v-if="!player || !player.avatar_url" name="placeholder" />

    <template v-if="mode === 'seat' && !player">
      <UIcon v-if="!open" :name="`fe:disabled`" class="text-[#E20032] size-14" />
      <span v-if="open" class="text-[.8rem]">等待玩家</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import type { Player } from '#shared/interfaces/player'

interface AvatarProps {
  id?: number | string
  mode?: 'display' | 'seat'
  disabled?: boolean
  player?: Player
  position?: `${Side}-${Align}`
}
type Side = 'top' | 'right' | 'bottom' | 'left'
type Align = 'end' | 'start' | 'center'

const {
  id = undefined,
  mode = 'display',
  disabled = true,
  player = undefined,
  position = 'right-end'
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

const panelDom = ref<Element | null>(null)
onMounted(() => {
  panelDom.value = document.querySelector('#game-panel')
})
</script>

<style scoped>
.custom-bg {
  background-image: url(~/assets/texture.webp);
  background-repeat: repeat;
  background-size: 46px;
}
</style>
