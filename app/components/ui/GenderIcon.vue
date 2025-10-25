<template>
  <UIcon :name="genderComputed.icon" class="size-4" :class="[genderComputed.class]" />
</template>

<script setup lang="ts">
interface GenderProps {
  gender?: number
}

const { gender = 0 } = defineProps<GenderProps>()

const genderComputed = computed(() => {
  switch (gender) {
    case 0:
      return {
        icon: `ph:gender-male-bold`,
        class: 'text-[#5ebfff]'
      }
    case 1:
      return {
        icon: `ph:gender-female-bold`,
        class: 'text-[#ff7cb2]'
      }
    default:
      return {
        icon: `ph:gender-male-bold`,
        class: 'text-[#5ebfff]'
      }
  }
})
</script>

<style scoped></style>
