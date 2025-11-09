<template>
  <div
    class="px-[0.785rem] h-[21.05%] border-b-4 border-[#eeddcb] flex flex-row gap-[0.785rem] relative"
  >
    <div class="flex flex-col justify-center gap-[0.785rem] w-36">
      <UiGameMainRoomNumber :room-number="roomInfo.roomNumber || 0" />
      <span class="relative inline-flex items-center gap-1 pl-1 align-text-bottom">
        <UCheckbox v-model="locked" size="sm" icon="ph:check-bold" class="game-checkbox" />
        <span
          class="cursor-pointer text-sm select-none"
          :class="{ 'min-w-20': password, 'min-w-inherit': !password }"
          @click="changePassword"
        >
          {{ passwordText }}
        </span>
        <span v-show="showPasswordInput" class="absolute left-[58px] w-16">
          <UInput
            ref="PasswordInput"
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

    <div class="w-52 flex flex-col justify-center pr-4">
      <div class="w-full h-20 text-[13px] text-[#c3b4a0]">
        <UiGameMainMessageList ref="RoomMessageList" />
      </div>
    </div>

    <div class="flex flex-col justify-center">
      <div class="grid grid-cols-2 grid-rows-2 gap-[0.785rem]">
        <UiButton color="green">广播邀请</UiButton>
        <UiButton color="blue">邀请好友</UiButton>
        <UiButton v-if="isOwner">再等一会</UiButton>
        <UiButton v-if="isOwner" color="red" @click="start">立即开始</UiButton>
      </div>
    </div>

    <div class="grow flex flex-col items-center justify-center">
      <UiGameMainRoomTimer />
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
        v-if="roomInfo?.players![i - 1]?.id === roomInfo?.owner"
        class="absolute top-0 left-10 flex"
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
        :verified-icon="{ show: true, size: 16 }"
        :disabled="!isOwner"
        @switch="onSeatSwitch"
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
</template>

<script setup lang="ts">
import type { RoomInfo } from '#shared/interfaces/room'

const { roomInfo } = defineProps<{ roomInfo: RoomInfo }>()
const { player } = storeToRefs(usePlayerStore())
const { switchSeat } = useRoomStore()

const PasswordInputRef = useTemplateRef('PasswordInput')
const RoomMessageListRef = useTemplateRef('RoomMessageList')

const isOwner = computed(() => roomInfo.owner === player.value?.id)
const locked = ref(roomInfo.locked)
const password = ref(roomInfo.locked ? roomInfo.password || '0000' : '')
const showPasswordInput = ref(false)

const passwordText = computed(() => (locked.value ? `密码：${password.value}` : `密码`))
const changePassword = () => {
  if (locked.value && !showPasswordInput.value) {
    if (PasswordInputRef.value?.inputRef) {
      PasswordInputRef.value.inputRef.value = password.value
    }

    showPasswordInput.value = true
    nextTick(() => {
      PasswordInputRef.value?.inputRef?.focus()
      PasswordInputRef.value?.inputRef?.select()
    })
  }
}

const passwordInputOnBlur = (event?: FocusEvent) => {
  const inputValue = PasswordInputRef.value?.inputRef?.value

  // 密码输入框为空
  if (!inputValue && (!password.value || password.value === '')) {
    locked.value = false
  }

  if (inputValue) {
    if (password.value !== inputValue) {
      setTimeout(() => {
        if (locked.value) {
          // console.log(`[RoomWaiting]`, `[pwdChange]`, password.value)
          password.value = inputValue
        }
      }, 100)
    }
  }

  showPasswordInput.value = false
}
const passwordInputOnEnterKeyDown = () => {
  // 这里不能直接调用失焦 handler，会导致重复触发失焦事件
  // 所以改用直接隐藏输入框来间接触发 input 的 blur 事件
  // passwordInputOnBlur()
  showPasswordInput.value = false
}
const passwordInputOnEscKeyDown = () => {
  if (PasswordInputRef.value?.inputRef) {
    PasswordInputRef.value.inputRef.value = ''
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
          PasswordInputRef.value?.inputRef?.focus()
          PasswordInputRef.value?.inputRef?.select()
        })
      }
    } else {
      password.value = ''
      showPasswordInput.value = false
    }
  }
)

watch(
  () => password.value,
  (newValue) => {
    console.log(`[RoomWaiting]`, `[setPwd]`, newValue)

    if (newValue && newValue.trim() !== '') {
      RoomMessageListRef.value?.addMessage({
        type: 'text',
        msg: `房主将房间密码设置为：${newValue}`
      })
    } else {
      RoomMessageListRef.value?.addMessage({
        type: 'text',
        msg: `房主取消了房间密码`
      })
    }
  }
)

const onSeatSwitch = (open?: boolean, seat?: number | string) => {
  // console.log(seat, open)
  switchSeat(roomInfo.roomNumber, Number(seat) - 1, Boolean(open))
}

const start = () => {
  RoomMessageListRef.value?.addMessage({
    type: 'text',
    msg: Date.now().toString() + `离开了房间`
  })
}
</script>

<style scoped></style>
