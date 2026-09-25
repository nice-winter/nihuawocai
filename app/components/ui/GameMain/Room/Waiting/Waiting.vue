<template>
  <div class="relative flex h-[21.05%] gap-tight px-tight border-b-4 border-surface-450">
    <div class="flex w-36 flex-col justify-center gap-tight">
      <UiGameMainRoomNumber :room-number="room.roomNumber || 0" />

      <span class="relative inline-flex items-center gap-1 pl-1 align-text-bottom">
        <UCheckbox
          v-model="hasPasswordLocal"
          size="sm"
          icon="ph:check-bold"
          class="game-checkbox"
          :disabled="!isCurrentRoomOwner"
        />

        <span
          class="text-sm select-none"
          :class="{
            'min-w-20': displayHasPassword,
            'min-w-inherit': !displayHasPassword,
            'cursor-pointer': isCurrentRoomOwner
          }"
          @click="startEdit"
        >
          {{ displayText }}
        </span>

        <span v-if="editing" class="absolute left-14.5 w-16">
          <UInput
            ref="passwordUInputRef"
            v-model="pendingPassword"
            size="xs"
            maxlength="4"
            class="game-input"
            @blur="onCommit"
            @keydown.enter.prevent="onCommit"
            @keydown.esc.prevent="onCancel"
          />
        </span>
      </span>
    </div>

    <div class="flex w-52 flex-col justify-center pr-4">
      <div class="h-20 w-full text-sm2">
        <UiGameMainMessageList
          ref="RoomEvents"
          class="text-surface-600"
          style="--action-text-color: #c3b4a0"
        />
      </div>
    </div>

    <div class="flex flex-col justify-center">
      <div class="grid grid-cols-2 grid-rows-2 gap-tight">
        <UiButton
          color="green"
          :disabled="Boolean(lobbyBroadcastRecord.get(room.id))"
          @click="sendLobbyBroadcast"
        >
          {{ !lobbyBroadcastRecord.get(room.id) ? '广播邀请' : '已广播' }}
        </UiButton>

        <UiButton color="blue"> 邀请好友 </UiButton>

        <div>
          <UiButton v-if="isCurrentRoomOwner && !room.hasPassword && canStart"> 再等一会 </UiButton>
        </div>

        <div>
          <UiButton v-if="isCurrentRoomOwner" color="red" :disabled="!canStart" @click="start">
            立即开始
          </UiButton>
        </div>
      </div>
    </div>

    <div class="flex flex-1 flex-col items-center justify-center">
      <UiGameMainRoomTimer
        v-if="!room.hasPassword && canStart"
        ref="Timer"
        v-model:seconds="prepareStartSeconds"
      />
    </div>
  </div>

  <div class="grid flex-1 grid-cols-4 grid-rows-2 justify-center gap-tight p-8">
    <div
      v-for="i in 7"
      :key="i"
      class="relative flex flex-col items-center justify-center gap-tight select-none"
      :data-seat-number="i"
    >
      <!-- <img
        v-if="room?.players![i - 1]?.id === '28332824'"
        src="~/assets/cxy.png"
        class="absolute inset-0 z-1 w-56 origin-center pointer-events-none"
        style="transform: scale(1.14); top: 14px; left: -2px"
      >

      <img
        v-if="room?.players![i - 1]?.id === '76561198413318292'"
        src="~/assets/ygg1.png"
        class="absolute inset-0 z-1 w-56 origin-center pointer-events-none"
        style="transform: scale(1.2); top: 29px; left: 9px"
      > -->

      <span
        v-if="room?.players![i - 1]?.id === room?.ownerId"
        class="absolute left-10 top-0 flex"
      >
        <UIcon name="ph:arrow-bend-left-down-bold" />
        <span class="-mt-sm2 font-cuyuan text-lg text-game-red-500"> 房主 </span>
      </span>

      <UiAvatar
        :id="i"
        :is-open="room?.seatOpenFlags![i - 1]"
        :player="room?.players![i - 1] || undefined"
        :mode="seatMode"
        class="size-28.5"
        :disabled="(!isCurrentRoomOwner && !isOnlooker) || (isOnlooker && !room?.seatOpenFlags![i - 1])"
        :verified-icon="{ show: true, size: 16 }"
        :placeholder="isOnlooker ? '点击坐下' : undefined"
        @switch="onSeatOpenChange"
        @sit="onSeatSit"
      />

      <p class="w-full truncate text-center text-sm text-shadow-light">
        {{ room?.players![i - 1]?.nickname || `ㅤ` }}
      </p>
    </div>

    <div class="relative flex flex-col items-center justify-center gap-tight select-none">
      <div class="flex size-28.5 items-center justify-center bg-wood-350 text-sm">
        <UIcon :name="`fe:disabled`" class="size-14 text-wood-300" />
      </div>

      <p class="text-center text-sm">ㅤ</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { room } = defineProps<{ room: Room }>()
const playerStore = usePlayerStore()
const { isSelf } = playerStore
const { loggedInPlayer, isOnlooker } = storeToRefs(playerStore)
const roomStore = useRoomStore()
const { sit, setSeatOpen, changeRoomPassword, sendLobbyBroadcast, start } = roomStore
const { isCurrentRoomOwner, lobbyBroadcastRecord } = storeToRefs(roomStore)

const passwordUInputRef = useTemplateRef('passwordUInputRef')
const RoomEventsRef = useTemplateRef('RoomEvents')
const TimerRef = useTemplateRef('Timer')

const prepareStartSeconds = ref(13)

// 是否可开始
const canStart = computed(() => room.players.filter((p) => p).length > 1)
// 座位模式
const seatMode = computed(() => {
  if (isCurrentRoomOwner.value) {
    return 'switchable-seat' // 房主可控制座位开关
  } else if (isOnlooker.value) {
    return 'seat' // 旁观者可点击坐下
  } else {
    return 'switchable-seat' // 非房主玩家显示为可切换但会被禁用
  }
})

// 本地状态：由 prop 同步（房主可以修改）
const hasPasswordLocal = ref(room.hasPassword)
const editing = ref(false)

// pendingPassword：编辑时的临时值；originalPassword：来自 room 的当前密码（只读）
const pendingPassword = ref(room.hasPassword ? room.joinOptions.password || '' : '')
const originalPassword = computed(() => (room.hasPassword ? room.joinOptions.password || '' : ''))

const displayHasPassword = computed(
  () =>
    hasPasswordLocal.value &&
    (isCurrentRoomOwner.value
      ? pendingPassword.value !== '' || originalPassword.value !== ''
      : originalPassword.value !== '')
)

const displayText = computed(() => {
  if (!hasPasswordLocal.value) return '密码'
  // 房主看到自己设置的 pending（编辑中）或真实密码；别人只看到真实密码
  if (isCurrentRoomOwner.value) {
    const pwd = editing.value
      ? pendingPassword.value
      : originalPassword.value || pendingPassword.value
    return `密码：${pwd || ''}`
  } else {
    return `密码：${originalPassword.value || ''}`
  }
})

// 同步外部变更（当 room 改变时，非房主应跟随）
watch(
  () => room.hasPassword,
  (val) => {
    if (!isCurrentRoomOwner.value) {
      hasPasswordLocal.value = val
      pendingPassword.value = originalPassword.value
    }
  }
)
watch(
  () => room.joinOptions?.password,
  (val) => {
    if (!isCurrentRoomOwner.value) {
      pendingPassword.value = originalPassword.value
    }
  }
)

// 进入编辑模式：生成随机密码（如果没有）+ 聚焦输入框
const enterEditMode = () => {
  if (!pendingPassword.value) {
    pendingPassword.value = shortHash().substring(0, 4)
  }
  editing.value = true
  nextTick(() => {
    passwordUInputRef.value?.inputRef?.focus()
    passwordUInputRef.value?.inputRef?.select()
  })
}

// 当锁状态由房主改变时的副作用：若开锁且没有密码，生成随机并进入编辑；若取消则提交空密码
watch(
  () => hasPasswordLocal.value,
  (checked) => {
    if (!isCurrentRoomOwner.value) return

    if (checked) {
      enterEditMode()
    } else {
      // 取消上锁 -> 仅当之前有密码时才通知后端
      pendingPassword.value = ''
      editing.value = false
      if (originalPassword.value) {
        changeRoomPassword('')
      }
    }
  }
)

// 开始编辑（点击密码文字）
const startEdit = () => {
  if (!isCurrentRoomOwner.value) return
  if (!hasPasswordLocal.value) {
    hasPasswordLocal.value = true // 触发 watcher -> enterEditMode
  } else {
    enterEditMode()
  }
}

// 确认（blur 或 Enter）
const onCommit = () => {
  if (!editing.value) return
  editing.value = false

  const val = (pendingPassword.value || '').trim()
  if (!val) {
    // 空密码 => 取消上锁，由 watcher 统一调用 changeRoomPassword
    hasPasswordLocal.value = false
  } else if (val !== room.joinOptions.password) {
    // 有值且与原密码不同 => 提交
    changeRoomPassword(val)
    hasPasswordLocal.value = true
  }
}

// 取消编辑
const onCancel = () => {
  editing.value = false
  // 恢复为外部密码（如果存在）或清空（如果原来无密码）
  pendingPassword.value = originalPassword.value || ''
  if (!originalPassword.value) {
    hasPasswordLocal.value = false
  }
}

/**
 * 切换座位开关
 * @param isOpen
 * @param seat
 */
const onSeatOpenChange = (isOpen?: boolean, seat?: number | string) => {
  setSeatOpen(Number(seat) - 1, Boolean(isOpen))
}

/**
 * 从树上坐下
 * @param seat
 */
const onSeatSit = (seat?: number | string) => {
  sit(Number(seat) - 1)
}

useEventBus('current:room:event:password_change', ({ hasPassword, password }) => {
  if (hasPassword) {
    RoomEventsRef.value?.addMessage({
      type: 'text',
      msg: `房主将房间密码设置为：${password}`
    })
  } else {
    RoomEventsRef.value?.addMessage({
      type: 'text',
      msg: `房主取消了房间密码`
    })
  }
})

useEventBus('current:room:event:player_join', ({ player }) => {
  RoomEventsRef.value?.addMessage({
    type: 'action',
    sender: player,
    msg: `进入了房间`
  })
})

useEventBus('current:room:event:player_leave', ({ player }) => {
  if (isSelf(player.id)) return // 如果是自己，则不显要显示事件，因为自己离开之后会闪一下
  RoomEventsRef.value?.addMessage({
    type: 'action',
    sender: player,
    msg: `离开了房间`
  })
})

useEventBus('current:room:event:onlooker_join', ({ player }) => {
  RoomEventsRef.value?.addMessage({
    type: 'action',
    sender: player,
    msg: `爬到了树上`
  })
})

useEventBus('current:room:event:onlooker_leave', ({ player }) => {
  RoomEventsRef.value?.addMessage({
    type: 'action',
    sender: player,
    msg: `从树上离开了`
  })
})

useEventBus('current:room:event:onlooker_sit', ({ player }) => {
  RoomEventsRef.value?.addMessage({
    type: 'action',
    sender: player,
    msg: `从树上下来了`
  })
})
</script>

<style scoped></style>
