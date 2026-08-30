<script setup lang="ts">
import type { UserData } from '~~/shared/types/userData'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { user: currentUser } = useUserSession()
const appConfigStore = useAppConfigStore()
const { appConfig } = storeToRefs(appConfigStore)

// 性别映射
const genderMap = computed(() => {
  const map: Record<number, string> = {}
  for (const g of appConfig.value.genders) {
    map[g.value] = g.label
  }
  return map
})

const page = ref(1)
const pageSize = ref(20)
const search = ref('')
const searchInput = ref('')

const { data: users, refresh, status } = await useFetch('/api/admin/users', {
  query: computed(() => ({ page: page.value, pageSize: pageSize.value, search: search.value }))
})

// 获取管理员列表（用于判断是否是管理员）
const { data: adminData, refresh: refreshAdmins } = await useFetch('/api/admin/admins/detail')
const adminIdSet = computed(() => {
  const ids = new Set<string>()
  if (adminData.value?.superAdmin?.id) ids.add(adminData.value.superAdmin.id)
  for (const a of adminData.value?.admins || []) ids.add(a.id)
  return ids
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null
const handleSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    search.value = searchInput.value
    page.value = 1
  }, 300)
}

const editingUser = ref<UserData | null>(null)
const showEditModal = ref(false)

const openEditModal = (user: UserData) => {
  editingUser.value = JSON.parse(JSON.stringify(user))
  showEditModal.value = true
}

const toast = useToast()

const handleEditSave = async () => {
  if (!editingUser.value) return
  try {
    await $fetch(`/api/admin/users/${editingUser.value.id}`, {
      method: 'PUT',
      body: {
        nickname: editingUser.value.nickname,
        avatar_url: editingUser.value.avatar_url,
        email: editingUser.value.email,
        gender: editingUser.value.gender,
        verification: editingUser.value.verification
      }
    })
    showEditModal.value = false
    editingUser.value = null
    toast.add({ title: '保存成功', description: '用户信息已更新', color: 'success' })
    refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: '保存失败', description: err.data?.message || '更新用户信息时出错', color: 'error' })
  }
}

// 设置/取消管理员
const toggleAdmin = async (user: UserData) => {
  const isCurrentlyAdmin = adminIdSet.value.has(user.id)
  try {
    if (isCurrentlyAdmin) {
      await $fetch(`/api/admin/admins/${user.id}`, { method: 'DELETE' })
      toast.add({ title: '已取消管理员', description: `${user.nickname} 已被移除管理员`, color: 'success' })
    } else {
      await $fetch('/api/admin/admins', { method: 'POST', body: { userId: user.id } })
      toast.add({ title: '已设为管理员', description: `${user.nickname} 已成为管理员`, color: 'success' })
    }
    refreshAdmins()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: '操作失败', description: err.data?.message || '操作时出错', color: 'error' })
  }
}

// 是否是当前登录用户
const isCurrentUser = (userId: string) => currentUser.value?.id === userId

const formatTime = (timestamp: number) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('zh-CN')
}

const authProviderMap: Record<string, string> = { github: 'GitHub', steam: 'Steam', x: 'X (Twitter)' }

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'nickname', header: '昵称' },
  { accessorKey: 'email', header: '邮箱' },
  { accessorKey: 'auth_provider', header: '登录方式' },
  { accessorKey: 'gender', header: '性别' },
  { accessorKey: 'stats.score', header: '积分' },
  { accessorKey: 'stats.total_games', header: '总局数' },
  { accessorKey: 'created_at', header: '注册时间' },
  { id: 'actions', header: '操作' }
]
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="用户管理">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton icon="i-lucide-refresh-cw" variant="ghost" color="neutral" size="sm" @click="refresh(); refreshAdmins()">
            刷新
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        <!-- 搜索 -->
        <UCard>
          <UInput
            v-model="searchInput"
            placeholder="搜索用户昵称、ID 或邮箱..."
            icon="i-lucide-search"
            class="max-w-sm"
            @input="handleSearch"
          />
        </UCard>

        <!-- 表格 -->
        <UCard>
          <UTable :columns="columns" :data="users?.list || []" :loading="status === 'pending'">
            <!-- 登录方式 -->
            <template #auth_provider-cell="{ row }">
              <UBadge variant="soft" color="info">
                {{ authProviderMap[row.original.auth_provider] || row.original.auth_provider }}
              </UBadge>
            </template>

            <!-- 性别 -->
            <template #gender-cell="{ row }">
              <span class="text-muted">{{ genderMap[row.original.gender] || '未知' }}</span>
            </template>

            <!-- 积分 -->
            <template #[`stats.score-cell`]="{ row }">
              <span class="font-medium text-highlighted">{{ row.original.stats?.score || 0 }}</span>
            </template>

            <!-- 注册时间 -->
            <template #created_at-cell="{ row }">
              <span class="text-sm text-muted">{{ formatTime(row.original.created_at) }}</span>
            </template>

            <!-- 操作 -->
            <template #actions-cell="{ row }">
              <div class="flex items-center gap-1">
                <UButton icon="i-lucide-pencil" variant="ghost" color="neutral" size="sm" @click="openEditModal(row.original)" />
                <UTooltip
                  :text="isCurrentUser(row.original.id) ? '不能修改自己的管理员状态' : (adminIdSet.has(row.original.id) ? '取消管理员' : '设为管理员')"
                >
                  <UButton
                    :icon="adminIdSet.has(row.original.id) ? 'i-lucide-shield-off' : 'i-lucide-shield'"
                    variant="ghost"
                    :color="adminIdSet.has(row.original.id) ? 'warning' : 'primary'"
                    size="sm"
                    :disabled="isCurrentUser(row.original.id)"
                    @click="toggleAdmin(row.original)"
                  />
                </UTooltip>
              </div>
            </template>
          </UTable>

          <div v-if="users?.total" class="flex justify-center mt-4 pt-4 border-t border-default">
            <UPagination v-model:page="page" :total="users.total" :page-size="pageSize" :sibling-count="2" />
          </div>
        </UCard>
      </div>

      <!-- 编辑用户弹窗 -->
      <UModal v-model:open="showEditModal" :ui="{ footer: 'justify-end' }">
        <template #header>
          <h3 class="text-lg font-semibold text-highlighted">编辑用户</h3>
        </template>
        <template #body>
          <div v-if="editingUser" class="space-y-4">
            <UFormField label="昵称">
              <UInput v-model="editingUser.nickname" />
            </UFormField>
            <UFormField label="头像 URL">
              <UInput v-model="editingUser.avatar_url" />
            </UFormField>
            <UFormField label="邮箱">
              <UInput v-model="editingUser.email" type="email" />
            </UFormField>
            <UFormField label="性别">
              <USelect
                v-model="editingUser.gender"
                :items="appConfig.genders.map(g => ({ label: g.label, value: g.value }))"
                class="w-full"
              />
            </UFormField>
            <UFormField label="认证状态">
              <div class="flex items-center gap-3">
                <USwitch v-model="editingUser.verification.verified" />
                <span class="text-sm text-muted">
                  {{ editingUser.verification.verified ? '已认证' : '未认证' }}
                </span>
              </div>
            </UFormField>
            <UFormField v-if="editingUser.verification.verified" label="认证说明">
              <UInput v-model="editingUser.verification.description" />
            </UFormField>
          </div>
        </template>
        <template #footer>
          <UButton label="取消" color="neutral" variant="outline" @click="showEditModal = false" />
          <UButton label="保存" color="primary" @click="handleEditSave" />
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
