<template>
  <div v-if="currentRoom" class="flex h-full">
    <div class="flex w-main-w-left flex-col">
      <UiGameMainRoomWaiting v-if="!currentRoom.playing" :room-info="currentRoom" />
      <UiGameMainRoomPlaying v-else-if="currentRoom.playing" :room-info="currentRoom" />
    </div>

    <div class="flex flex-1 flex-col border-l-2 border-white/60 bg-tint-soft-400">
      <div class="relative h-16 p-tight">
        <UiLinkButton
          type="button"
          :icon="`ph:arrow-u-up-left-bold`"
          class="absolute right-tight top-5.5 text-sm2"
          @click="leave"
        >
          离开房间
        </UiLinkButton>
      </div>

      <UiGameMainRoomWaitingInvitePanel v-if="!currentRoom.playing" />

      <div v-if="currentRoom.playing" class="w-full h-[166.6px] border-y border-white/50">
        <UiGameMainRoomPlayingToolbar v-if="gameStore.state.draw" class="size-full" />
        <img v-if="!gameStore.state.draw" src="~/assets/banner-painting.webp" class="w-full" />
      </div>

      <UiGameMainChatPanel
        ref="ChatPanelRef"
        class="flex-1 max-w-main-w-right-max"
        :style="{ '--action-text-color': '#7f7f7f', '--system-text-color': '#d4bea9' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const roomStore = useRoomStore()
const gameStore = useGameStore()
const { leave } = roomStore
const { currentRoom } = storeToRefs(roomStore)

const ChatPanelRef = useTemplateRef('ChatPanelRef')
</script>

<style scoped></style>
