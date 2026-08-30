<script setup lang="ts">
definePageMeta({
  layout: false
})

const { user, loggedIn } = useUserSession()
const secret = ref('')
const loading = ref(false)
const error = ref('')

const handleInit = async () => {
  if (!secret.value.trim()) {
    error.value = '请输入 secret'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/admin/init', {
      method: 'POST',
      body: { secret: secret.value.trim() }
    })
    navigateTo('/admin')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err.data?.message || '初始化失败，请检查 secret 是否正确'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-default">
    <div class="w-full max-w-md mx-4">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="size-14 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center">
          <UIcon name="i-lucide-shield" class="size-7 text-inverted" />
        </div>
        <h1 class="text-2xl font-bold text-highlighted">后台管理初始化</h1>
        <p class="text-sm text-muted mt-2">
          首次使用需要设置超级管理员
        </p>
      </div>

      <!-- 未登录提示 -->
      <UCard v-if="!loggedIn">
        <div class="text-center py-4">
          <UIcon name="i-lucide-log-in" class="size-10 text-dimmed mx-auto mb-3" />
          <p class="text-muted mb-4">请先登录后再进行初始化</p>
          <UButton to="/" color="primary" label="前往登录" />
        </div>
      </UCard>

      <!-- 已登录 - 初始化表单 -->
      <UCard v-else>
        <div class="space-y-5">
          <!-- 用户信息 -->
          <div v-if="user" class="flex items-center gap-3 p-3 rounded-lg bg-elevated">
            <UAvatar :src="user.avatar_url" :alt="user.nickname" size="sm" />
            <div>
              <p class="font-medium text-highlighted">{{ user.nickname }}</p>
              <p class="text-xs text-muted">ID: {{ user.id }}</p>
            </div>
          </div>

          <!-- Secret 输入 -->
          <UFormField label="初始化 Secret" :error="error">
            <UInput
              v-model="secret"
              placeholder="请输入 secret"
              icon="i-lucide-key"
              :disabled="loading"
              size="lg"
              @keyup.enter="handleInit"
            />
          </UFormField>

          <!-- 提示信息 -->
          <UAlert icon="i-lucide-info" color="info" variant="soft">
            <template #description>
              <span class="text-sm">Secret 在服务器启动时输出到控制台，格式为 32 位十六进制字符串。</span>
            </template>
          </UAlert>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton to="/" variant="ghost" color="neutral" :disabled="loading">返回首页</UButton>
            <UButton color="primary" :loading="loading" @click="handleInit">确认初始化</UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
