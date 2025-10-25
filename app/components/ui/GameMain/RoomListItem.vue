<template>
  <div class="p-[0.785rem] w-1/2">
    <div class="flex flex-col gap-[0.7rem] select-none">
      <div class="relative">
        <UiAvatar v-if="players[0]" class="size-16" :player="players[0]" />
        <UTooltip text="非公开房间" :delay-duration="500" :content="{ side: 'right' }" arrow>
          <UIcon
            v-show="locked"
            name="ph:lock-simple-fill"
            class="size-4 absolute left-18 top-0 text-[#f4b12d]"
          />
        </UTooltip>
        <UiGameMainRoomNumber :room-number="roomNumber || 0" class="float-right" />
        <span class="absolute right-0 bottom-0 text-sm leading-3.5">
          <UiGenderIcon :gender="players[0]?.gender" class="align-text-top" />
          {{ players[0]?.nickname }}
        </span>
      </div>
      <div class="flex justify-between">
        <template v-for="i in 6" :key="players[i]?.uuid">
          <UiAvatar v-if="players[i]" class="size-[46px]" :player="players[i]" />
          <span v-else class="inline-block w-[46px] h-[46px] bg-[#ddc9a9]" />
        </template>
      </div>
      <div class="pl-[1.5px]">
        <UiButton v-show="!playing" size="xl" color="red" :disabled="players.length >= 7">
          加ㅤ入
        </UiButton>

        <UiButton v-show="playing" size="xl" color="playing" :disabled="onlookers.length >= 5">
          旁观ㅤ{{ onlookers.length }}/5
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Player } from '~/interfaces/player'
import type { RoomListItemProps } from '~/interfaces/room'

const {
  roomNumber = undefined,
  players = [],
  onlookers = [],
  playing = false,
  locked = false
} = defineProps<RoomListItemProps>()
</script>
