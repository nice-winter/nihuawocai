<
<template>
  <div class="text-[13px] flex gap-4">
    <UUser :avatar="{ src: user?.avatar_url }" :name="user?.nickname" />
    <UiLinkButton @click="logout">注销</UiLinkButton>
  </div>
</template>

<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()

const logout = async () => {
  const data = await $fetch('/user/logout')
  if (data.success) {
    await clear()
  }
}
</script>

<style scoped></style>
