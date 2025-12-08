<template>
  <span
    class="relative inline-flex items-center justify-center size-4 bg-surface-550"
    :class="{ 'cursor-pointer': !disabled }"
    @click="onClick"
  >
    <UPopover
      v-model:open="showProfilePopover"
      :content="{
        side: (position.split('-')[0] as Side) || 'right',
        align: (position.split('-')[1] as Align) || 'end',
        sideOffset: 8,
        collisionBoundary: panelDom,
        prioritizePosition: true
      }"
    >
      <template #anchor>
        <UAvatar
          v-show="player"
          class="game-avatar cursor-pointer size-full"
          :src="player?.avatar_url"
          @click="onAvatarClick"
          @close="onProfilePopoverClose"
        />
        <img
          v-if="player?.verification.verified && verifiedIcon?.show"
          class="absolute right-0 bottom-0 size-3"
          :style="{
            width: `${verifiedIcon.size}px`,
            height: `${verifiedIcon.size}px`,
            right: `${verifiedIcon.right}px`,
            bottom: `${verifiedIcon.bottom}px`
          }"
          src="~/assets/icons/verified.png"
        />
      </template>

      <template #content>
        <div
          v-if="player"
          class="inline-flex flex-col select-none h-75 w-35 bg-surface-150 bg-texture"
        >
          <div class="relative p-1.5">
            <UAvatar class="game-avatar size-32" :src="player?.avatar_url" />
          </div>

          <span class="truncate px-1.5 h-[19.5px] text-sm2">
            <UiGenderIcon :gender="player?.gender" class="align-text-bottom" />
            {{ player?.nickname }}
          </span>

          <span
            class="flex items-center truncate gap-1.5 px-1.5 h-4.5 w-full text-xs"
            style="margin: 2px 0 6px 0"
          >
            <template v-if="player?.verification.verified">
              <img class="inline-block size-3.5 align-middle" src="~/assets/icons/verified.png" />
              <span class="truncate text-wood-500 text-shadow-light">
                {{ player.verification.description }}
              </span>
            </template>
          </span>

          <div class="flex flex-col gap-1 px-3.5 py-2 bg-tint-warm-700">
            <div class="inline-flex items-end gap-2">
              <span class="min-w-10.5 leading-4 text-base font-bold italic">
                LV.{{ levelInfo?.level }}
              </span>
              <span class="flex-1 leading-[15px] text-xs">
                {{ levelInfo?.title }}
              </span>
            </div>

            <div class="flex flex-col gap-1">
              <div class="inline-flex items-end gap-0.5 h-3.5 leading-3.5 text-xs">
                <span class="min-w-[42px] text-wood-700"> 鲜ㅤ花： </span>
                <span class="flex-1 leading-[13px]">
                  {{ playerProfile?.stats.flower_count }}
                </span>
              </div>

              <div class="inline-flex items-end gap-0.5 h-3.5 leading-3.5 text-xs">
                <span class="min-w-[42px] text-wood-700"> 盘ㅤ数： </span>
                <span class="flex-1 leading-[13px]">
                  {{ playerProfile?.stats.total_games }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between px-3.5 py-2.5 h-12">
            <template v-if="player?.id !== loggedInPlayer?.id">
              <div class="profile-icon sprites-icon hi size-7"></div>
              <div class="profile-icon sprites-icon friend size-7"></div>
            </template>
          </div>
        </div>
      </template>
    </UPopover>

    <template v-if="mode.includes('seat') && !player">
      <span v-if="open" class="text-sm2">{{ placeholder }}</span>
      <UIcon v-else :name="`fe:disabled`" class="text-game-red-500 size-14" />
    </template>
  </span>
</template>

<script setup lang="ts">
interface AvatarProps {
  id?: number | string
  mode?: 'display' | 'seat' | 'switchable-seat'
  disabled?: boolean
  player?: Player
  position?: `${Side}-${Align}`
  verifiedIcon?: {
    show?: boolean
    size?: number
    right?: number
    bottom?: number
  }
  placeholder?: string
}
type Side = 'top' | 'right' | 'bottom' | 'left'
type Align = 'end' | 'start' | 'center'

const {
  id = undefined,
  mode = 'display',
  disabled = true,
  player = undefined,
  position = 'right-end',
  verifiedIcon = undefined,
  placeholder = '等待玩家'
} = defineProps<AvatarProps>()

const playerStore = usePlayerStore()
const { getPlayerProfile } = playerStore
const { loggedInPlayer } = storeToRefs(playerStore)
const { levelHelper } = useAppConfigStore()

const open = defineModel<boolean>('open', { default: true })

const emit = defineEmits<{
  (e: 'switch', open: boolean, seat?: number | string): void
  (e: 'sit', seat?: number | string): void
}>()

const playerProfile = ref<Player | null>(null)
const showProfilePopover = ref(false)

const onClick = () => {
  // 禁用状态不触发任何事件
  if (disabled) return

  // 座位模式，触发 sit 事件
  if (mode === 'seat') {
    if (!player) {
      emit('sit', id)
    }
  }

  // 可切换座位模式，触发 switch 事件
  if (mode === 'switchable-seat') {
    if (!player) {
      open.value = !open.value
      emit('switch', open.value, id)
    }
  }
}

const onAvatarClick = async () => {
  if (player && player.id) {
    const { id, profile } = await getPlayerProfile(player.id)
    if (profile) {
      playerProfile.value = profile
      showProfilePopover.value = true
    }
  }
}

const onProfilePopoverClose = () => {
  playerProfile.value = null
}

const levelInfo = computed(() =>
  levelHelper.getUserLevelInfo(playerProfile.value?.stats.score || 0)
)

watch(
  () => player,
  (newValue) => {
    if (!newValue) {
      showProfilePopover.value = false
      playerProfile.value = null
    }
  }
)

const panelDom = ref<Element | null>(null)
onMounted(() => {
  panelDom.value = document.querySelector('#game-panel')
})
</script>

<style scoped>
.profile-icon {
  background-position: 0 calc(var(--sprites-index) * -28px);
  filter: drop-shadow(0px 0px 2px rgb(161, 87, 17));
  cursor: pointer;
}
.profile-icon.hi {
  --sprites-index: 2;
}
.profile-icon.hi:hover {
  --sprites-index: 3;
}
.profile-icon.friend {
  --sprites-index: 0;
}
.profile-icon.friend:hover {
  --sprites-index: 1;
}
</style>
