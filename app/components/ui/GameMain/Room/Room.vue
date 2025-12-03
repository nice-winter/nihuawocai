<template>
  <div v-if="currentRoom" class="flex flex-row h-full">
    <div class="flex flex-col w-[74.4%]">
      <UiGameMainRoomWaiting v-if="!currentRoom.playing" :room-info="currentRoom" />
      <UiGameMainRoomPlaying v-else-if="currentRoom.playing" :room-info="currentRoom" />
    </div>

    <div class="grow flex flex-col bg-[#f1d0ae42] border-l-2 border-white/60">
      <div class="relative p-tight h-16">
        <UiLinkButton
          type="button"
          :icon="`ph:arrow-u-up-left-bold`"
          class="absolute top-5.5 right-tight text-sm2"
          @click="leave"
        >
          离开房间
        </UiLinkButton>
      </div>

      <UiGameMainRoomWaitingInvitePanel v-if="!currentRoom.playing" />

      <div v-if="currentRoom.playing" class="h-[166.6px] w-full border-y border-y-white/50">
        <UiGameMainRoomPlayingToolbar v-if="gameStore.state.draw" class="size-full" />
        <img v-if="!gameStore.state.draw" src="~/assets/banner-painting.webp" class="w-full" />
      </div>

      <UiGameMainChatPanel
        ref="ChatPanelRef"
        class="grow max-w-[227.89px]"
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
