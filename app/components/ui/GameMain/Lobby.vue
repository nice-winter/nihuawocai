<template>
  <div class="flex flex-row h-full">
    <div class="flex flex-col w-[74.4%]">
      <div class="h-[87.72%] flex flex-wrap relative">
        <div class="z-1 flex flex-wrap">
          <UiGameMainRoomListItem
            v-for="room in Array.from(rooms).slice(0, 6)"
            :key="room.roomNumber"
            :room-info="room"
            @join-button-click="join"
            @look-button-click="look"
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
        <UiButton size="large" color="red" @click="() => console.log('快速开始')">
          快速开始
        </UiButton>
        <div class="px-4 flex gap-2 items-center">
          <UInput
            v-model="roomNumberInputValue"
            size="xs"
            placeholder="房间号"
            maxlength="3"
            class="game-input w-14"
            style="background-color: #fff"
          />
          <UiButton size="small" :disabled="roomNumberInputValue === ''">加入</UiButton>
        </div>
        <UiButton>等待房间</UiButton>
        <UiButton>创建房间</UiButton>
        <div class="px-4 flex gap-8 items-center ml-auto">
          <UiButton type="arrow-left" color="red" />
          <UiButton type="arrow-right" color="red" />
        </div>
      </div>
    </div>
    <div class="grow flex flex-col bg-[#f1d0ae42] border-l-2 border-white/60">
      <UiGameMainChatPanel class="max-w-[227.89px] max-h-[638px]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { roomList } from '~/stores/test'

const roomNumberInputValue = ref('')
const rooms = ref(roomList)

const join = (roomNumber: number) => {
  console.log(`[join]`, roomNumber)
}

const look = (roomNumber: number) => {
  console.log(`[look]`, roomNumber)
}
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
