<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    :title="`${userData?.nickname} 的个人资料`"
    description="您可以查看和修改您的个人资料"
  >
    <template #body>
      <div class="flex flex-col">
        <div class="h-40 flex gap-4">
          <div class="flex flex-col gap-4 items-center">
            <UAvatar :src="userData.avatar_url" class="size-16" />
            <UButton
              label="上传"
              icon="lucide:upload"
              color="neutral"
              variant="soft"
              size="sm"
              :disabled="true"
            />
          </div>

          <USeparator orientation="vertical" class="h-full" />

          <div class="w-full flex flex-col gap-4">
            <UFormField label="昵称">
              <UInput
                :default-value="userData.nickname"
                placeholder="输入你的昵称"
                :disabled="true"
                class="w-full"
              />
            </UFormField>
            <UFormField label="">
              <template #label>
                <span>性别</span>
                <UTooltip
                  text="我们充分尊重多元化性别，无论您是变形金刚还是..."
                  :content="{
                    align: 'start',
                    side: 'top'
                  }"
                >
                  <UIcon name="material-symbols:help-rounded" class="text-gray-400 ml-0.5" />
                </UTooltip>
              </template>
              <USelect
                v-model="userData.gender"
                :icon="currentGender?.icon"
                :items="appConfig.genders"
                class="w-48"
              />
            </UFormField>
          </div>
        </div>
        <div class="flex">
          <div class="flex items-center">
            <span class="text-sm text-gray-400"
              >您当前的资料同步自<UIcon
                :name="`i-simple-icons-${userData.user_type}`"
                class="size-4 align-top mx-0.5"
              />，部分可能无法更改。</span
            >
          </div>
          <div class="flex gap-4 ml-auto">
            <UButton color="primary" label="保存" @click="save" />
            <UButton color="neutral" variant="outline" label="关闭" @click="emit('close', false)" />
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { UserData } from '#shared/interfaces/userData'

const { user } = useUserSession()
const userData = reactive((await $fetch(`/user/${user.value?.id}`)) as UserData)
const appConfigStore = useAppConfigStore()
const { appConfig } = storeToRefs(appConfigStore)

const currentGender = computed(() =>
  appConfig.value.genders.find((g) => g.value === userData.gender)
)

const save = async () => {
  await $fetch(`/user/${user.value?.id}`, {
    method: 'POST',
    body: userData
  })
  emit('close', true)
}

const emit = defineEmits<{ close: [boolean] }>()
</script>

<style scoped></style>
