<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()

const { pull } = useAppConfigStore()
await pull()
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<style scoped></style>
