<script setup lang="ts">
const { data } = await useFetch('/api/hello')
console.log(data.value)
</script>

<template>
  <UApp>
    <UiButton size="large" color="red" @click="() => console.log('快速开始')">快速开始</UiButton>
    <UiButton size="small">加入</UiButton>
    <UiButton>创建房间</UiButton>
    <UiButton>等待房间</UiButton>
    <UiButton color="green">发送广播</UiButton>
    <UiButton color="blue">邀请好友</UiButton>

    <UiGameMainFrame />

    <!-- <NuxtRouteAnnouncer />
    <NuxtWelcome /> -->
  </UApp>
</template>
