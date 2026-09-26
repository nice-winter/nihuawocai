<script setup lang="ts">
interface Banner {
  imgUrl: string
  description: string
  linkUrl: string
}

const banners = defineModel<Banner[]>({ required: true })

const columns = [
  { accessorKey: 'imgUrl', header: '图片地址' },
  { accessorKey: 'description', header: '描述' },
  { accessorKey: 'linkUrl', header: '跳转链接' },
  { id: 'actions', header: '操作' }
]

const addBanner = () => {
  banners.value.push({ imgUrl: '', description: '', linkUrl: '' })
}
</script>

<template>
  <div class="space-y-3">
    <UAlert
      icon="i-lucide-info"
      color="info"
      variant="subtle"
      title="预留配置"
      description="房间横幅暂未在游戏内渲染，此配置仅作数据预留。"
    />

    <div class="flex justify-end">
      <UButton icon="i-lucide-plus" size="xs" variant="outline" color="neutral" @click="addBanner">
        添加横幅
      </UButton>
    </div>

    <UTable :columns="columns" :data="banners">
      <template #imgUrl-cell="{ row }">
        <div class="flex items-center gap-2">
          <img
            v-if="row.original.imgUrl"
            :src="row.original.imgUrl"
            alt=""
            class="size-8 rounded object-cover border border-default shrink-0"
          >
          <UInput v-model="row.original.imgUrl" size="sm" placeholder="https://..." class="w-full" />
        </div>
      </template>
      <template #description-cell="{ row }">
        <UInput v-model="row.original.description" size="sm" placeholder="横幅描述" class="w-full" />
      </template>
      <template #linkUrl-cell="{ row }">
        <UInput v-model="row.original.linkUrl" size="sm" placeholder="https://... 或 #" class="w-full" />
      </template>
      <template #actions-cell="{ row }">
        <UButton icon="i-lucide-trash-2" variant="ghost" color="error" size="sm" @click="banners.splice(row.index, 1)" />
      </template>
    </UTable>
  </div>
</template>
