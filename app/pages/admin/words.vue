<script setup lang="ts">
import type { WordItem } from '~~/server/services/word'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { data: libraries, refresh, status } = await useFetch('/api/admin/words')

const showEditModal = ref(false)
const editingLibrary = ref<{
  id?: string
  name: string
  description: string
  words: WordItem[]
}>({
  name: '',
  description: '',
  words: []
})
const isNewLibrary = ref(false)

const wordPage = ref(1)
const wordPageSize = 20
const wordListTotal = computed(() => editingLibrary.value?.words?.length || 0)

const paginatedWords = computed(() => {
  const words = editingLibrary.value?.words || []
  const start = (wordPage.value - 1) * wordPageSize
  return words.slice(start, start + wordPageSize).map((w, i) => ({
    ...w,
    _index: start + i
  }))
})

const openCreateModal = () => {
  editingLibrary.value = { name: '', description: '', words: [] }
  wordPage.value = 1
  isNewLibrary.value = true
  showEditModal.value = true
}

const openEditModal = async (libraryId: string) => {
  try {
    const detail = await $fetch(`/api/admin/words/${libraryId}`)
    editingLibrary.value = {
      id: libraryId,
      name: detail.name,
      description: (detail as { description?: string }).description || '',
      words: detail.words || []
    }
    wordPage.value = 1
    isNewLibrary.value = false
    showEditModal.value = true
  } catch (e) {
    console.error('获取词库详情失败:', e)
  }
}

const addWord = () => {
  if (!editingLibrary.value.words) editingLibrary.value.words = []
  editingLibrary.value.words.push({ word: '', prompts: [] })
}

const removeWord = (index: number) => {
  editingLibrary.value.words.splice(index, 1)
}

const addPrompt = (wordIndex: number) => {
  const word = editingLibrary.value?.words?.[wordIndex]
  if (!word) return
  if (!word.prompts) word.prompts = []
  word.prompts.push('')
}

const removePrompt = (wordIndex: number, promptIndex: number) => {
  editingLibrary.value?.words?.[wordIndex]?.prompts?.splice(promptIndex, 1)
}

const toast = useToast()

const handleSave = async () => {
  if (!editingLibrary.value.name.trim()) {
    toast.add({ title: '请填写词库名称', color: 'warning' })
    return
  }

  try {
    if (isNewLibrary.value) {
      await $fetch('/api/admin/words', {
        method: 'POST',
        body: {
          name: editingLibrary.value.name,
          description: editingLibrary.value.description,
          words: editingLibrary.value.words
        }
      })
      toast.add({ title: '创建成功', description: '词库已创建', color: 'success' })
    } else if (editingLibrary.value.id) {
      await $fetch(`/api/admin/words/${editingLibrary.value.id}`, {
        method: 'PUT',
        body: {
          name: editingLibrary.value.name,
          description: editingLibrary.value.description,
          words: editingLibrary.value.words
        }
      })
      toast.add({ title: '保存成功', description: '词库已更新', color: 'success' })
    }
    showEditModal.value = false
    refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: '保存失败', description: err.data?.message || '保存词库时出错', color: 'error' })
  }
}

const showDeleteConfirm = ref(false)
const deletingLibraryId = ref<string | null>(null)

const confirmDelete = (id: string) => {
  deletingLibraryId.value = id
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  if (!deletingLibraryId.value) return
  try {
    await $fetch(`/api/admin/words/${deletingLibraryId.value}`, { method: 'DELETE' })
    showDeleteConfirm.value = false
    deletingLibraryId.value = null
    toast.add({ title: '删除成功', color: 'success' })
    refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ title: '删除失败', description: err.data?.message || '删除词库时出错', color: 'error' })
  }
}

const wordColumns = [
  { accessorKey: '_index', header: '序号' },
  { accessorKey: 'word', header: '词汇' },
  { accessorKey: 'prompts', header: '提示词' },
  { id: 'actions', header: '操作' }
]
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="词库管理">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton icon="i-lucide-plus" label="新建词库" color="primary" size="sm" @click="openCreateModal" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 sm:p-6 max-w-4xl mx-auto w-full">
      <UCard>
        <div v-if="status === 'pending'" class="flex items-center justify-center py-12">
          <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-muted" />
        </div>

        <div v-else-if="!libraries?.length" class="text-center py-12">
          <UIcon name="i-lucide-book-open" class="size-10 text-dimmed mx-auto mb-3" />
          <p class="text-muted mb-4">暂无词库</p>
          <UButton icon="i-lucide-plus" label="创建第一个词库" color="primary" @click="openCreateModal" />
        </div>

        <div v-else class="divide-y divide-default">
          <div
            v-for="library in libraries"
            :key="library.id"
            class="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            <div class="flex items-center gap-4">
              <div class="size-10 rounded-lg bg-elevated flex items-center justify-center">
                <UIcon name="i-lucide-book-open" class="size-5 text-muted" />
              </div>
              <div>
                <p class="font-medium text-highlighted">{{ library.name }}</p>
                <p class="text-sm text-muted">{{ library.wordCount || 0 }} 个词汇</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <UButton icon="i-lucide-pencil" variant="ghost" color="neutral" size="sm" @click="openEditModal(library.id)">
                编辑
              </UButton>
              <UButton icon="i-lucide-trash-2" variant="ghost" color="error" size="sm" @click="confirmDelete(library.id)" />
            </div>
          </div>
        </div>
      </UCard>

      <!-- 编辑/创建词库弹窗 -->
      <UModal v-model:open="showEditModal" :ui="{ content: 'max-w-4xl' }">
        <template #header>
          <h3 class="text-lg font-semibold text-highlighted">
            {{ isNewLibrary ? '新建词库' : '编辑词库' }}
          </h3>
        </template>
        <template #body>
          <div v-if="editingLibrary" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="词库名称">
                <UInput v-model="editingLibrary.name" placeholder="输入词库名称" />
              </UFormField>
              <UFormField label="描述">
                <UInput v-model="editingLibrary.description" placeholder="词库描述（可选）" />
              </UFormField>
            </div>

            <div>
              <div class="flex items-center justify-between mb-3">
                <h4 class="font-medium text-highlighted">词汇列表</h4>
                <UButton icon="i-lucide-plus" size="sm" variant="outline" color="neutral" @click="addWord">添加词汇</UButton>
              </div>

              <UTable :columns="wordColumns" :data="paginatedWords">
                <template #_index-cell="{ row }">
                  <span class="text-muted">{{ (row.original._index ?? 0) + 1 }}</span>
                </template>
                <template #word-cell="{ row }">
                  <UInput
                    :model-value="editingLibrary.words[row.original._index!]?.word ?? ''"
                    size="sm"
                    placeholder="输入词汇"
                    @update:model-value="(v: string) => { const w = editingLibrary?.words?.[row.original._index!]; if (w) w.word = v }"
                  />
                </template>
                <template #prompts-cell="{ row }">
                  <div class="flex flex-wrap gap-1">
                    <UBadge
                      v-for="(prompt, pIdx) in (editingLibrary.words[row.original._index!]?.prompts || [])"
                      :key="pIdx"
                      variant="soft"
                      color="neutral"
                      size="sm"
                    >
                      {{ prompt }}
                    </UBadge>
                    <UButton
                      icon="i-lucide-plus"
                      size="xs"
                      variant="ghost"
                      color="neutral"
                      @click="addPrompt(row.original._index!)"
                    />
                  </div>
                </template>
                <template #actions-cell="{ row }">
                  <UButton icon="i-lucide-trash-2" variant="ghost" color="error" size="sm" @click="removeWord(row.original._index!)" />
                </template>
              </UTable>

              <div v-if="wordListTotal > wordPageSize" class="flex justify-center mt-4">
                <UPagination v-model:page="wordPage" :total="wordListTotal" :items-per-page="wordPageSize" :sibling-count="2" />
              </div>
            </div>
          </div>
        </template>
        <template #footer>
          <UButton label="取消" color="neutral" variant="outline" @click="showEditModal = false" />
          <UButton label="保存" color="primary" @click="handleSave" />
        </template>
      </UModal>

      <!-- 删除确认弹窗 -->
      <UModal v-model:open="showDeleteConfirm" :ui="{ footer: 'justify-end' }">
        <template #header>
          <h3 class="text-lg font-semibold text-highlighted">确认删除</h3>
        </template>
        <template #body>
          <p class="text-muted">确定要删除这个词库吗？所有词汇将被永久删除，此操作不可撤销。</p>
        </template>
        <template #footer>
          <UButton label="取消" color="neutral" variant="outline" @click="showDeleteConfirm = false" />
          <UButton label="确认删除" color="error" @click="handleDelete" />
        </template>
      </UModal>
      </div>
    </template>
  </UDashboardPanel>
</template>
