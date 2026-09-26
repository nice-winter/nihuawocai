<script setup lang="ts">
import type { LevelInfo } from '~~/shared/types/level'

const levels = defineModel<LevelInfo[]>({ required: true })

const page = ref(1)
const pageSize = 20

// slice 保留对象引用（不能 map 成副本），row.original 才能直绑写回
const paginatedLevels = computed(() => {
  const start = (page.value - 1) * pageSize
  return levels.value.slice(start, start + pageSize)
})

const columns = [
  { accessorKey: 'level', header: '等级' },
  { accessorKey: 'minScore', header: '最低分数' },
  { accessorKey: 'title', header: '称号' },
  { id: 'actions', header: '操作' }
]

const addLevel = () => {
  const maxLevel = levels.value.reduce((m, l) => Math.max(m, l.level), 0)
  const maxScore = levels.value.reduce((m, l) => Math.max(m, l.minScore), -10)
  levels.value.push({ level: maxLevel + 1, minScore: maxScore + 10, title: '' })
  page.value = Math.ceil(levels.value.length / pageSize)
}

const removeLevel = (row: LevelInfo) => {
  const index = levels.value.indexOf(row)
  if (index < 0) return
  levels.value.splice(index, 1)
  const maxPage = Math.max(1, Math.ceil(levels.value.length / pageSize))
  if (page.value > maxPage) page.value = maxPage
}

const sortByMinScore = () => {
  levels.value.sort((a, b) => a.minScore - b.minScore)
}

// LevelHelper 会按 minScore 排序，真正致命的是重复值（并列时后一条覆盖前一条）
const warnings = computed(() => {
  const msgs: string[] = []
  const scores = levels.value.map(l => l.minScore)
  if (new Set(scores).size < scores.length) msgs.push('minScore 存在重复，等级判定会取后出现的那条')
  const levelIds = levels.value.map(l => l.level)
  if (new Set(levelIds).size < levelIds.length) msgs.push('level 值存在重复')
  return msgs
})
</script>

<template>
  <div class="space-y-3">
    <UAlert
      v-for="msg in warnings"
      :key="msg"
      icon="i-lucide-triangle-alert"
      color="warning"
      variant="subtle"
      :description="msg"
    />

    <div class="flex items-center justify-between">
      <span class="text-xs text-muted">共 {{ levels.length }} 级</span>
      <div class="flex items-center gap-2">
        <UButton icon="i-lucide-arrow-down-narrow-wide" size="xs" variant="outline" color="neutral" @click="sortByMinScore">
          按最低分数排序
        </UButton>
        <UButton icon="i-lucide-plus" size="xs" variant="outline" color="neutral" @click="addLevel">
          添加等级
        </UButton>
      </div>
    </div>

    <UTable :columns="columns" :data="paginatedLevels">
      <template #level-cell="{ row }">
        <UInput v-model="row.original.level" type="number" size="sm" class="w-20" :min="1" />
      </template>
      <template #minScore-cell="{ row }">
        <UInput v-model="row.original.minScore" type="number" size="sm" class="w-28" :min="0" />
      </template>
      <template #title-cell="{ row }">
        <UInput v-model="row.original.title" size="sm" placeholder="称号" class="w-full" />
      </template>
      <template #actions-cell="{ row }">
        <UButton icon="i-lucide-trash-2" variant="ghost" color="error" size="sm" @click="removeLevel(row.original)" />
      </template>
    </UTable>

    <div v-if="levels.length > pageSize" class="flex justify-center">
      <UPagination v-model:page="page" :total="levels.length" :items-per-page="pageSize" :sibling-count="2" />
    </div>
  </div>
</template>
