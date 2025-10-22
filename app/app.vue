<script setup lang="ts">
import NButton from './components/ui/NButton.vue'

const { data } = await useFetch('/api/hello')
console.log(data.value)
</script>

<template>
  <UApp>
    <NButton size="large" color="red" @click="() => console.log('快速开始')">快速开始</NButton>
    <NButton size="small">加入</NButton>
    <NButton>创建房间</NButton>
    <NButton>等待房间</NButton>
    <NButton color="green">发送广播</NButton>
    <NButton color="blue">邀请好友</NButton>
    <NuxtRouteAnnouncer />
    <NuxtWelcome />
  </UApp>
</template>
