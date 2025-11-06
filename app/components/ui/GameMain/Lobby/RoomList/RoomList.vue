<template>
  <div class="flex flex-col">
    <div class="h-[87.72%] flex flex-wrap relative">
      <div class="z-1 flex flex-wrap">
        <UiGameMainLobbyRoomListItem
          v-for="room in Array.from(rooms).slice(0, 6)"
          :key="room.roomNumber"
          :room-info="room"
          @join-button-click="join"
          @look-button-click="() => join(room.roomNumber, true)"
        />
      </div>
      <div class="flex flex-wrap w-full h-full absolute">
        <div
          v-for="i in 6"
          :key="i + Date.now()"
          class="w-1/2 border border-white/60 custom-border-item"
        />
      </div>
    </div>
    <div
      class="grow flex items-center gap-4 p-[0.785rem] bg-[#f1d0ae42] border-t-2 border-white/60"
    >
      <UiButton size="lg" color="red" @click="quickMatch"> 快速开始 </UiButton>
      <div class="px-4 flex gap-2 items-center">
        <UInput
          v-model="roomNumberInputValue"
          size="xs"
          placeholder="房间号"
          maxlength="3"
          class="game-input w-14"
          style="background-color: #fff"
        />
        <UiButton
          size="sm"
          :disabled="roomNumberInputValue === ''"
          @click="() => join(Number(roomNumberInputValue))"
          >加入</UiButton
        >
      </div>
      <UiButton @click="showOnlyWaitingRooms = !showOnlyWaitingRooms">{{
        showOnlyWaitingRooms ? '等待房间' : '全部房间'
      }}</UiButton>
      <UiButton @click="createRoom">创建房间</UiButton>
      <div class="px-4 flex gap-8 items-center ml-auto">
        <UiButton type="arrow-left" color="red" @click="prevPage" />
        <UiButton type="arrow-right" color="red" @click="nextPage" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mockdata } from '#shared/utils/mockdata'

const gameRoomListStore = useGameRoomListStore()
const { join, prevPage, nextPage, createRoom, quickMatch } = gameRoomListStore
const { showOnlyWaitingRooms } = storeToRefs(gameRoomListStore)

const roomNumberInputValue = ref('')
const rooms = ref(mockdata.roomList)
</script>

<style scoped>
.custom-border-item:nth-child(1),
.custom-border-item:nth-child(2) {
  border-top: none;
}

.custom-border-item:nth-child(5),
.custom-border-item:nth-child(6) {
  border-bottom: none;
}

.custom-border-item:nth-child(1),
.custom-border-item:nth-child(3),
.custom-border-item:nth-child(5) {
  border-left: none;
}

.custom-border-item:nth-child(2),
.custom-border-item:nth-child(4),
.custom-border-item:nth-child(6) {
  border-right: none;
}
</style>
