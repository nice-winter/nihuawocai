<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()

watch(
  loggedIn,
  () => {
    if (!loggedIn.value) {
      navigateTo('/user/login')
    }
  },
  {
    immediate: true
  }
)
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<style scoped></style>
