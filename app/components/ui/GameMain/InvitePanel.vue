<template>
  <UTabs :items="tabItems" size="xs" class="game-tabs select-none">
    <template #user1>
      <div class="h-56 flex flex-col">
        <div class="grow flex flex-col gap-2 p-[.785rem] max-w-[227.89px]">
          <div
            v-for="player in playerList"
            :key="player.uuid"
            class="flex flex-row items-center gap-0.5 w-full"
          >
            <UiAvatar :player="player" position="right-start" class="size-6.5" />

            <UiGenderIcon :gender="player.gender" />

            <span class="grow text-[13px] max-w-[103.77px] truncate">
              {{ player.nickname }}
            </span>

            <UiButton size="small" color="red" @click="inviteClick(player)"> 邀请 </UiButton>
          </div>
        </div>

        <USeparator orientation="horizontal" class="w-full" />

        <div
          class="flex flex-row justify-center items-center gap-9.5 h-8 border-t-2 border-t-white"
        >
          <UiLinkButton @click="previousPageClick">上一页</UiLinkButton>
          <USeparator orientation="vertical" class="h-4" />
          <UiLinkButton @click="nextPageClick">下一页</UiLinkButton>
        </div>
      </div>
    </template>
    <template #user2>
      <div class="h-56"></div>
    </template>
  </UTabs>
</template>

<script setup lang="ts">
import { players } from '@/stores/test'
import type { Player } from '~/interfaces/player'

const tabItems = [
  {
    label: '空闲玩家',
    icon: 'ph:user-check-fill',
    slot: 'user1'
  },
  {
    label: '同城玩家',
    icon: 'ph:users-fill',
    slot: 'user2'
  }
]

const playerList = ref(players.slice(0, 5))

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
