<template>
  <div>
    <p class="flex gap-4">
      <UButton @click="pullRoomList">拉取房间列表</UButton>
      <UButton @click="create">创房</UButton>
      <UButton @click="leave">退房</UButton>
      <UInput v-model="roomNumber" class="w-16" />
      <UButton @click="join">进房</UButton>
      <UButton @click="msgbox">msgbox</UButton>
    </p>
    <p>Status: {{ status }}</p>
    <p>Data: {{ data }}</p>
    <div>
      <Text :text="text" style="--emoji-size: 20px" />
    </div>

    <div id="test" ref="testRef" class="relative w-3xl h-156 border border-black">
      <UiThrower ref="throwerRef" :container="testRef" />
    </div>

    <div class="flex gap-4">
      <UButton @click="() => flower()">送花</UButton>
      <UButton @click="() => flower(100)">送花100朵</UButton>
      <UButton @click="() => flower(1000)">送花1000朵</UButton>
      <UButton @click="() => flower(114514)">送花114514朵</UButton>
    </div>
    <div class="flex gap-4">
      <UButton @click="() => countdown()">倒计时</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import Text from '~/components/ui/TextRender.vue'
import CountdownModal from '~/components/ui/CountdownModal.vue'

const testRef = ref<HTMLElement | null>(null)
const throwerRef = useTemplateRef('throwerRef')

const flower = (count?: number) => {
  throwerRef.value?.throwFlower(count)
}

const text = `wkmsadkw<a href="111">222</a>啊啊啊{:30:}啊啊啊啊啊啊啊啊啊啊{:💩:}{:19:}？`

const wsStore = useWsStore()
const { send, open } = wsStore
const { status, data } = storeToRefs(wsStore)
const countdownModal = useModal(CountdownModal, { initialValue: 5 }, { parent: '#test' })

const roomNumber = ref('')

onMounted(() => {
  open()
})

const pullRoomList = () => {
  send({
    type: 'room:list_pull'
  })
}

const create = () => {
  send({
    type: 'room:create'
  })
}

const leave = () => {
  send({
    type: 'room:leave'
  })
}

const join = () => {
  if (roomNumber.value) {
    send({
      type: 'room:join',
      roomNumber: Number(roomNumber.value)
    })
  }
}

const msgbox = () => {
  useMessageBox().show('aaaaa')
}

const countdown = async () => {
  await countdownModal.open()
}
</script>

<style lang="scss" scoped></style>
