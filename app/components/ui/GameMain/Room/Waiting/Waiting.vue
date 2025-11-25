<template>
  <div
    class="px-[0.785rem] h-[21.05%] border-b-4 border-[#eeddcb] flex flex-row gap-[0.785rem] relative"
  >
    <div class="flex flex-col justify-center gap-[0.785rem] w-36">
      <UiGameMainRoomNumber :room-number="roomInfo.roomNumber || 0" />
      <span class="relative inline-flex items-center gap-1 pl-1 align-text-bottom">
        <UCheckbox
          v-model="lockedLocal"
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

        <span v-if="editing" class="absolute left-[58px] w-16">
          <UInput
            ref="passwordUInputRef"
            v-model="pendingPassword"
            class="game-input"
            size="xs"
            maxlength="4"
            @blur="onCommit"
            @keydown.enter.prevent="onCommit"
            @keydown.esc.prevent="onCancel"
          />
        </span>
      </span>
    </div>

    <div class="w-52 flex flex-col justify-center pr-4">
      <div class="w-full h-20 text-[13px]">
        <UiGameMainMessageList
          ref="RoomEvents"
          class="text-[#c3b4a0]"
          style="--action-text-color: #c3b4a0"
        />
      </div>
    </div>

    <div class="flex flex-col justify-center">
      <div class="grid grid-cols-2 grid-rows-2 gap-[0.785rem]">
        <UiButton
          color="green"
          :disabled="broadcastRecord.get(roomInfo.roomNumber)"
          @click="broadcast"
          >{{ !broadcastRecord.get(roomInfo.roomNumber) ? '广播邀请' : '已广播' }}</UiButton
        >
        <UiButton color="blue">邀请好友</UiButton>
        <div>
          <UiButton v-if="isCurrentRoomOwner && !roomInfo.locked && canStart">再等一会</UiButton>
        </div>
        <div>
          <UiButton v-if="isCurrentRoomOwner" color="red" :disabled="!canStart" @click="start"
            >立即开始</UiButton
          >
        </div>
      </div>
    </div>

    <div class="grow flex flex-col items-center justify-center">
      <UiGameMainRoomTimer
        v-if="!roomInfo.locked && canStart"
        ref="Timer"
        v-model:seconds="prepareStartSeconds"
      />
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
        <span class="mt-[-13px] font-cuyuan text-lg text-(--game-red)">房主</span>
      </span>

      <UiAvatar
        :id="i"
        :open="roomInfo?.seats![i - 1]"
        class="size-[114px]"
        :player="roomInfo?.players![i - 1] || undefined"
        :mode="seatMode"
        :disabled="(!isCurrentRoomOwner && !isOnlooker) || (isOnlooker && !roomInfo?.seats![i - 1])"
        :verified-icon="{ show: true, size: 16 }"
        :placeholder="isOnlooker ? '点击坐下' : undefined"
        @switch="onSeatSwitch"
        @sit="onSeatSit"
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
const { roomInfo } = defineProps<{ roomInfo: Room }>()
const playerStore = usePlayerStore()
const { isSelf } = playerStore
const { loggedInPlayer, isOnlooker } = storeToRefs(playerStore)
const roomStore = useRoomStore()
const { sit, switchSeat, changeRoomPassword, broadcast, start } = roomStore
const { isCurrentRoomOwner, broadcastRecord } = storeToRefs(roomStore)

const passwordUInputRef = useTemplateRef('passwordUInputRef')
const RoomEventsRef = useTemplateRef('RoomEvents')
const TimerRef = useTemplateRef('Timer')

const prepareStartSeconds = ref(13)

// 是否可开始
const canStart = computed(() => roomInfo.players.filter((p) => p).length > 1)
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
const lockedLocal = ref(roomInfo.locked)
const editing = ref(false)

// pendingPassword：编辑时的临时值；originalPassword：来自 roomInfo 的当前密码（只读）
const pendingPassword = ref(roomInfo.locked ? roomInfo.options.password || '' : '')
const originalPassword = computed(() => (roomInfo.locked ? roomInfo.options.password || '' : ''))

const displayHasPassword = computed(
  () =>
    lockedLocal.value &&
    (isCurrentRoomOwner.value
      ? pendingPassword.value !== '' || originalPassword.value !== ''
      : originalPassword.value !== '')
)

const displayText = computed(() => {
  if (!lockedLocal.value) return '密码'
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

// 同步外部变更（当 roomInfo 改变时，非房主应跟随）
watch(
  () => roomInfo.locked,
  (val) => {
    if (!isCurrentRoomOwner.value) {
      lockedLocal.value = val
      pendingPassword.value = originalPassword.value
    }
  }
)
watch(
  () => roomInfo.options?.password,
  (val) => {
    if (!isCurrentRoomOwner.value) {
      pendingPassword.value = originalPassword.value
    }
  }
)

// 当锁状态由房主改变时的副作用：若开锁且没有密码，生成随机并进入编辑；若取消则提交空密码
watch(
  () => lockedLocal.value,
  (checked) => {
    if (!isCurrentRoomOwner.value) return

    // 用户点勾选：进入编辑并生成随机（如果没有现有密码）
    if (checked) {
      if (!pendingPassword.value) {
        pendingPassword.value = shortHash().substring(0, 4)
      }
      // 自动进入编辑状态以便用户确认/修改
      editing.value = true
      nextTick(() => {
        passwordUInputRef.value?.inputRef?.focus()
        passwordUInputRef.value?.inputRef?.select()
      })
    } else {
      // 取消上锁 -> 直接提交空密码
      pendingPassword.value = ''
      // 立即通知后端/状态
      changeRoomPassword(roomInfo.roomNumber, '')
      editing.value = false
    }
  }
)

// 开始编辑（点击密码文字）
const startEdit = () => {
  if (!isCurrentRoomOwner.value) return
  if (!lockedLocal.value) {
    // 如果之前没锁，先置为锁定并生成随机密码
    lockedLocal.value = true
    pendingPassword.value = shortHash().substring(0, 4)
  }
  editing.value = true
  nextTick(() => {
    passwordUInputRef.value?.inputRef?.focus()
    passwordUInputRef.value?.inputRef?.select()
  })
}

// 确认（blur 或 Enter）
const onCommit = () => {
  if (!editing.value) return
  // 隐藏编辑态
  editing.value = false

  // 如果输入为空 => 视为取消上锁
  const val = (pendingPassword.value || '').trim()
  if (!val) {
    lockedLocal.value = false
    return
  } else if (val === roomInfo.options.password) {
    return
  } else {
    // 有值：提交密码
    changeRoomPassword(roomInfo.roomNumber, val)
    // 同步 original（服务端回来的 roomInfo 应该最终覆盖，但我们先乐观更新 pending）
    // 保持 lockedLocal true
    lockedLocal.value = true
  }
}

// 取消编辑
const onCancel = () => {
  editing.value = false
  // 恢复为外部密码（如果存在）或清空（如果原来无密码）
  pendingPassword.value = originalPassword.value || ''
  if (!originalPassword.value) {
    lockedLocal.value = false
  }
}

/**
 * 切换座位开关
 * @param open
 * @param seat
 */
const onSeatSwitch = (open?: boolean, seat?: number | string) => {
  switchSeat(roomInfo.roomNumber, Number(seat) - 1, Boolean(open))
}

/**
 * 从树上坐下
 * @param seat
 */
const onSeatSit = (seat?: number | string) => {
  sit(Number(seat) - 1)
}

useEventBus('current:room:event:password_change', ({ locked, password }) => {
  if (locked) {
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
