<script setup lang="ts">
import * as locales from '@nuxt/ui/locale'

const { locale } = useI18n()
// const { loggedIn, user, clear } = useUserSession()
const { pull } = useAppConfigStore()

const lang = computed(() => locales[locale.value].code)
const dir = computed(() => locales[locale.value].dir)

useHead({
  htmlAttrs: {
    lang,
    dir
  }
})

try {
  await pull()
} catch (e) {
  console.warn('[app-config] 拉取远程配置失败，使用默认配置', e)
}
</script>

<template>
  <UApp :locale="locales[locale]" :toaster="{ expand: false }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<style scoped></style>
