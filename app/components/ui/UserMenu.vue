<
<template>
  <div class="text-[13px] flex gap-4">
    <UUser :avatar="{ src: user?.avatar_url }" :name="user?.nickname" />
    <UiLinkButton class="underline" @click="openUserProfileModel">个人资料</UiLinkButton>
    <UiLinkButton @click="logout">注销</UiLinkButton>
  </div>
</template>

<script setup lang="ts">
import { eventBus } from '~/common/eventBus'
import LazyUserProfileModel from './UserProfileModel.vue'

const { loggedIn, user, clear } = useUserSession()

const overlay = useOverlay()
const modal = overlay.create(LazyUserProfileModel)

const openUserProfileModel = async () => {
  const instance = modal.open({})
  const shouldIncrement = await instance.result
  if (shouldIncrement) {
    return
  }
}

const logout = async () => {
  await clear()
  eventBus.emit('user:logout')
}
</script>

<style scoped></style>
