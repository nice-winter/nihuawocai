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
        <span v-if="isOnlooker" class="text-[13px] text-(--game-normal)">旁观中</span>
        <!-- <UiButton size="sm" @click="b">结束</UiButton> -->
      </div>

      <div class="flex flex-col items-center justify-center w-20">
        <UiGameMainRoomTimer />
      </div>
    </div>

    <div id="sketchpad-container" ref="sketchpadContainerRef" class="relative h-[70%]">
      <UiGameMainRoomPlayingSketchpad />
      <UiThrower ref="throwerRef" :container="sketchpadContainerRef" />
    </div>

    <div class="grow basis-0 flex flex-row px-[.785rem] pb-1.5 select-none">
      <template v-for="(player, index) in _players" :key="player.id">
        <UiGameMainRoomBubble :id="player.id">
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
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RoomInfo } from '#shared/interfaces/room'
import ThrowerModal from '~/components/ui/ThrowerModal.vue'
import RankModal from '~/components/ui/RankModal.vue'
import { mockdata } from '#shared/utils/mockdata'

const { roomInfo } = defineProps<{ roomInfo: RoomInfo }>()

const sketchpadContainerRef = useTemplateRef('sketchpadContainerRef')
const throwerRef = useTemplateRef('throwerRef')

const { isOnlooker } = storeToRefs(usePlayerStore())
const { show, destroy, destroyAll } = useBubble('#game-panel')
const throwerModal = useModal(
  ThrowerModal,
  { answer: '爆浆蟑螂' },
  { parent: '#sketchpad-container' }
)
const rankModal = useModal(RankModal, { ranks: mockdata.ranks }, { parent: '#sketchpad-container' })

const _players = computed(() => roomInfo.players.filter((p) => p !== null))

const bingoPlayers = [false, true, true, true, false, false, true]
const playerScore = [4, 8, 4, 4, 10, 0, 4]
const drawingPlayer = _players.value[0]

const b = async () => {
  // throwerRef.value?.throwFlower(1, -400, -60)
  await throwerModal.open()
  //await rankModal.open()
}

useEventBus('chat:event:say', ({ chatmsg, sender }) => {
  show(sender.id, chatmsg)
})
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
