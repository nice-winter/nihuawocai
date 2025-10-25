<template>
  <div class="p-[0.785rem] w-1/2">
    <div class="flex flex-col gap-[0.7rem] select-none">
      <div class="relative h-16">
        <UiAvatar v-if="author" class="size-16" :player="authorPlayer" />
        <UTooltip text="非公开房间" :delay-duration="500" :content="{ side: 'right' }" arrow>
          <UIcon
            v-show="locked"
            name="ph:lock-simple-fill"
            class="size-4 absolute left-18 top-0 text-[#f4b12d]"
          />
        </UTooltip>
        <UiGameMainRoomNumber :room-number="roomNumber || 0" class="float-right" />
        <span class="absolute right-0 bottom-0 text-sm leading-3.5">
          <UiGenderIcon :gender="authorPlayer.gender" class="align-text-top" />
          {{ authorPlayer.nickname }}
        </span>
      </div>

      <div
        class="flex min-h-[46px]"
        :class="[openSeatCount >= 7 ? `justify-between` : `gap-[6.666px]`]"
      >
        <template v-for="(i, index) in openSeatCount - 1" :key="playersWithOutAuthor[index]?.uuid">
          <UiAvatar
            v-if="playersWithOutAuthor[index]"
            class="size-[46px]"
            :player="playersWithOutAuthor[index]"
          />
          <span v-else class="inline-block size-[46px] bg-[#ddc9a9]" />
        </template>
      </div>

      <div class="pl-[1.5px]">
        <UiButton
          v-show="!playing"
          size="xl"
          color="red"
          :disabled="totalPlayerCount >= openSeatCount"
        >
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
import type { RoomListItemProps } from '~/interfaces/room'

const {
  roomNumber = undefined,
  author = undefined,
  players = [],
  onlookers = [],
  playing = false,
  seats = [],
  locked = false
} = defineProps<RoomListItemProps>()

const playersWithOutAuthor = computed(() => players.filter((p) => p !== null && p.uuid !== author))
const authorPlayer = computed(() => players.find((p) => p?.uuid === author)!)
const totalPlayerCount = computed(() => players.filter((p) => p).length)
const openSeatCount = computed(() => seats.filter((s) => s).length)
</script>
