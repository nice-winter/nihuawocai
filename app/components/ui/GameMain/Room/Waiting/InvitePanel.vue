<template>
  <UTabs :items="tabItems" size="xs" class="game-tabs select-none">
    <template #user1>
      <div class="h-56 flex flex-col">
        <div class="grow flex flex-col gap-2 p-[.785rem] max-w-[227.89px]">
          <div
            v-for="player in playerList"
            :key="player.id"
            class="flex flex-row items-center gap-0.5 w-full"
          >
            <UiAvatar
              :player="player"
              position="right-start"
              :verified-icon="{ show: true, size: 12, right: -3, bottom: -3 }"
              class="size-6.5"
            />

            <UiGenderIcon :gender="player.gender" />

            <span class="grow text-[13px] max-w-[103.77px] truncate">
              {{ player.nickname }}
            </span>

            <UiButton size="sm" color="red" @click="inviteClick(player)"> 邀请 </UiButton>
          </div>
        </div>

        <USeparator orientation="horizontal" class="w-full" />

        <div
          class="flex flex-row justify-center items-center gap-9.5 h-8 border-t border-t-white/90"
        >
          <UiLinkButton class="text-[13px]" type="button" @click="previousPageClick"
            >上一页</UiLinkButton
          >
          <div class="w-0.5 h-4 border-l border-l-gray-200 bg-white/90" />
          <UiLinkButton class="text-[13px]" type="button" @click="nextPageClick"
            >下一页</UiLinkButton
          >
        </div>
      </div>
    </template>
    <template #user2>
      <div class="h-56"></div>
    </template>
  </UTabs>
</template>

<script setup lang="ts">
import { mockdata } from '#shared/utils/mockdata'
import type { Player } from '#shared/interfaces/player'

const tabItems = [
  {
    label: '空闲玩家',
    icon: 'ph:user-check-fill',
    slot: 'user1'
  },
  {
    disabled: true,
    label: '同城玩家',
    icon: 'ph:users-fill',
    slot: 'user2'
  }
]

const playerList = ref(mockdata.players.slice(0, 5))

const inviteClick = (player: Player) => {
  console.log(`[invite]`, 'invite player:', player)
}

const previousPageClick = () => {
  console.log(`[invite]`, '<<<- previous page')
}
const nextPageClick = () => {
  console.log(`[invite]`, 'next page ->>>')
}
</script>

<style scoped></style>
