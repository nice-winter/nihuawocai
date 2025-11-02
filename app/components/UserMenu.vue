<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { collapsed = false } = defineProps<{
  collapsed?: boolean
}>()

const { user, clear } = useUserSession()

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: 'label',
      label: user.value?.nickname,
      avatar: {
        src: user.value?.avatar_url
      }
    }
  ],
  [
    {
      label: '个人资料',
      icon: 'i-lucide-user',
      to: '/user/profile'
    }
  ],
  [
    {
      label: '注销',
      icon: 'i-lucide-log-out',
      onSelect: (e) => {
        e.preventDefault()
        clear()
      }
    }
  ]
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        avatar: {
          src: user?.avatar_url
        },
        label: collapsed ? undefined : user?.nickname,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed'
      }"
    />

    <template #chip-leading="{ item }">
      <div class="inline-flex items-center justify-center shrink-0 size-5">
        <span
          class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2"
          :style="{
            '--chip-light': `var(--color-${(item as any).chip}-500)`,
            '--chip-dark': `var(--color-${(item as any).chip}-400)`
          }"
        />
      </div>
    </template>
  </UDropdownMenu>
</template>
