<template>
  <div class="p-[0.785rem] w-1/2">
    <div class="flex flex-col gap-[0.7rem] select-none">
      <div class="relative">
        <UAvatar class="w-16 h-16 game-avatar" :src="players[0]?.avatar" />
        <UTooltip
          :default-open="true"
          text="非公开房间"
          :delay-duration="500"
          :content="{ side: 'right' }"
          arrow
        >
          <UIcon
            v-show="locked"
            name="ph:lock-simple-fill"
            class="size-4 absolute left-18 top-0 text-[#f4b12d]"
          />
        </UTooltip>
        <UiGameMainRoomNumber :room-number="roomNumber || 0" class="float-right" />
        <span class="absolute right-0 bottom-0 text-sm leading-3.5">
          <UIcon
            :name="players[0]?.gender ? `ph:gender-female-bold` : `ph:gender-male-bold`"
            class="size-4 align-text-bottom"
            :class="players[0]?.gender ? 'text-[#ff7cb2]' : 'text-[rgb(94,191,255)]'"
          />
          {{ players[0]?.nickname }}
        </span>
      </div>
      <div class="flex justify-between">
        <template v-for="i in 6" :key="players[i]?.uuid">
          <UAvatar
            v-if="players[i] && players[i].avatar"
            class="w-[46px] h-[46px] game-avatar"
            :src="players[i].avatar"
          />
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
