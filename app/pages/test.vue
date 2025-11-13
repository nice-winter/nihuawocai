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
      <Text :text="text" :emojis="emojis" style="--emoji-size: 20px" />
    </div>
  </div>
</template>

<script setup>
import Text from '~/components/ui/TextRender.vue'
import { faces } from '#shared/defaultFaces'

const text = `wkmsadkw<a href="111">222</a>啊啊啊{:30:}啊啊啊啊啊啊啊啊啊啊{:💩:}{:19:}？`

const wsStore = useWsStore()
const { send, open } = wsStore
const { status, data } = storeToRefs(wsStore)

const emojis = faces

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
</script>

<style lang="scss" scoped></style>
