<template>
  <div class="flex flex-col h-full">
    <div class="flex flex-row h-16 items-center justify-between px-1">
      <div class="flex flex-col items-center justify-center px-5">
        <UiAvatar :player="drawingPlayer" class="size-10 rounded-md overflow-hidden" />
      </div>

      <div class="flex flex-col items-center justify-center gap-2 text-[13px] select-none">
        <span>第 1/2 轮</span>
        <span>提示：<span class="text-red-600">3个字，食物</span></span>
      </div>

      <div class="w-20">
        <UiGameMainRoomTimer />
      </div>
    </div>

    <UiGameMainRoomPlayingSketchpad class="h-[70%]" />

    <div class="grow basis-0 flex flex-row px-[.785rem] pb-1.5 select-none">
      <div
        v-for="(player, index) in _players"
        :key="player.uuid"
        class="flex flex-col items-center justify-center gap-1 w-[91.7px]"
      >
        <span
          class="w-full h-7 text-[13px] text-center leading-[13px] flex items-end justify-center"
          >{{ player.nickname }}</span
        >
        <UiAvatar
          :player="player"
          class="size-18 rounded-lg overflow-hidden"
          :class="{
            bingo: bingoPlayers[index],
            drawing: player.uuid === drawingPlayer?.uuid
          }"
        />
        <span class="text-[13px] text-[#774A1A]">
          {{ playerScore[index] }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RoomInfo } from '~/interfaces/room'

const { roomInfo } = defineProps<{ roomInfo: RoomInfo }>()

const _players = computed(() => roomInfo.players.filter((p) => p !== null))

const bingoPlayers = [false, true, true, true, false, false, true]
const playerScore = [4, 8, 4, 4, 0, 2, 4]
const drawingPlayer = _players.value[4]
</script>

<style scoped>
.drawing {
  box-shadow:
    0 0 0 4px #e60012,
    0 0 0 6px #00a0e9;
}
.bingo {
  box-shadow: 0 0 0 4.5px #00a0e9;
}
</style>
