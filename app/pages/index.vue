<template>
  <div>
    <UHeader>
      <template #title>
        <img src="~/assets/logo.png" class="h-6 w-auto" />
        <!-- <span class="text-sm text-gray-400">复刻版</span> -->
      </template>

      <UNavigationMenu :items="items" />

      <template #right>
        <UserMenu v-if="user" class="w-50" />
        <UButton v-else color="neutral" to="/user/login" trailing-icon="i-lucide-arrow-right">
          登录
        </UButton>
      </template>
    </UHeader>

    <UContainer>
      <NuxtPage />
    </UContainer>

    <UFooter>
      <template #left>
        <p class="text-muted text-sm">Copyright © {{ new Date().getFullYear() }} Winter.</p>
      </template>

      <UNavigationMenu :items="items" variant="link" />

      <template #right>
        <UButton
          icon="i-simple-icons-discord"
          color="neutral"
          variant="ghost"
          to="https://go.nuxt.com/discord"
          target="_blank"
          aria-label="Discord"
        />
        <UButton
          icon="i-simple-icons-x"
          color="neutral"
          variant="ghost"
          to="https://go.nuxt.com/x"
          target="_blank"
          aria-label="X"
        />
        <UButton
          icon="i-simple-icons-github"
          color="neutral"
          variant="ghost"
          to="https://github.com/nice-winter/nihuawocai"
          target="_blank"
          aria-label="GitHub"
        />
      </template>
    </UFooter>
  </div>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const { loggedIn, user, clear } = useUserSession()
console.log(user.value)

const items = computed<NavigationMenuItem[]>(() => [])

const footerItems: NavigationMenuItem[] = [
  {
    label: 'Figma Kit',
    to: 'https://go.nuxt.com/figma-ui',
    target: '_blank'
  },
  {
    label: 'Playground',
    to: 'https://stackblitz.com/edit/nuxt-ui',
    target: '_blank'
  },
  {
    label: 'Releases',
    to: 'https://github.com/nuxt/ui/releases',
    target: '_blank'
  }
]
</script>

<style scoped></style>
