<template>
  <div id="game-playing" class="relative flex flex-col h-full">
    <div class="flex h-16 min-h-16 items-center justify-between px-1">
      <div class="flex flex-col items-center justify-center w-20">
        <UiAvatar
          :player="drawingPlayer"
          class="size-10 rounded-md overflow-hidden"
          :verified-icon="{ show: true, size: 12 }"
        />
      </div>

      <div class="w-11 h-full"></div>

      <div class="w-64 flex flex-col items-center justify-center gap-2 text-sm2 p-2 select-none">
        <span>第 {{ gameStore.state.currentRound }}/{{ gameStore.state.totalRounds }} 回合</span>

        <span v-if="gameStore.isMyTurn && gameStore.state.currentWord !== null"
          >题目是：<span class="text-red-600">{{ gameStore.state.currentWord }}</span></span
        >
        <span v-else-if="gameStore.state.prompts.length" class="w-full text-center truncate"
          >提示：
          <template v-for="(prompt, index) in gameStore.state.prompts" :key="index">
            <span class="text-red-600">{{ prompt }}</span>
            <span v-if="index < gameStore.state.prompts.length - 1">，</span>
          </template>
        </span>
        <span v-else>
          由
          <span class="text-red-600"> {{ drawingPlayer?.nickname }} </span>
          作画
        </span>
      </div>

      <div class="w-12">
        <span v-if="isOnlooker" class="text-sm2 text-(--game-normal)">旁观中</span>
        <UiLinkButton
          v-if="gameStore.state.draw"
          type="button"
          class="text-sm2"
          @click="gameStore.giveUp"
          >放 弃</UiLinkButton
        >
      </div>

      <div class="flex flex-col items-center justify-center w-20">
        <UiGameMainRoomTimer
          v-show="
            gameStore.state.roundPhase === 'drawing' &&
            gameStore.state.gamePhase !== 'game_settlement'
          "
          ref="Timer"
          :seconds="gameStore.state.timeLeft"
        />
      </div>
    </div>

    <div id="sketchpad-container" ref="sketchpadContainerRef" class="relative h-[70%]">
      <UiGameMainRoomPlayingSketchpad />
      <UiThrower ref="throwerRef" :container="sketchpadContainerRef" />
    </div>

    <div class="flex-1 basis-0 flex px-tight pb-1.5 select-none">
      <template v-for="player in _players" :key="player.id">
        <UiGameMainRoomBubble :id="player.id">
          <div class="flex flex-col items-center justify-center gap-1 w-[91.7px]">
            <span
              class="w-full h-7 text-sm2 text-center leading-[13px] flex items-end justify-center"
              >{{ player.nickname }}</span
            >
            <UiAvatar
              :player="player"
              class="size-18 rounded-lg overflow-hidden"
              :class="{
                bingo: gameStore.state.bingoPlayers.includes(player.id),
                drawing: player.id === gameStore.state.drawer,
                'drawing-bingo':
                  player.id === gameStore.state.drawer && gameStore.state.bingoPlayers.length > 0
              }"
              :verified-icon="{ show: true, size: 12, bottom: 2, right: 2 }"
            />
            <span class="text-sm2 text-wood-600">
              {{ gameStore.state.scores[player.id] || 0 }}
            </span>
          </div>
        </UiGameMainRoomBubble>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import CountdownModal from '~/components/modal/CountdownModal.vue'
import ThrowerModal from '~/components/modal/ThrowerModal.vue'
import RankModal from '~/components/modal/RankModal.vue'

const { roomInfo } = defineProps<{ roomInfo: RoomInfo }>()

const sketchpadContainerRef = useTemplateRef('sketchpadContainerRef')
const timerRef = useTemplateRef('Timer')
const throwerRef = useTemplateRef('throwerRef')

const { isOnlooker } = storeToRefs(usePlayerStore())
const { currentRoom, currentRoomRealPlayers } = storeToRefs(useRoomStore())
const gameStore = useGameStore()

// 组件 hook
const { show, destroy, destroyAll } = useBubble('#game-panel')
const countdownModal = useModal(CountdownModal, { parent: '#sketchpad-container' })
const throwerModal = useModal(ThrowerModal, { parent: '#sketchpad-container' })
const rankModal = useModal(RankModal, { parent: '#sketchpad-container' })
const { playSound } = useSound()

const _players = computed(() => roomInfo.players.filter((p) => p !== null))
const drawingPlayer = computed(() => _players.value.find((p) => p.id === gameStore.state.drawer))

// 游戏事件监听
useEventBus('chat:event:say', ({ chatmsg, sender }) => {
  show(sender.id, chatmsg)
})
useEventBus('game:event:round:prepare', async ({ seconds }) => {
  await countdownModal.open({ seconds })
})
useEventBus('game:event:drawing:start', () => {
  timerRef.value?.play()
})
useEventBus('game:event:prompt', () => {
  playSound('pop') // 弹出提示词时，发出泡泡音效
})
useEventBus('game:event:guess:bingo', ({ score_delta }) => {
  show(score_delta.drawerId, `+${score_delta.drawerGain}`)
  show(score_delta.guesserId, `+${score_delta.guesserGain}`)
  playSound('bingo')
})
useEventBus(
  'game:event:interaction:start',
  async ({ answer, seconds, drawerPlayer, bingoPlayers, reason }) => {
    let text = ''
    switch (reason) {
      case 'give_up':
        text = `${drawerPlayer.nickname} 放弃作画`
        break
      case 'bingo_all':
        text = `所有人猜对`
        break
      case 'timeout':
        if (bingoPlayers.length === 0) {
          text = `没有人猜对`
        } else if (bingoPlayers.length === 1) {
          text = `只有 ${bingoPlayers[0]?.nickname} 猜对`
        } else {
          text = `${bingoPlayers[0]?.nickname} 等 ${bingoPlayers.length - 1} 人猜对`
        }
        break
      case 'afk':
        text = `${drawerPlayer.nickname} 超时未作画`
        break
      case 'force':
        text = `管理员强制结束`
        break
      case 'leave':
        text = `${drawerPlayer.nickname} 离开了房间`
        break
    }

    playSound('end')

    timerRef.value?.pause()
    await throwerModal.open({
      answer,
      reason: text,
      showThrowItem: !gameStore.isMyTurn,
      seconds: seconds + 1
    })
  }
)
useEventBus('game:event:interaction:gift', async ({ item_type, from, to }) => {
  switch (item_type) {
    case 'flower':
      throwerRef.value?.throwFlower(1, -400, -50)
      playSound('flower')
      break
    case 'egg':
      break
    case 'slipper':
      break
  }
})
useEventBus('game:event:settlement', async ({ scores, item_counts, seconds }) => {
  timerRef.value?.pause()
  const ranks = _players.value.map((p) => {
    return {
      player: p,
      score: scores[p.id],
      flower: item_counts[p.id]?.flower,
      egg: item_counts[p.id]?.egg,
      slipper: item_counts[p.id]?.slipper
    }
  })
  await rankModal.open({
    ranks,
    seconds
  })
})
</script>

<style scoped>
.drawing {
  box-shadow: 0 0 0 5px #e60012;
}
.drawing-bingo {
  box-shadow:
    0 0 0 4px #e60012,
    0 0 0 6px #00a0e9;
}
.bingo {
  box-shadow: 0 0 0 4.5px #00a0e9;
}
</style>
