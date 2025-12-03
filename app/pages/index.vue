<template>
  <div
    ref="GameApp"
    class="w-5xl min-w-5xl min-h-[1151px] flex flex-col custom-bg bg-top bg-size-[1024px]"
  >
    <div class="w-full h-40 flex relative">
      <div class="absolute right-23 top-6 flex gap-4 text-sm">
        <UiUserMenu v-if="userSession.loggedIn.value && userSession.user.value" class="" />
      </div>
    </div>

    <div class="w-full h-10 flex justify-center items-center">
      <div class="w-[900px] flex flex-row justify-center">
        <UIcon name="custom:icon-quota-left" class="size-5 -mt-1" />

        <span class="grow text-light px-2 truncate">
          <UiTextRender :text="appConfig.announcements[0] || ''" style="--emoji-size: 20px" />
        </span>

        <UIcon name="custom:icon-quota-right" class="size-5 -mt-1" />
      </div>
    </div>

    <UiGameMainFrame ref="GameMain">
      <template #header>
        <div
          v-if="userSession.loggedIn.value && userSession.user.value"
          class="flex justify-between px-tight text-sm2 text-(--game-font-color) select-none"
        >
          <div class="flex gap-5 pt-5">
            <span>{{ userSession.loggedIn.value ? `天秤座` : '' }}</span>
            <span v-if="userSession.loggedIn.value">
              {{ stateText }}
            </span>
            <span v-if="isOnlooker">旁观中</span>
          </div>

          <div class="flex-1 flex ml-auto relative">
            <UiNavigation
              v-if="userSession.loggedIn.value && loggedInPlayer"
              class="absolute z-1 right-6 -bottom-1"
            />
          </div>

          <div class="relative ml-auto w-52">
            <div
              v-if="userSession.loggedIn.value && loggedInPlayer"
              class="absolute top-4 left-4 z-2 flex items-center gap-2"
            >
              <UiAvatar :player="loggedInPlayer" position="bottom-start" class="size-10" />
              <span class="max-w-38 text-sm2 text-(--game-primary-color) text-light truncate">{{
                loggedInPlayer.nickname
              }}</span>
            </div>
          </div>
        </div>
      </template>

      <template #main>
        <UiGameMain v-if="userSession.loggedIn.value && userSession.user.value">
          <UiGameMainLobby v-if="isInLobby" />
          <UiGameMainRoom v-else-if="isInRoom" />
        </UiGameMain>
      </template>

      <template #footer>
        <div
          class="flex justify-between px-tight pt-4.5 text-[12px] text-[#aa7b4c91] select-none"
        >
          <div class="flex flex-col justify-center">
            <span>免责声明：本项目为非盈利社区性项目</span>
            <span>无意侵犯其版权，所有权利均归其各自所有者所有</span>
          </div>

          <div class="flex flex-col justify-center max-w-[20rem] text-right">
            <span>Copyright © 2025 WINTER</span>
            <span
              >我画你猜的源代码基于
              <a
                href="https://github.com/nice-winter/nihuawocai/blob/main/LICENSE"
                target="_blank"
                class="underline"
                >MIT 许可证</a
              >
              发布
            </span>
          </div>
        </div>
      </template>
    </UiGameMainFrame>

    <div class="w-full grow flex justify-center items-center">
      <UiGameMainRank class="w-[900px]" />
    </div>

    <UModal :open="!userSession.loggedIn.value" :dismissible="false" class="w-sm">
      <template #content>
        <div class="w-full p-4">
          <UAuthForm
            title="登录以继续游玩"
            icon="streamline-plump-color:gameboy-flat"
            separator="或"
            :providers="providers"
          >
            <template #description> 请选择一种方式登录 </template>
            <template #password-hint>
              <ULink to="#" class="text-primary font-medium" tabindex="-1">忘记密码？</ULink>
            </template>
            <template #footer>
              登录即表示同意我们的<ULink to="#" class="text-primary font-medium">用户服务协议</ULink
              >。
            </template>
          </UAuthForm>
        </div>
      </template>
    </UModal>

    <UTooltip :open="isScrolling" text="">
      <div class="absolute -z-999 -top-999 -left-999 size-px" />
    </UTooltip>
  </div>
</template>

<script setup lang="ts">
import { snapdom } from '@zumer/snapdom'
import { useScroll } from '@vueuse/core'

definePageMeta({
  layout: 'game'
})

const appConfigStore = useAppConfigStore()
const { appConfig } = storeToRefs(appConfigStore)
const userSession = useUserSession()
const { open } = useWsStore()
const gameStore = useGameStore()
const { loggedInPlayer, isInLobby, isInRoom, currentRoomNumber, isOnlooker } =
  storeToRefs(usePlayerStore())
const { isScrolling } = useScroll(window)

const GameAppRef = useTemplateRef('GameApp')

useHead({
  title: appConfig.value.name
})

const stateText = computed(() => {
  if (userSession.loggedIn.value) {
    if (isInRoom.value) {
      return `房间${currentRoomNumber.value}`
    } else if (isInLobby.value) {
      return '大厅'
    }
  }
  return ''
})

const providers = [
  {
    label: '使用 Steam 账号登录',
    icon: 'i-simple-icons-steam',
    onClick: async () => {
      await navigateTo('/auth/steam', {
        external: true
      })
    }
  },
  {
    label: '使用 GitHub 账号登录',
    icon: 'i-simple-icons-github',
    onClick: async () => {
      await navigateTo('/auth/github', {
        external: true
      })
    }
  },
  {
    label: '使用 X 账号登录',
    icon: 'i-simple-icons-x',
    onClick: async () => {
      await navigateTo('/auth/x', {
        external: true
      })
    }
  }
]

if (userSession.loggedIn.value) {
  open()
}

useEventBus('ui:screenshot', async () => {
  if (GameAppRef.value) {
    const result = await snapdom(GameAppRef.value, {
      embedFonts: true,
      cache: 'full',
      width: 1024
    })
    crop(await result.toJpg(), { x: 40, y: 210, width: 946, height: 700 })
  }
})
</script>

<style scoped>
.custom-bg {
  background-image: url(~/assets/bg.webp);
  background-repeat: no-repeat;
}

.quotation {
  line-height: 0;
  font-family: sans-serif;
  text-shadow:
    2px 2px 0 #ffffff,
    -1px 1px 0 #ffffff,
    2px 1px 0 #ffffff;
  color: var(--game-red);
  padding-top: 20px;
  user-select: none;
}
</style>
