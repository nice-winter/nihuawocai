<template>
  <div class="game-main-panel__lobby">
    <div class="lobby left-wrapper">
      <div class="list">
        <div class="item-wrapper">
          <UiGameMainRoomListItem
            v-for="room in Array.from(rooms).slice(0, 6)"
            :key="room.roomNumber"
            :players="room.players"
            :onlookers="room.onlookers"
            :playing="room.playing"
            :room-number="room.roomNumber"
            :locked="room.locked"
          />
        </div>
        <div class="border-wrapper">
          <div v-for="i in 6" :key="i + Date.now()" class="border-item" />
        </div>
      </div>
      <div class="actions">
        <UiButton size="large" color="red" @click="() => console.log('快速开始')">
          快速开始
        </UiButton>
        <div style="padding: 0 1rem; display: flex; gap: 8px; align-items: center">
          <UInput
            v-model="roomNumberInputValue"
            size="sm"
            placeholder="房间号"
            style="width: 3.5rem"
          />
          <UiButton size="small" :disabled="roomNumberInputValue === ''">加入</UiButton>
        </div>
        <UiButton>等待房间</UiButton>
        <UiButton>创建房间</UiButton>
        <div
          style="padding: 0 1rem; display: flex; gap: 2rem; align-items: center; margin-left: auto"
        >
          <UiButton type="arrow-left" color="red" />
          <UiButton type="arrow-right" color="red" />
        </div>
      </div>
    </div>
    <div class="lobby right-wrapper">
      <UiGameMainChatPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { roomList } from '~/assets/common/test'

const roomNumberInputValue = ref('')
const rooms = ref(roomList)
</script>

<style scoped>
.game-main-panel__lobby {
  display: flex;
  flex-direction: row;
  height: 100%;
}

.lobby.left-wrapper {
  display: flex;
  flex-direction: column;
  width: 74.4%;

  .list {
    height: 87.72%;
    display: flex;
    flex-wrap: wrap;
    position: relative;

    .border-wrapper {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      height: 100%;
      position: absolute;
      z-index: 1;
    }

    .item-wrapper {
      z-index: 2;
      display: flex;
      flex-wrap: wrap;
    }

    .border-item {
      width: 50%;
      border: 1px solid color(srgb 1 1 1 / 0.6);

      &:nth-child(1),
      &:nth-child(2) {
        border-top: none;
      }

      &:nth-child(5),
      &:nth-child(6) {
        border-bottom: none;
      }

      &:nth-child(1),
      &:nth-child(3),
      &:nth-child(5) {
        border-left: none;
      }

      &:nth-child(2),
      &:nth-child(4),
      &:nth-child(6) {
        border-right: none;
      }
    }
  }
  .actions {
    flex-grow: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.785rem;
    background-color: #f1d0ae42;
    border-top: 2px solid color(srgb 1 1 1 / 0.6);
  }
}
.lobby.right-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #f1d0ae42;
  border-left: 2px solid color(srgb 1 1 1 / 0.6);
}
</style>
