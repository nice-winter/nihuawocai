<template>
  <div class="flex flex-col">
    <div id="game-rooms" class="h-[87.72%] flex flex-wrap relative">
      <ul class="z-1 size-full flex flex-wrap">
        <UiGameMainLobbyRoomListItem
          v-for="room in roomStore.currentPageRooms"
          :key="room.roomNumber"
          :room-info="room"
          @join-button-click="() => tryJoin(room.roomNumber)"
          @look-button-click="() => tryJoin(room.roomNumber)"
        />
      </ul>

      <ul class="size-full flex flex-wrap absolute -z-2">
        <li v-for="i in 6" :key="i + Date.now()" class="w-1/2 custom-border-item" />
      </ul>
    </div>

    <div
      class="flex-1 flex items-center gap-4 p-tight bg-tint-soft-400 border-t-2 border-t-white/60"
    >
      <UiButton size="lg" color="red" @click="quickMatch"> 快速开始 </UiButton>
      <div class="px-4 flex gap-2 items-center">
        <UInput
          v-model="roomNumberInputValue"
          size="xs"
          placeholder="房间号"
          maxlength="3"
          class="game-input w-14"
          style="background-color: #fff"
          @keydown.enter.prevent="tryJoin(Number(roomNumberInputValue), true)"
        />
        <UiButton
          size="sm"
          :disabled="roomNumberInputValue === ''"
          @click="() => tryJoin(Number(roomNumberInputValue), true)"
          >加入</UiButton
        >
      </div>
      <UiButton @click="showOnlyWaitingRooms = !showOnlyWaitingRooms">{{
        showOnlyWaitingRooms ? '等待房间' : '全部房间'
      }}</UiButton>
      <UiButton @click="tryCreateRoom">创建房间</UiButton>
      <div class="px-4 flex gap-8 items-center ml-auto">
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
const { currentPageRooms, currentPageNumber, showOnlyWaitingRooms } = storeToRefs(roomStore)
const passwordModal = useModal<string>(PasswordModal, { parent: '#game-rooms' })
const createRoomModal = useModal<{ opens: number; password: string; maxOnlookers: number }>(
  CreateRoomModal,
  { parent: '#game-rooms' }
)

const roomNumberInputValue = ref('')

// 不要阻塞组件创建，所以放到即将挂载时处理，否则这个组件会比别的组件慢半拍加载导致错位
onBeforeMount(async () => {
  await pullRoomList() // 拉取房间列表
})

const tryJoin = async (roomNumber: number, clearRoomNumberInput?: boolean) => {
  if (clearRoomNumberInput) roomNumberInputValue.value = ''
  if (isNaN(roomNumber)) return gameMessageBox.show('房间号格式错误')
  if (rooms.get(roomNumber)?.locked) {
    try {
      const password = await passwordModal.open()
      join(roomNumber, password)
    } catch (err) {
      console.log('cancel', err)
    }
  } else {
    join(roomNumber)
  }
}

const tryCreateRoom = async () => {
  try {
    const { opens, password, maxOnlookers } = await createRoomModal.open()
    createRoom(opens, {
      password,
      maxOnlookers
    })
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

/* 垂直边框 - 奇数列右边框，偶数列左边框 */
.custom-border-item:nth-child(odd) {
  border-right: 1px solid var(--color-gray-200);
}
.custom-border-item:nth-child(even) {
  border-left: 1px solid color-mix(in oklab, var(--color-white) 60%, transparent);
}
</style>
