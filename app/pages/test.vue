<
<template>
  <div>
    <p>Status: {{ status }}</p>
    <p>Data: {{ data }}</p>
    <p>
      <button @click="ws.open">Open</button>
      <button @click="ws.close(1000, 'Closing')">Close</button>
      <button @click="ws.send('hello')">Send hello</button>
    </p>
    <div>
      <Text :text="text" />
    </div>
  </div>
</template>

<script setup>
import Text from '~/components/ui/TextRender.vue'

const text = `wkmsadkw<a href="111">222</a>啊啊啊？`

const ws = useWsStore()
const { status, data } = storeToRefs(ws)

onMounted(() => {
  ws.open()
})
</script>

<style lang="scss" scoped></style>
