<template>
  <div class="p-[0.785rem] w-1/2">
    <div class="flex flex-col gap-[0.7rem] select-none">
      <div class="relative h-16">
        <UiAvatar class="size-16" :player="ownerPlayer" />

        <UTooltip text="非公开房间" :delay-duration="500" :content="{ side: 'right' }" arrow>
          <UIcon
            v-show="roomInfo.locked"
            name="ph:lock-simple-fill"
            class="size-4 absolute left-18 top-0 text-[#f4b12d]"
          />
        </UTooltip>

        <UiGameMainRoomNumber :room-number="roomInfo.roomNumber || 0" class="float-right" />
        <span class="absolute right-0 bottom-0 text-sm leading-3.5">
          <UiGenderIcon :gender="ownerPlayer.gender" class="align-text-top" />
          {{ ownerPlayer.nickname }}
        </span>
      </div>

      <div
        class="flex min-h-[46px]"
        :class="[openSeatCount >= 7 ? `justify-between` : `gap-[6.666px]`]"
      >
        <template v-for="(i, index) in openSeatCount - 1" :key="playersWithoutOwner[index]?.uuid">
          <UiAvatar
            v-if="playersWithoutOwner[index]"
            class="size-[46px]"
            :player="playersWithoutOwner[index]"
          />
          <span v-else class="inline-block size-[46px] bg-[#ddc9a9]" />
        </template>
      </div>

      <div class="pl-[1.5px]">
        <UiButton
          v-show="!roomInfo.playing"
          size="xl"
          color="red"
          :disabled="totalPlayerCount >= openSeatCount"
          @click="emit('joinButtonClick', roomInfo.roomNumber)"
        >
          加ㅤ入
        </UiButton>

        <UiButton
          v-show="roomInfo.playing"
          size="xl"
          color="playing"
          :disabled="roomInfo.onlookers.length >= 5"
          @click="emit('lookButtonClick', roomInfo.roomNumber)"
        >
          旁观ㅤ{{ roomInfo.onlookers.length }}/5
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RoomInfo } from '#shared/interfaces/room'

type RoomListItemProps = RoomInfo

const { roomInfo } = defineProps<{ roomInfo: RoomListItemProps }>()

const playersWithoutOwner = computed(() =>
  roomInfo.players.filter((p) => p !== null && p.uuid !== roomInfo.owner)
)
const ownerPlayer = computed(() => roomInfo.players.find((p) => p?.uuid === roomInfo.owner)!)
const totalPlayerCount = computed(() => roomInfo.players.filter((p) => p).length)
const openSeatCount = computed(() => roomInfo.seats.filter((s) => s).length)

const emit = defineEmits<{
  (e: 'joinButtonClick' | 'lookButtonClick', roomNumber: number): void
}>()
</script>
