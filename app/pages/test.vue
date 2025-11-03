<
<template>
  <div>
    <Text :text="text" :emojis="[]" />
  </div>
</template>

<script setup>
import Text from '~/components/ui/TextRender.vue'

const text = `wkmsadkw<a href="111">222</a>啊啊啊？`
</script>

<style lang="scss" scoped></style>
