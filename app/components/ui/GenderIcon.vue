<template>
  <UIcon :name="genderComputed.icon" class="size-4" :style="{ color: genderComputed.color }" />
</template>

<script setup lang="ts">
interface GenderProps {
  gender?: number
}

const { gender = 0 } = defineProps<GenderProps>()

const appConfigStore = useAppConfigStore()
const { appConfig } = storeToRefs(appConfigStore)

const genderComputed = computed(() => {
  const genders = appConfig.value.genders
  const defaultGenderIcon = { icon: 'ph:gender-male-bold', color: '#23a9ce' }
  return genders.find((g) => g.value === gender) || defaultGenderIcon
})
</script>

<style scoped></style>
