<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { data: adminData, refresh } = await useFetch('/api/admin/admins/detail')

const newAdminId = ref('')
const showAddModal = ref(false)
const showDeleteConfirm = ref(false)
const deletingAdmin = ref<{ id: string; nickname: string } | null>(null)

const toast = useToast()

const handleAddAdmin = async () => {
  if (!newAdminId.value.trim()) {
    toast.add({ title: '请填写用户 ID', color: 'warning' })
    return
  }

  try {
    await $fetch('/api/admin/admins', {
      method: 'POST',
      body: { id: newAdminId.value.trim() }
    })
    showAddModal.value = false
    newAdminId.value = ''
    toast.add({ title: '添加成功', description: '管理员已添加', color: 'success' })
    refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: '添加失败', description: err.data?.message || '添加管理员时出错', color: 'error' })
  }
}

const confirmDelete = (id: string, nickname: string) => {
  deletingAdmin.value = { id, nickname }
  showDeleteConfirm.value = true
}

const handleDeleteAdmin = async () => {
  if (!deletingAdmin.value) return
  try {
    await $fetch(`/api/admin/admins/${deletingAdmin.value.id}`, { method: 'DELETE' })
    showDeleteConfirm.value = false
    deletingAdmin.value = null
    toast.add({ title: '删除成功', color: 'success' })
    refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: '删除失败', description: err.data?.message || '删除管理员时出错', color: 'error' })
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="管理员管理">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton icon="i-lucide-user-plus" label="添加管理员" color="primary" size="sm" @click="showAddModal = true" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
        <!-- 超级管理员 -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-crown" class="size-5 text-primary" />
              <h3 class="font-semibold text-highlighted">超级管理员</h3>
            </div>
          </template>

          <div v-if="adminData?.superAdmin" class="flex items-center gap-3 p-3 rounded-lg bg-elevated">
            <UAvatar :src="adminData.superAdmin.avatar_url" :alt="adminData.superAdmin.nickname" size="md" />
            <div>
              <p class="font-medium text-highlighted">{{ adminData.superAdmin.nickname }}</p>
              <p class="text-xs text-muted">{{ adminData.superAdmin.email || '无邮箱' }}</p>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <UIcon name="i-lucide-crown" class="size-10 text-dimmed mx-auto mb-3" />
            <p class="text-muted">尚未设置超级管理员</p>
            <UButton to="/admin/init" label="前往初始化" color="primary" variant="outline" class="mt-3" />
          </div>
        </UCard>

        <!-- 普通管理员 -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-shield" class="size-5 text-primary" />
                <h3 class="font-semibold text-highlighted">普通管理员</h3>
              </div>
              <UBadge variant="soft" color="neutral">{{ adminData?.admins?.length || 0 }} 人</UBadge>
            </div>
          </template>

          <div v-if="adminData?.admins?.length" class="divide-y divide-default">
            <div
              v-for="adm in adminData.admins"
              :key="adm.id"
              class="flex items-center justify-between py-4 first:pt-0 last:pb-0"
            >
              <div class="flex items-center gap-3">
                <UAvatar :src="adm.avatar_url" :alt="adm.nickname" size="md" />
                <div>
                  <p class="font-medium text-highlighted">{{ adm.nickname }}</p>
                  <p class="text-xs text-muted">{{ adm.email || '无邮箱' }}</p>
                </div>
              </div>
              <UButton
                icon="i-lucide-trash-2"
                variant="ghost"
                color="error"
                size="sm"
                @click="confirmDelete(adm.id, adm.nickname)"
              />
            </div>
          </div>
          <div v-else class="text-center py-12">
            <UIcon name="i-lucide-shield" class="size-10 text-dimmed mx-auto mb-3" />
            <p class="text-muted">暂无普通管理员</p>
          </div>
        </UCard>
      </div>

      <!-- 添加管理员弹窗 -->
      <UModal v-model:open="showAddModal" :ui="{ footer: 'justify-end' }">
        <template #header>
          <h3 class="text-lg font-semibold text-highlighted">添加管理员</h3>
        </template>
        <template #body>
          <UFormField label="用户 ID" help="输入要设置为管理员的用户 ID">
            <UInput v-model="newAdminId" placeholder="输入用户 ID" />
          </UFormField>
        </template>
        <template #footer>
          <UButton label="取消" color="neutral" variant="outline" @click="showAddModal = false" />
          <UButton label="添加" color="primary" @click="handleAddAdmin" />
        </template>
      </UModal>

      <!-- 删除确认弹窗 -->
      <UModal v-model:open="showDeleteConfirm" :ui="{ footer: 'justify-end' }">
        <template #header>
          <h3 class="text-lg font-semibold text-highlighted">确认删除</h3>
        </template>
        <template #body>
          <p class="text-muted">确定要删除管理员 <strong>{{ deletingAdmin?.nickname }}</strong> 吗？此操作不可撤销。</p>
        </template>
        <template #footer>
          <UButton label="取消" color="neutral" variant="outline" @click="showDeleteConfirm = false" />
          <UButton label="确认删除" color="error" @click="handleDeleteAdmin" />
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
