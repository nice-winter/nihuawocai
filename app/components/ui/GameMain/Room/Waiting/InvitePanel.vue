<template>
  <UTabs :items="tabItems" size="xs" class="game-tabs select-none">
    <template #user1>
      <div class="flex h-56 flex-col">
        <div class="flex flex-1 flex-col gap-2 max-w-[227.89px] p-tight">
          <div
            v-for="player in currentPageItems"
            :key="player.id"
            class="flex w-full items-center gap-0.5"
          >
            <UiAvatar
              :player="player"
              position="right-start"
              :verified-icon="{ show: true, size: 12, right: -3, bottom: -3 }"
              class="size-6.5"
            />

            <UiGenderIcon :gender="player.gender" />

            <span class="flex-1 max-w-[103.77px] truncate text-sm2">
              {{ player.nickname }}
            </span>

            <UiButton
              size="sm"
              color="red"
              :disabled="Boolean(roomStore.inviteRecord.get(player.id))"
              @click="async () => await invite(player.id)"
            >
              {{ !roomStore.inviteRecord.get(player.id) ? '邀请' : '已邀请' }}
            </UiButton>
          </div>
        </div>

        <div class="h-px w-full bg-surface-300" />

        <div class="flex h-8 items-center justify-center gap-9.5 border-t border-t-white/60">
          <UiLinkButton class="text-sm2" type="button" @click="prevPage"> 上一页 </UiLinkButton>

          <div class="h-4 w-0.5 border-l border-l-surface-300 bg-white/60" />

          <UiLinkButton class="text-sm2" type="button" @click="nextPage"> 下一页 </UiLinkButton>
        </div>
      </div>
    </template>

    <template #user2>
      <div class="h-56"></div>
    </template>
  </UTabs>
</template>

<script setup lang="ts">
const playerStore = usePlayerStore()
const { getLobbyPlayers } = playerStore
const { lobbyPlayers } = storeToRefs(playerStore)
const roomStore = useRoomStore()
const { invite } = roomStore
const { currentPageItems, prevPage, nextPage } = usePaginatedMap(lobbyPlayers.value, 5)

onMounted(() => {
  getLobbyPlayers()
})

const tabItems = [
  {
    label: '空闲玩家',
    slot: 'user1'
  },
  {
    disabled: true,
    label: '同城玩家',
    slot: 'user2'
  }
]
</script>

<style scoped></style>
