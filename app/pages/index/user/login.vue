<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const toast = useToast()

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: '邮箱',
    placeholder: '请输入你的邮箱',
    required: true
  },
  {
    name: 'password',
    label: '密码',
    type: 'password',
    placeholder: '请输入你的密码',
    required: true
  },
  {
    name: 'remember',
    label: '记住我',
    type: 'checkbox'
  }
]

const providers = [
  {
    label: '使用 GitHub 账号登录',
    icon: 'i-simple-icons-github',
    onClick: async () => {
      await navigateTo('/api/auth/github', {
        external: true
      })
    }
  }
]

const schema = z.object({
  email: z.email('Invalid email'),
  password: z.string('Password is required').min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log('Submitted', payload)
}
</script>

<template>
  <div
    class="min-h-[calc(100vh-var(--ui-header-height)-4rem)] flex flex-col items-center justify-center gap-4 p-4"
  >
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="登录"
        description=""
        icon="i-lucide-user"
        :fields="fields"
        :providers="providers"
        @submit="onSubmit"
      />
    </UPageCard>
  </div>
</template>
