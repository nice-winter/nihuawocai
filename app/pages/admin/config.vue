<script setup lang="ts">
import { defaultAppConfig } from '#shared/defaultAppConfig'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { data: config, refresh } = await useFetch('/api/admin/config')
const editingConfig = ref<AppConfig>({ ...defaultAppConfig })
const saving = ref(false)

watchEffect(() => {
  if (config.value) {
    editingConfig.value = JSON.parse(JSON.stringify(config.value))
  }
})

const toast = useToast()

const handleSave = async () => {
  saving.value = true
  try {
    await $fetch('/api/admin/config', { method: 'PUT', body: editingConfig.value })
    toast.add({ title: '保存成功', description: '配置已更新', color: 'success' })
    refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: '保存失败', description: err.data?.message || '更新配置时出错', color: 'error' })
  } finally {
    saving.value = false
  }
}

const showResetConfirm = ref(false)

const handleReset = async () => {
  showResetConfirm.value = false
  saving.value = true
  try {
    await $fetch('/api/admin/config', { method: 'PUT', body: defaultAppConfig })
    toast.add({ title: '重置成功', description: '配置已恢复为默认值', color: 'success' })
    refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: '重置失败', description: err.data?.message || '重置配置时出错', color: 'error' })
  } finally {
    saving.value = false
  }
}

const activeTab = ref('basic')

const tabs = [
  { label: '基础设置', value: 'basic', icon: 'i-lucide-settings' },
  { label: '游戏规则', value: 'game', icon: 'i-lucide-gamepad-2' },
  { label: '时间设置', value: 'time', icon: 'i-lucide-clock' },
  { label: '计分规则', value: 'score', icon: 'i-lucide-trophy' }
]

const announcementColumns = [
  { accessorKey: 'index', header: '序号' },
  { accessorKey: 'content', header: '公告内容' },
  { id: 'actions', header: '操作' }
]

const announcementData = computed(() =>
  editingConfig.value.announcements.map((content, index) => ({ index: index + 1, content }))
)

const genderColumns = [
  { accessorKey: 'label', header: '名称' },
  { accessorKey: 'value', header: '值' },
  { accessorKey: 'icon', header: '图标' },
  { accessorKey: 'color', header: '颜色' },
  { id: 'actions', header: '操作' }
]

const addGender = () => {
  editingConfig.value.genders.push({ label: '', value: editingConfig.value.genders.length, icon: '', color: '' })
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="系统配置">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <div class="flex items-center gap-2">
            <UButton icon="i-lucide-rotate-ccw" variant="outline" color="warning" size="sm" @click="showResetConfirm = true">
              重置默认
            </UButton>
            <UButton icon="i-lucide-save" :loading="saving" color="primary" size="sm" @click="handleSave">
              保存配置
            </UButton>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6 max-w-4xl mx-auto w-full">
      <UCard>
        <UTabs v-model="activeTab" :items="tabs" class="mb-6" />

        <!-- 基础设置 -->
        <div v-if="activeTab === 'basic'" class="space-y-6">
          <UFormField label="应用名称">
            <UInput v-model="editingConfig.name" placeholder="应用名称" />
          </UFormField>

          <!-- 公告列表 -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium text-highlighted">公告列表</h4>
              <UButton icon="i-lucide-plus" size="sm" variant="outline" color="neutral" @click="editingConfig.announcements.push('')">
                添加公告
              </UButton>
            </div>
            <UTable :columns="announcementColumns" :data="announcementData">
              <template #content-cell="{ row }">
                <UInput v-model="editingConfig.announcements[row.index]" class="w-full" />
              </template>
              <template #actions-cell="{ row }">
                <UButton icon="i-lucide-trash-2" variant="ghost" color="error" size="sm" @click="editingConfig.announcements.splice(row.index, 1)" />
              </template>
            </UTable>
          </div>

          <!-- 性别列表 -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium text-highlighted">性别列表</h4>
              <UButton icon="i-lucide-plus" size="sm" variant="outline" color="neutral" @click="addGender">添加性别</UButton>
            </div>
            <UTable :columns="genderColumns" :data="editingConfig.genders">
              <template #label-cell="{ row }">
                <UInput v-model="row.original.label" placeholder="性别名称" size="sm" />
              </template>
              <template #value-cell="{ row }">
                <UInput v-model.number="row.original.value" type="number" size="sm" class="w-20" />
              </template>
              <template #icon-cell="{ row }">
                <UInput v-model="row.original.icon" placeholder="图标名称" size="sm" />
              </template>
              <template #color-cell="{ row }">
                <div class="flex items-center gap-2">
                  <UInput v-model="row.original.color" placeholder="#000000" size="sm" class="w-24" />
                  <div v-if="row.original.color" class="size-6 rounded border border-default" :style="{ backgroundColor: row.original.color }" />
                </div>
              </template>
              <template #actions-cell="{ row }">
                <UButton icon="i-lucide-trash-2" variant="ghost" color="error" size="sm" @click="editingConfig.genders.splice(row.index, 1)" />
              </template>
            </UTable>
          </div>
        </div>

        <!-- 游戏规则 -->
        <div v-if="activeTab === 'game'" class="space-y-6">
          <div class="space-y-4">
            <h4 class="font-medium text-highlighted">房间设置</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="每轮游戏轮数">
                <UInput v-model="editingConfig.game.room.cycle.count" type="number" :min="1" :max="10" />
              </UFormField>
              <UFormField label="最大旁观人数">
                <UInput v-model="editingConfig.game.room.feature.kick" type="number" :min="0" :max="20" />
              </UFormField>
              <UFormField label="房间密码最大长度">
                <UInput v-model="editingConfig.game.room.passwordMaxLengh" type="number" :min="0" :max="20" />
              </UFormField>
            </div>
          </div>

          <USeparator />

          <div class="space-y-4">
            <h4 class="font-medium text-highlighted">功能开关</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 rounded-lg bg-elevated">
                <div>
                  <p class="font-medium text-highlighted">踢人功能</p>
                  <p class="text-sm text-muted">允许房主踢出房间内的玩家</p>
                </div>
                <USwitch v-model="editingConfig.game.room.feature.kick" />
              </div>
              <div class="flex items-center justify-between p-3 rounded-lg bg-elevated">
                <div>
                  <p class="font-medium text-highlighted">广播功能</p>
                  <p class="text-sm text-muted">允许房间内发送广播消息</p>
                </div>
                <USwitch v-model="editingConfig.game.room.feature.broadcast" />
              </div>
              <div class="flex items-center justify-between p-3 rounded-lg bg-elevated">
                <div>
                  <p class="font-medium text-highlighted">邀请空闲玩家</p>
                  <p class="text-sm text-muted">允许邀请大厅中的空闲玩家</p>
                </div>
                <USwitch v-model="editingConfig.game.room.feature.invite.idle" />
              </div>
            </div>
          </div>
        </div>

        <!-- 时间设置 -->
        <div v-if="activeTab === 'time'" class="space-y-6">
          <div class="space-y-4">
            <h4 class="font-medium text-highlighted">大厅设置</h4>
            <UFormField label="聊天消息发送间隔（秒）">
              <UInput v-model="editingConfig.game.lobby.time.chatIntervalTimeSecond" type="number" :min="0" />
            </UFormField>
          </div>

          <USeparator />

          <div class="space-y-4">
            <h4 class="font-medium text-highlighted">房间时间设置</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="广播消息间隔（秒）">
                <UInput v-model="editingConfig.game.room.time.broadcastIntervalTimeSecond" type="number" :min="0" />
              </UFormField>
              <UFormField label="聊天消息间隔（秒）">
                <UInput v-model="editingConfig.game.room.time.chatIntervalTimeSecond" type="number" :min="0" />
              </UFormField>
              <UFormField label="邀请有效时间（秒）">
                <UInput v-model="editingConfig.game.room.time.invitationValidTimeSecond" type="number" :min="5" />
              </UFormField>
              <UFormField label="挂机判定超时（秒）">
                <UInput v-model="editingConfig.game.room.time.afkTimeSecond" type="number" :min="30" />
              </UFormField>
            </div>
          </div>

          <USeparator />

          <div class="space-y-4">
            <h4 class="font-medium text-highlighted">回合时间设置</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="准备等待时间（秒）">
                <UInput v-model="editingConfig.game.room.cycle.time.roundStartWaitTimeSecond" type="number" :min="1" />
              </UFormField>
              <UFormField label="绘画超时时间（秒）">
                <UInput v-model="editingConfig.game.room.cycle.time.roundDrawingTimeoutSecond" type="number" :min="5" />
              </UFormField>
              <UFormField label="绘画时间（秒）">
                <UInput v-model="editingConfig.game.room.cycle.time.roundDrawingTimeSecond" type="number" :min="10" />
              </UFormField>
              <UFormField label="猜对后剩余时间（秒）">
                <UInput v-model="editingConfig.game.room.cycle.time.roundBingoTimeSecond" type="number" :min="5" />
              </UFormField>
              <UFormField label="回合结束等待时间（秒）">
                <UInput v-model="editingConfig.game.room.cycle.time.roundEndWaitTimeSecond" type="number" :min="1" />
              </UFormField>
              <UFormField label="结算展示时间（秒）">
                <UInput v-model="editingConfig.game.room.cycle.time.cycleEndWaitTimeSecond" type="number" :min="3" />
              </UFormField>
            </div>
          </div>
        </div>

        <!-- 计分规则 -->
        <div v-if="activeTab === 'score'" class="space-y-6">
          <div class="space-y-4">
            <h4 class="font-medium text-highlighted">画手计分</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="首次被猜对得分">
                <UInput v-model="editingConfig.game.room.cycle.scoreRule.drawingPlayer.firstBingo" type="number" :min="0" />
              </UFormField>
              <UFormField label="后续被猜对得分">
                <UInput v-model="editingConfig.game.room.cycle.scoreRule.drawingPlayer.bingo" type="number" :min="0" />
              </UFormField>
            </div>
          </div>

          <USeparator />

          <div class="space-y-4">
            <h4 class="font-medium text-highlighted">猜题者计分</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="首答得分">
                <UInput v-model="editingConfig.game.room.cycle.scoreRule.player.firstBingo" type="number" :min="0" />
              </UFormField>
              <UFormField label="后续猜对得分">
                <UInput v-model="editingConfig.game.room.cycle.scoreRule.player.bingo" type="number" :min="0" />
              </UFormField>
            </div>
          </div>

          <USeparator />

          <div class="space-y-4">
            <h4 class="font-medium text-highlighted">结算规则</h4>
            <div class="flex items-center justify-between p-3 rounded-lg bg-elevated">
              <div>
                <p class="font-medium text-highlighted">包含离场玩家</p>
                <p class="text-sm text-muted">最终结算时是否包含中途退出的玩家</p>
              </div>
              <USwitch v-model="editingConfig.game.room.cycle.scoreRule.includeLeaversInSettlement" />
            </div>
          </div>
        </div>
      </UCard>

      <!-- 重置确认弹窗 -->
      <UModal v-model:open="showResetConfirm" :ui="{ footer: 'justify-end' }">
        <template #header>
          <h3 class="text-lg font-semibold text-highlighted">确认重置</h3>
        </template>
        <template #body>
          <p class="text-muted">确定要重置为默认配置吗？这将覆盖所有自定义设置，此操作不可撤销。</p>
        </template>
        <template #footer>
          <UButton label="取消" color="neutral" variant="outline" @click="showResetConfirm = false" />
          <UButton label="确认重置" color="warning" @click="handleReset" />
        </template>
      </UModal>
      </div>
    </template>
  </UDashboardPanel>
</template>
