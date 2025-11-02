<template>
  <div>
    <UHeader>
      <template #title>
        <div class="h-6 w-auto" />
      </template>

      <UNavigationMenu :items="items" />

      <template #right>
        <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/nice-winter/nihuawocai"
          target="_blank"
          aria-label="GitHub"
          icon="i-simple-icons-github"
        />

        <UButton variant="outline" color="neutral" to="/user/login"> 登录 </UButton>

        <UButton color="neutral" to="/user/signup" trailing-icon="i-lucide-arrow-right">
          注册
        </UButton>
      </template>
    </UHeader>

    <UContainer>
      <UPage>
        <NuxtPage />
      </UPage>
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
          to="https://github.com/nuxt/nuxt"
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
