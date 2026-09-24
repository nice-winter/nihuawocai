<template>
  <div class="flex flex-col">
    <div id="game-rooms" class="relative flex flex-wrap h-[87.72%]">
      <ul class="relative z-1 flex flex-wrap size-full">
        <UiGameMainLobbyRoomListItem
          v-for="room in roomStore.currentPageRooms"
          :key="room.id"
          :room-info="room"
          @join-button-click="() => tryJoin(room.id, room.roomNumber)"
          @look-button-click="() => tryJoin(room.id, room.roomNumber)"
        />
      </ul>

      <ul class="absolute -z-2 flex flex-wrap size-full">
        <li v-for="i in 6" :key="i + Date.now()" class="w-1/2 custom-border-item" />
      </ul>
    </div>

    <div
      class="flex flex-1 items-center gap-4 p-tight bg-tint-soft-400 border-t-2 border-t-white/60"
    >
      <UiButton size="lg" color="red" @click="quickMatch"> 快速开始 </UiButton>

      <div class="flex items-center gap-2 px-4">
        <UInput
          v-model="roomNumberInputValue"
          size="xs"
          placeholder="房间号"
          maxlength="3"
          class="w-14 game-input"
          style="background-color: #fff"
          @keydown.enter.prevent="tryJoin(undefined, Number(roomNumberInputValue), true)"
        />
        <UiButton
          size="sm"
          :disabled="roomNumberInputValue === ''"
          @click="() => tryJoin(undefined, Number(roomNumberInputValue), true)"
        >
          加入
        </UiButton>
      </div>

      <UiButton @click="showOnlyWaitingRooms = !showOnlyWaitingRooms">
        {{ showOnlyWaitingRooms ? '等待房间' : '全部房间' }}
      </UiButton>

      <UiButton @click="tryCreateRoom"> 创建房间 </UiButton>

      <div class="ml-auto flex items-center gap-8 px-4">
        <UiButton type="arrow-left" color="red" @click="prevPage" />
        <UiButton type="arrow-right" color="red" @click="nextPage" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PasswordModal from '@/components/modal/PasswordModal.vue'
import CreateRoomModal from '@/components/modal/CreateRoomModal.vue'

const roomStore = useRoomStore()
const { rooms, pullRoomList, join, prevPage, nextPage, createRoom, quickMatch } = roomStore
const { currentPageRooms, showOnlyWaitingRooms } = storeToRefs(roomStore)

const passwordModal = useModal<string>(PasswordModal, {
  parent: '#game-rooms'
})

const createRoomModal = useModal<{
  opens: number
  password: string
  maxOnlookers: number
}>(CreateRoomModal, {
  parent: '#game-rooms'
})

const roomNumberInputValue = ref('')

// 不要阻塞组件创建，所以放到即将挂载时处理，否则这个组件会比别的组件慢半拍加载导致错位
onBeforeMount(async () => {
  await pullRoomList()
})

/**
 * 尝试加入房间
 * @param roomId 房间身份 ID（列表点击必带，防同号串房）；按号输入时为 undefined
 * @param roomNumber 房间号（用户句柄）
 * @param clearRoomNumberInput 是否清空房间号输入框
 */
const tryJoin = async (
  roomId: string | undefined,
  roomNumber: number,
  clearRoomNumberInput?: boolean
) => {
  if (clearRoomNumberInput) roomNumberInputValue.value = ''
  if (isNaN(roomNumber)) return gameMessageBox.show('房间号格式错误')

  // 列表点击带 roomId 直接取；按号输入无 roomId，按房间号反查仅用于判断是否上锁
  const room = roomId
    ? rooms.get(roomId)
    : [...rooms.values()].find((r) => r.roomNumber === roomNumber)

  if (room?.locked) {
    try {
      const password = await passwordModal.open()
      join(roomNumber, password, roomId)
    } catch {
      // cancel
    }
  } else {
    join(roomNumber, undefined, roomId)
  }
}

const tryCreateRoom = async () => {
  try {
    const { opens, password, maxOnlookers } = await createRoomModal.open()
    createRoom(opens, { password, maxOnlookers })
  } catch {
    //
  }
}
</script>

<style scoped>
.custom-border-item {
  border: 1px solid transparent;
}

/* 水平边框 */
.custom-border-item:nth-child(-n + 4) {
  border-bottom: 1px solid var(--color-gray-200);
}
.custom-border-item:nth-child(n + 3) {
  border-top: 1px solid color-mix(in oklab, var(--color-white) 60%, transparent);
}

/* 垂直边框 */
.custom-border-item:nth-child(odd) {
  border-right: 1px solid var(--color-gray-200);
}
.custom-border-item:nth-child(even) {
  border-left: 1px solid color-mix(in oklab, var(--color-white) 60%, transparent);
}
</style>
