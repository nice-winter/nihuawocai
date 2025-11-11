<template>
  <div class="text-[13px] flex gap-4">
    <UUser :avatar="{ src: user?.avatar_url }" :name="user?.nickname" />
    <UiLinkButton class="underline" @click="openUserProfileModal">个人资料</UiLinkButton>
    <UiLinkButton @click="logout">注销</UiLinkButton>
  </div>
</template>

<script setup lang="ts">
import { eventBus } from '~/composables/eventBus'
import LazyUserProfileModal from './UserProfileModal.vue'

const { loggedIn, user, clear } = useUserSession()

const overlay = useOverlay()
const modal = overlay.create(LazyUserProfileModal)

const openUserProfileModal = async () => {
  const instance = modal.open({})
  const saveUserProfile = await instance.result
  if (saveUserProfile) {
    return
  }
}

const logout = async () => {
  await clear()
  eventBus.emit('user:logout')
}
</script>

<style scoped></style>
