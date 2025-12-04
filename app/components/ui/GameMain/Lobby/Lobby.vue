<template>
  <div class="flex h-full">
    <UiGameMainLobbyRoomList class="w-[74.4%]" />

    <div class="flex-1 flex flex-col bg-tint-soft-400 border-l-2 border-white/60">
      <UiGameMainChatPanel
        class="flex-1 max-w-[227.89px]"
        :style="{ '--action-text-color': '#7f7f7f', '--system-text-color': '#d4bea9' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
