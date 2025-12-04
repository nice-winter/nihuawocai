<template>
  <div class="p-tight w-1/2 h-1/3">
    <div v-if="ownerPlayer" class="flex flex-col gap-[0.7rem] select-none">
      <div class="h-16 flex gap-[0.7rem]">
        <UiAvatar class="size-16" :player="ownerPlayer" :verified-icon="{ show: true }" />

        <div class="relative flex-1">
          <UTooltip text="非公开房间" :delay-duration="500" :content="{ side: 'right' }">
            <UIcon
              v-show="roomInfo.locked"
              name="ph:lock-simple-fill"
              class="size-4 absolute left-0 top-0 text-[#f4b12d]"
            />
          </UTooltip>

          <UiGameMainRoomNumber :room-number="roomInfo.roomNumber || 0" class="float-right" />
          <span class="absolute right-0 bottom-0 max-w-[233px] text-sm leading-3.5 truncate">
            <UiGenderIcon :gender="ownerPlayer.gender" class="align-text-top" />
            {{ ownerPlayer.nickname }}
          </span>
        </div>
      </div>

      <div
        class="min-h-[46px] flex"
        :class="[openSeatCount >= 7 ? `justify-between` : `gap-[6.666px]`]"
      >
        <template v-for="(i, index) in openSeatCount - 1" :key="playersWithoutOwner[index]?.id">
          <UiAvatar
            v-if="playersWithoutOwner[index]"
            class="size-[46px]"
            :verified-icon="{ show: true }"
            :player="playersWithoutOwner[index]"
          />
          <span v-else class="size-[46px] inline-block bg-surface-550" />
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
          :disabled="roomInfo.onlookers.length >= roomInfo.options.maxOnlookers"
          @click="emit('lookButtonClick', roomInfo.roomNumber)"
        >
          旁观ㅤ{{ roomInfo.onlookers.length }}/{{ roomInfo.options.maxOnlookers }}
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type RoomListItemProps = RoomInfo

const { roomInfo } = defineProps<{ roomInfo: RoomListItemProps }>()

const playersWithoutOwner = computed(() =>
  roomInfo.players.filter((p) => p && p.id !== roomInfo.owner)
)
const ownerPlayer = computed(() => roomInfo.players.find((p) => p?.id === roomInfo.owner))
const totalPlayerCount = computed(() => roomInfo.players.filter((p) => p).length)
const openSeatCount = computed(() => roomInfo.seats.filter((s) => s).length)

const emit = defineEmits<{
  (e: 'joinButtonClick' | 'lookButtonClick', roomNumber: number): void
}>()
</script>
