<template>
  <span
    class="relative inline-flex items-center justify-center size-4 bg-[#ddc9a9]"
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
          class="game-avatar size-full cursor-pointer"
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
          class="w-35 h-75 inline-flex flex-col select-none bg-[#EFC189] bg-texture"
        >
          <div class="relative p-1.5">
            <UAvatar class="game-avatar size-32" :src="player?.avatar_url" />
          </div>

          <span class="h-[19.5px] px-1.5 text-[13px] truncate">
            <UiGenderIcon :gender="player?.gender" class="align-text-bottom" />
            {{ player?.nickname }}
          </span>

          <span
            class="w-full h-4.5 flex items-center gap-1.5 px-1.5 text-xs truncate"
            style="margin: 2px 0 6px 0"
          >
            <template v-if="player?.verification.verified">
              <img class="size-3.5 inline-block align-middle" src="~/assets/icons/verified.png" />
              <span class="text-[#995d11] text-light truncate">{{
                player.verification.description
              }}</span>
            </template>
          </span>

          <div class="px-3.5 py-2 flex flex-col gap-1 bg-[#c5630e69]">
            <div class="inline-flex items-end gap-2">
              <span class="text-base font-bold italic leading-4 min-w-10.5"
                >LV.{{ levelInfo?.level }}</span
              >
              <span class="text-xs leading-[15px] grow">{{ levelInfo?.title }}</span>
            </div>

            <div class="flex flex-col gap-1">
              <div class="h-3.5 text-xs leading-3.5 inline-flex items-end gap-0.5">
                <span class="text-[#804B19] min-w-[42px]"> 鲜ㅤ花： </span>
                <span class="grow leading-[13px]">{{ playerProfile?.stats.flower_count }}</span>
              </div>

              <div class="h-3.5 text-xs leading-3.5 inline-flex items-end gap-0.5">
                <span class="text-[#804B19] min-w-[42px]"> 盘ㅤ数： </span>
                <span class="grow leading-[13px]">{{ playerProfile?.stats.total_games }}</span>
              </div>
            </div>
          </div>

          <div class="h-12 px-3.5 py-2.5 flex items-center justify-between">
            <template v-if="player?.id !== loggedInPlayer?.id">
              <div class="size-7 sprites-icon profile-icon hi"></div>
              <div class="size-7 sprites-icon profile-icon friend"></div>
            </template>
          </div>
        </div>
      </template>
    </UPopover>

    <template v-if="mode.includes('seat') && !player">
      <span v-if="open" class="text-[.8rem]">{{ placeholder }}</span>
      <UIcon v-else :name="`fe:disabled`" class="text-[#E20032] size-14" />
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
