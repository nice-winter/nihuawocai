<template>
  <div class="flex flex-row h-full">
    <div class="flex flex-col w-[74.4%]">
      <div
        class="px-[0.785rem] h-[21.05%] border-b-4 border-[#eeddcb] flex flex-row gap-[0.785rem] relative"
      >
        <div class="flex flex-col justify-center gap-[0.785rem] w-36">
          <ui-game-main-room-number :room-number="roomInfo?.roomNumber || 0" />
          <span class="relative inline-flex items-center gap-1 pl-1 align-text-bottom">
            <UCheckbox v-model="locked" size="sm" icon="ph:check-bold" class="game-checkbox" />
            <span
              class="cursor-pointer text-sm select-none"
              :class="{ 'min-w-20': password, 'min-w-inherit': !password }"
              @click="changePassword"
            >
              {{ pwdText }}
            </span>
            <span v-show="showPasswordInput" class="absolute left-[58px] w-16">
              <UInput
                ref="passwordInput"
                class="game-input"
                :default-value="password"
                size="xs"
                maxlength="4"
                @blur="passwordInputOnBlur"
                @keydown.enter="passwordInputOnEnterKeyDown"
                @keydown.esc="passwordInputOnEscKeyDown"
              />
            </span>
          </span>
        </div>

        <div class="flex flex-col justify-center">
          <div class="w-48 h-20 text-[13px] text-[#c3b4a0]">
            <UiGameMainRoomMessageList ref="RoomMessageList" />
          </div>
        </div>

        <div class="flex flex-col justify-center ml-4">
          <div class="grid grid-cols-2 grid-rows-2 gap-[0.785rem]">
            <UiButton color="green">广播邀请</UiButton>
            <UiButton color="blue">邀请好友</UiButton>
            <UiButton>再等一会</UiButton>
            <UiButton color="red" @click="start">立即开始</UiButton>
          </div>
        </div>
      </div>

      <div class="grow grid grid-rows-2 grid-cols-4 p-8 gap-[0.785rem] justify-center">
        <div
          v-for="i in 7"
          :key="i"
          class="relative flex flex-col items-center justify-center gap-[0.785rem] select-none"
          :data-seat-number="i"
        >
          <span
            v-if="roomInfo?.players![i - 1]?.uuid === roomInfo?.owner"
            class="absolute top-2.5 left-10 flex"
          >
            <UIcon name="ph:arrow-bend-left-down-bold" />
            <img src="~/assets/icons/owner.png" class="h-5 mt-[-0.4rem]" />
          </span>

          <UiAvatar
            :id="i"
            :open="roomInfo?.seats![i - 1]"
            class="size-[114px]"
            :player="roomInfo?.players![i - 1] || undefined"
            mode="seat"
            :disabled="false"
            @switch="onSwitch"
          />

          <p class="w-full text-sm text-center text-light truncate">
            {{ roomInfo?.players![i - 1]?.nickname || `ㅤ` }}
          </p>
        </div>

        <div class="relative flex flex-col items-center justify-center gap-[0.785rem] select-none">
          <div class="flex items-center justify-center w-[114px] h-[114px] bg-[#ad8665] text-sm">
            <UIcon :name="`fe:disabled`" class="text-[#7A6955] size-14" />
          </div>
          <p class="text-sm text-center">ㅤ</p>
        </div>
      </div>
    </div>
    <div class="grow flex flex-col bg-[#f1d0ae42] border-l-2 border-white/60">
      <div class="mt-16 p-0">
        <UTabs :items="tabItems" size="xs" class="game-tabs select-none">
          <template #user1>
            <div class="h-56"></div>
          </template>
          <template #user2>
            <div class="h-56"></div>
          </template>
        </UTabs>
      </div>
      <UiGameMainChatPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { roomList } from '~/stores/test'

const roomInfo = ref(roomList[0])
const locked = ref(roomList[0]?.locked)
const password = ref('')
const passwordInputRef = useTemplateRef('passwordInput')
const showPasswordInput = ref(false)
const roomMessageListRef = useTemplateRef('RoomMessageList')

const start = () => {
  roomMessageListRef.value?.addMessage({
    type: 'text',
    msg: Date.now().toString() + `离开了房间`
  })
}

const pwdText = computed(() => (locked.value ? `密码：${password.value}` : `密码`))

const changePassword = () => {
  if (locked.value && !showPasswordInput.value) {
    if (passwordInputRef.value?.inputRef) {
      passwordInputRef.value.inputRef.value = password.value
    }

    showPasswordInput.value = true
    nextTick(() => {
      passwordInputRef.value?.inputRef?.focus()
      passwordInputRef.value?.inputRef?.select()
    })
  }
}

const passwordInputOnBlur = () => {
  const inputValue = passwordInputRef.value?.inputRef?.value
  if (inputValue) password.value = inputValue || ''
  showPasswordInput.value = false

  if (!inputValue && (!password.value || password.value === '')) {
    locked.value = false
  }
}
const passwordInputOnEnterKeyDown = () => {
  passwordInputOnBlur()
}
const passwordInputOnEscKeyDown = () => {
  if (passwordInputRef.value?.inputRef) {
    passwordInputRef.value.inputRef.value = ''
  }
  showPasswordInput.value = false
}

watch(
  () => locked.value,
  (newValue) => {
    if (newValue) {
      if (!password.value || password.value === '') {
        showPasswordInput.value = true
        nextTick(() => {
          passwordInputRef.value?.inputRef?.focus()
          passwordInputRef.value?.inputRef?.select()
        })
      }
    } else {
      password.value = ''
      showPasswordInput.value = false
    }
  }
)

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

const onSwitch = (open?: boolean, id?: number | string) => {
  console.log(id, open)
}
</script>

<style scoped></style>
