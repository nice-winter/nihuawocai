<script setup lang="ts">
const { data } = await useFetch('/api/hello')
console.log(data.value)
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtWelcome />
  </div>
</template>
