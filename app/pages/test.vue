<
<template>
  <div>
    <p>Status: {{ status }}</p>
    <p>Data: {{ data }}</p>
    <p class="flex gap-4">
      <UButton @click="pullRoomList">拉取房间列表</UButton>
    </p>
    <div>
      <Text :text="text" />
    </div>
  </div>
</template>

<script setup>
import Text from '~/components/ui/TextRender.vue'

const text = `wkmsadkw<a href="111">222</a>啊啊啊？`

const wsStore = useWsStore()
const { send, open } = wsStore
const { status, data } = storeToRefs(wsStore)

onMounted(() => {
  open()
})

const pullRoomList = () => {
  send({
    type: 'room_list:pull'
  })
}
</script>

<style lang="scss" scoped></style>
