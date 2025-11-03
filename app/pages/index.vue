<template>
  <div class="w-5xl min-h-[1151px] flex flex-col custom-bg bg-top bg-size-[1024px]">
    <div class="w-full h-40 flex relative">
      <div class="absolute right-24 top-4 flex gap-4 text-sm">
        <ULink as="button" @click="() => (gameStore.isInRoom = false)">大厅页面</ULink>
        <ULink as="button" @click="() => (gameStore.isInRoom = true) && (gameStore.roomStage = 0)"
          >房间·等待页面</ULink
        >
        <ULink as="button" @click="() => (gameStore.isInRoom = true) && (gameStore.roomStage = 1)"
          >房间·游戏中页面</ULink
        >
      </div>

      <UiUserMenu
        v-if="userSession.loggedIn.value && userSession.user.value"
        class="absolute right-24 top-24"
      />
    </div>
    <div class="w-full h-10 flex justify-center items-center">
      <div class="w-[900px] flex flex-row justify-center">
        <span class="-ml-7 font-sans text-5xl quotation">“</span>
        <span class="grow text-light px-2">
          <UiTextRender :text="appConfigStore.appConfig.announcements[0] || ''" :emojis="[]" />
        </span>
        <span class="-mr-7 font-sans text-5xl quotation">”</span>
      </div>
    </div>
    <UiGameMainFrame class="">
      <template #header>
        <div
          class="flex justify-between px-[.785rem] text-[13px] text-(--game-font-color) select-none"
        >
          <div class="flex gap-5 pt-5">
            <span>天秤座</span>
            <span>房间4</span>
          </div>
        </div>
      </template>

      <template #main>
        <UiGameMain>
          <div
            v-if="!userSession.loggedIn.value && !userSession.user.value"
            class="size-full flex flex-col items-center justify-center bg-[#69380417]"
          >
            <UPageCard class="w-sm max-w-md">
              <UAuthForm
                title="登录以继续"
                icon="material-symbols:lock-person-outline-rounded"
                separator="或"
                :providers="providers"
              >
                <template #description> 请选择一种方式登录 </template>
                <template #password-hint>
                  <ULink to="#" class="text-primary font-medium" tabindex="-1">忘记密码？</ULink>
                </template>
                <template #footer>
                  登录即表示同意我们的<ULink to="#" class="text-primary font-medium"
                    >用户服务协议</ULink
                  >。
                </template>
              </UAuthForm>
            </UPageCard>
          </div>

          <template v-if="userSession.loggedIn.value && userSession.user.value">
            <UiGameMainLobby v-if="!gameStore.isInRoom" />
            <UiGameMainRoom :v-if="gameStore.isInRoom" :stage="gameStore.roomStage" />
          </template>
        </UiGameMain>
      </template>

      <template #footer>
        <div
          class="flex justify-between px-[.785rem] pt-4.5 text-[12px] text-[#aa7b4c91] select-none"
        >
          <div class="flex flex-col justify-center">
            <span>免责声明：本项目为非盈利社区性项目。</span>
            <span>无意侵犯其版权，所有权利均归其各自所有者所有。</span>
          </div>

          <div class="flex flex-col justify-center max-w-[20rem] text-right">
            <span>© 上海优哉游哉网络科技有限公司 版权所有</span>
            <span>《你画我猜》是其开发并持有软件著作权的软件产品</span>
          </div>
        </div>
      </template>
    </UiGameMainFrame>
  </div>
</template>

<script setup lang="ts">
import { useAppConfigStore } from '~/stores/appConfig'

definePageMeta({
  layout: 'game'
})

const userSession = useUserSession()
const appConfigStore = useAppConfigStore()

const providers = [
  {
    label: '使用 X 账号登录',
    icon: 'i-simple-icons-x',
    onClick: async () => {
      await navigateTo('/auth/x', {
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
    label: '使用 Steam 账号登录',
    icon: 'i-simple-icons-steam',
    onClick: async () => {
      await navigateTo('/auth/steam', {
        external: true
      })
    }
  }
]

const gameStore = useGameStore()

const { data } = await useFetch('/api/hello')
console.log(data.value)
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
  color: #db0030;
  padding-top: 20px;
  user-select: none;
}
</style>
