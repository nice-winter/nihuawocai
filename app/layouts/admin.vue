<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const showLogoutConfirm = ref(false)

const items = computed<NavigationMenuItem[]>(() => [{
  label: '数据总览',
  icon: 'i-lucide-layout-dashboard',
  to: '/admin'
}, {
  label: '用户管理',
  icon: 'i-lucide-users',
  to: '/admin/users'
}, {
  label: '词库管理',
  icon: 'i-lucide-book-open',
  to: '/admin/words'
}, {
  label: '管理员',
  icon: 'i-lucide-shield',
  to: '/admin/admins'
}, {
  label: '应用配置',
  icon: 'i-lucide-settings',
  to: '/admin/config'
}])

const handleLogout = async () => {
  showLogoutConfirm.value = false
  await navigateTo('/admin/login')
}
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible>
      <template #header="{ collapsed }">
        <div class="flex items-center gap-2">
          <div class="size-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <UIcon name="i-lucide-palette" class="size-4 text-inverted" />
          </div>
          <span v-if="!collapsed" class="font-bold text-highlighted truncate">
            NiHuaWoCai
          </span>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="items"
          orientation="vertical"
        />
      </template>

      <template #footer="{ collapsed }">
        <UButton
          :icon="collapsed ? 'i-lucide-log-out' : undefined"
          :label="collapsed ? undefined : '退出登录'"
          color="neutral"
          variant="ghost"
          :block="!collapsed"
          @click="showLogoutConfirm = true"
        />
      </template>
    </UDashboardSidebar>

    <slot />

    <UModal v-model:open="showLogoutConfirm" :ui="{ footer: 'justify-end' }">
      <template #header>
        <h3 class="text-lg font-semibold text-highlighted">确认退出</h3>
      </template>
      <template #body>
        <p class="text-muted">确定要退出管理后台吗？</p>
      </template>
      <template #footer>
        <UButton label="取消" color="neutral" variant="outline" @click="showLogoutConfirm = false" />
        <UButton label="确认退出" color="error" @click="handleLogout" />
      </template>
    </UModal>
  </UDashboardGroup>
</template>
