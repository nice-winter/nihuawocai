<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { data: stats, refresh: refreshStats } = await useFetch('/api/admin/stats')
const { data: adminDetail } = await useFetch('/api/admin/admins/detail')

const getDifficultyLabel = (difficulty?: string) => {
  const map: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难' }
  return map[difficulty || ''] || '未知'
}

const statCards = computed(() => [
  { label: '总用户数', value: stats.value?.totalUsers ?? 0, icon: 'i-lucide-users', color: 'primary' as const },
  { label: '在线玩家', value: stats.value?.onlinePlayers ?? 0, icon: 'i-lucide-wifi', color: 'success' as const },
  { label: '活跃房间', value: stats.value?.activeRooms ?? 0, icon: 'i-lucide-home', color: 'info' as const },
  { label: '词库数量', value: stats.value?.totalWordLibraries ?? 0, icon: 'i-lucide-book-open', color: 'warning' as const }
])

const adminCount = computed(() => {
  if (!adminDetail.value) return 0
  return (adminDetail.value.superAdmin ? 1 : 0) + (adminDetail.value.admins?.length || 0)
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="数据总览">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton icon="i-lucide-refresh-cw" variant="ghost" color="neutral" size="sm" @click="refreshStats()">
            刷新
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
        <!-- 统计卡片 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UCard v-for="stat in statCards" :key="stat.label">
            <div class="flex items-center gap-4">
              <div
                class="size-12 rounded-lg flex items-center justify-center"
                :class="{
                  'bg-primary/10 text-primary': stat.color === 'primary',
                  'bg-success/10 text-success': stat.color === 'success',
                  'bg-info/10 text-info': stat.color === 'info',
                  'bg-warning/10 text-warning': stat.color === 'warning'
                }"
              >
                <UIcon :name="stat.icon" class="size-6" />
              </div>
              <div>
                <p class="text-2xl font-bold text-highlighted">{{ stat.value }}</p>
                <p class="text-sm text-muted">{{ stat.label }}</p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- 系统信息 -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-info" class="size-5 text-primary" />
              <h3 class="font-semibold text-highlighted">系统信息</h3>
            </div>
          </template>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex items-center justify-between p-3 rounded-lg bg-elevated">
              <span class="text-sm text-muted">服务器运行时间</span>
              <span class="text-sm font-medium text-highlighted">
                {{ Math.floor((stats?.serverUptime ?? 0) / 3600) }} 小时
                {{ Math.floor(((stats?.serverUptime ?? 0) % 3600) / 60) }} 分钟
              </span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg bg-elevated">
              <span class="text-sm text-muted">管理员数量</span>
              <span class="text-sm font-medium text-highlighted">{{ adminCount }} 人</span>
            </div>
          </div>
        </UCard>

        <!-- 快速操作 -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-zap" class="size-5 text-primary" />
              <h3 class="font-semibold text-highlighted">快速操作</h3>
            </div>
          </template>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <UButton to="/admin/users" variant="outline" color="neutral" icon="i-lucide-users" label="用户管理" block />
            <UButton to="/admin/words" variant="outline" color="neutral" icon="i-lucide-book-open" label="词库管理" block />
            <UButton to="/admin/admins" variant="outline" color="neutral" icon="i-lucide-shield" label="管理员" block />
            <UButton to="/admin/config" variant="outline" color="neutral" icon="i-lucide-settings" label="应用配置" block />
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
