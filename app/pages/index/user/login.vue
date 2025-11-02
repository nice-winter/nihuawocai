<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const { loggedIn, user, session, fetch, clear, openInPopup } = useUserSession()

const toast = useToast()

const fields: AuthFormField[] = [
  // {
  //   name: 'email',
  //   type: 'email',
  //   label: '邮箱',
  //   placeholder: '',
  //   required: true
  // },
  // {
  //   name: 'password',
  //   label: '密码',
  //   type: 'password',
  //   placeholder: '',
  //   required: true
  // },
  // {
  //   name: 'remember',
  //   label: '记住我',
  //   type: 'checkbox'
  // }
]

const providers = [
  {
    label: '使用 X 账号登录',
    icon: 'i-simple-icons-x',
    onClick: async () => {
      await navigateTo('/auth/x', {
        external: true
      })
    }
  },
  {
    label: '使用 GitHub 账号登录',
    icon: 'i-simple-icons-github',
    onClick: async () => {
      await navigateTo('/auth/github', {
        external: true
      })
    }
  },
  {
    label: '使用 Steam 账号登录',
    icon: 'i-simple-icons-steam',
    onClick: async () => {
      await navigateTo('/auth/steam', {
        external: true
      })
    }
  }
]

const schema = z.object({
  email: z.email('格式错误'),
  password: z.string('密码不能为空').min(8, 'Must be at least 8 characters')
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
    <UPageCard class="w-sm max-w-md bg-elevated/50">
      <UAuthForm
        :schema="schema"
        title="登录以继续"
        icon="material-symbols:lock-person-outline-rounded"
        :fields="fields"
        separator="或"
        :providers="providers"
        :submit="{
          label: '继续'
        }"
        @submit="onSubmit"
      >
        <template #description> 请选择一种方式登录 </template>
        <template #password-hint>
          <ULink to="#" class="text-primary font-medium" tabindex="-1">忘记密码？</ULink>
        </template>
        <template #footer>
          登录即表示同意我们的<ULink to="#" class="text-primary font-medium">用户服务协议</ULink>。
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
