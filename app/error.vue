<script setup lang="ts">
import type { NuxtError } from '#app'

interface Props {
  error: NuxtError
}

const { error } = defineProps<Props>()
</script>

<template>
  <UApp>
    <UError
      redirect="/"
      :error="{
        statusCode: error.statusCode,
        statusMessage: error.statusMessage,
        message: error.message
      }"
    />
  </UApp>
</template>
