<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()

const { pull } = useAppConfigStore()
await pull()
</script>

<template>
  <UApp :toaster="{ expand: false }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<style scoped></style>
