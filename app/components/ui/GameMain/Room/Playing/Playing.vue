<template>
  <div id="game-playing" class="relative flex flex-col h-full">
    <div class="flex flex-row h-16 items-center justify-between px-1">
      <div class="flex flex-col items-center justify-center w-20">
        <UiAvatar
          :player="drawingPlayer"
          class="size-10 rounded-md overflow-hidden"
          :verified-icon="{ show: true, size: 12 }"
        />
      </div>

      <div class="w-11 h-full"></div>

      <div class="w-32 flex flex-col items-center justify-center gap-2 text-[13px] p-2 select-none">
        <span>第 1/2 轮</span>
        <span>题目是：<span class="text-red-600">爆浆蟑螂</span></span>
      </div>

      <div class="w-12">
        <UiButton size="sm" @click="b">气泡</UiButton>
      </div>

      <div class="flex flex-col items-center justify-center w-20">
        <UiGameMainRoomTimer />
      </div>
    </div>

    <UiGameMainRoomPlayingSketchpad class="h-[70%]" />

    <div class="grow basis-0 flex flex-row px-[.785rem] pb-1.5 select-none">
      <UiGameMainRoomBubble v-for="(player, index) in _players" :id="player.id" :key="player.id">
        <div class="flex flex-col items-center justify-center gap-1 w-[91.7px]">
          <span
            class="w-full h-7 text-[13px] text-center leading-[13px] flex items-end justify-center"
            >{{ player.nickname }}</span
          >
          <UiAvatar
            :player="player"
            class="size-18 rounded-lg overflow-hidden"
            :class="{
              bingo: bingoPlayers[index],
              drawing: player.id === drawingPlayer?.id
            }"
            :verified-icon="{ show: true, size: 12, bottom: 2, right: 2 }"
          />
          <span class="text-[13px] text-[#774A1A]">
            {{ playerScore[index] }}
          </span>
        </div>
      </UiGameMainRoomBubble>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RoomInfo } from '#shared/interfaces/room'

const { roomInfo } = defineProps<{ roomInfo: RoomInfo }>()

const { show, destroy, destroyAll } = useBubble('#game-panel')

const _players = computed(() => roomInfo.players.filter((p) => p !== null))

const bingoPlayers = [false, true, true, true, false, false, true]
const playerScore = [4, 8, 4, 4, 10, 0, 4]
const drawingPlayer = _players.value[4]

const b = () => {
  show('76561198413318292', '你好啊啊{:30:}')
  show('28332824', Date.now().toString())
}
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
