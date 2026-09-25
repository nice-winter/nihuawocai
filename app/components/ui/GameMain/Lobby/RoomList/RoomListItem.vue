<template>
  <li class="w-1/2 h-1/3 p-tight">
    <div v-if="ownerPlayer" class="flex h-full flex-col justify-between select-none">
      <div class="flex h-16 w-full gap-[0.7rem]">
        <UiAvatar class="size-16" :player="ownerPlayer" :verified-icon="{ show: true }" />

        <div class="relative flex-1">
          <UTooltip text="非公开房间" :delay-duration="500" :content="{ side: 'right' }" :ui="{ content: 'game-tooltip' }">
            <UIcon
              v-show="room.hasPassword"
              name="ph:lock-simple-fill"
              class="absolute left-0 top-0 size-4 text-amber-400"
            />
          </UTooltip>

          <UiGameMainRoomNumber :room-number="room.roomNumber || 0" class="float-right" />

          <span class="absolute right-0 bottom-0 max-w-[233px] text-sm leading-3.5 truncate">
            <UiGenderIcon :gender="ownerPlayer.gender" class="align-text-top" />
            {{ ownerPlayer.nickname }}
          </span>
        </div>
      </div>

      <div
        class="flex min-h-[46px]"
        :class="[openSeatCount >= 7 ? `justify-between` : `gap-[6.666px]`]"
      >
        <template v-for="(i, index) in openSeatCount - 1" :key="playersWithoutOwner[index]?.id">
          <UiAvatar
            v-if="playersWithoutOwner[index]"
            class="size-[46px]"
            :verified-icon="{ show: true }"
            :player="playersWithoutOwner[index]"
          />
          <span v-else class="inline-block size-[46px] bg-surface-550" />
        </template>
      </div>

      <div class="flex justify-center">
        <UiButton
          v-if="!room.isPlaying"
          size="xl"
          color="red"
          :disabled="totalPlayerCount >= openSeatCount"
          @click="emit('joinButtonClick', room.id, room.roomNumber)"
        >
          加ㅤ入
        </UiButton>

        <UiButton
          v-else
          size="xl"
          color="playing"
          :disabled="room.onlookers.length >= room.joinOptions.maxOnlookers"
          @click="emit('onlookerButtonClick', room.id, room.roomNumber)"
        >
          旁观ㅤ{{ room.onlookers.length }}/{{ room.joinOptions.maxOnlookers }}
        </UiButton>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
type RoomListItemProps = RoomSummary

const { room } = defineProps<{ room: RoomListItemProps }>()

const playersWithoutOwner = computed(() =>
  room.players.filter((p) => p && p.id !== room.ownerId)
)

const ownerPlayer = computed(() => room.players.find((p) => p?.id === room.ownerId))

const totalPlayerCount = computed(() => room.players.filter((p) => p).length)

const openSeatCount = computed(() => room.seatOpenFlags.filter((s) => s).length)

const emit = defineEmits<{
  (e: 'joinButtonClick' | 'onlookerButtonClick', roomId: string, roomNumber: number): void
}>()
</script>
