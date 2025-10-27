<template>
  <div class="flex flex-row h-full">
    <div class="flex flex-col w-[74.4%]">
      <UiGameMainRoomWaiting :room-info="roomInfo" />
    </div>

    <div class="grow flex flex-col bg-[#f1d0ae42] border-l-2 border-white/60">
      <div class="relative p-[.785rem] h-16">
        <UiLinkButton
          type="button"
          :icon="`ph:arrow-u-up-left-bold`"
          class="absolute top-5.5 right-[.785rem] text-[13px]"
        >
          离开房间
        </UiLinkButton>
      </div>

      <UiGameMainRoomWaitingInvitePanel />

      <UiGameMainChatPanel class="grow max-w-[227.89px]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { roomList, players } from '~/stores/test'

const roomInfo = reactive(roomList[0]!)
</script>

<style scoped></style>
