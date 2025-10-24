<template>
  <div class="game-main-panel__room">
    <div class="room left-wrapper">
      <div class="room-header">
        <div class="base-info">
          <ui-game-main-room-number :room-number="roomInfo?.roomNumber || 0" />
          <span
            style="
              padding-left: 4px;
              position: relative;
              display: inline-flex;
              vertical-align: text-bottom;
              align-items: center;
              gap: 4px;
            "
          >
            <UCheckbox
              v-model="locked"
              size="sm"
              icon="ph:check-bold"
              style="border-radius: 0; background-color: #f7ede3"
            />
            <span
              style="cursor: pointer; font-size: 14px"
              :style="{ minWidth: !password ? `inherit` : `5rem` }"
              class="select-none"
              @click="changePassword"
            >
              {{ pwdText }}
            </span>
            <span v-show="showPasswordInput" style="position: absolute; left: 58px; width: 4rem">
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

        <div class="room-log">
          <div class="text-wrapper">
            <UiGameMainRoomMessageList ref="RoomMessageList" />
          </div>
        </div>

        <div class="actions">
          <div class="button-wrapper">
            <UiButton color="green">广播邀请</UiButton>
            <UiButton color="blue">邀请好友</UiButton>
            <UiButton>再等一会</UiButton>
            <UiButton color="red" @click="start">开始游戏</UiButton>
          </div>
        </div>
      </div>
      <div class="room-main"></div>
    </div>
    <div class="room right-wrapper">
      <div class="invitation-tab-wrapper">
        <UTabs :items="tabItems" size="xs" class="game-tabs select-none">
          <template #user1>
            <div class="invitation-tab__players"></div>
          </template>
          <template #user2>
            <div class="invitation-tab__players"></div>
          </template>
        </UTabs>
      </div>
      <UiGameMainChatPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { roomList } from '~/assets/common/test'

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
</script>

<style scoped>
.game-main-panel__room {
  display: flex;
  flex-direction: row;
  height: 100%;
}

.room.left-wrapper {
  display: flex;
  flex-direction: column;
  width: 74.4%;

  .room-header {
    padding: 0 0.785rem;
    height: 21.05%;
    border-bottom: 4px solid #eeddcb;
    display: flex;
    flex-direction: row;
    gap: 0.785rem;
    position: relative;

    .base-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 0.785rem;
      width: 144px;
    }

    .room-log {
      display: flex;
      flex-direction: column;
      justify-content: center;

      .text-wrapper {
        width: 12rem;
        height: 5rem;
        font-size: 13px;
        color: #c3b4a0;
      }
    }

    .actions {
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-left: 1rem;

      .button-wrapper {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 0.785rem;
      }
    }
  }
  .room-main {
    flex-grow: 1;
  }
}

.room.right-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #f1d0ae42;
  border-left: 2px solid color(srgb 1 1 1 / 0.6);

  .invitation-tab-wrapper {
    margin-top: 4rem;
    padding: 0;
  }

  .invitation-tab__players {
    height: 14rem;
  }
}
</style>
