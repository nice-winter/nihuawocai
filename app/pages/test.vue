<
<template>
  <div>
    <p>Status: {{ status }}</p>
    <p>Data: {{ data }}</p>
    <p>
      <button @click="open">Open</button>
      <button @click="close(1000, 'Closing')">Close</button>
      <button @click="send('hello')">Send hello</button>
    </p>
    <div>
      <Text :text="text" :emojis="[]" />
    </div>
  </div>
</template>

<script setup>
import Text from '~/components/ui/TextRender.vue'
const text = `wkmsadkw<a href="111">222</a>啊啊啊？`

const { status, data, send, open, close } = useWebSocket('/_ws/server', { immediate: false })
onMounted(open)
</script>

<style lang="scss" scoped></style>
