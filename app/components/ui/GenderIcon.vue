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
        class: 'text-[#23a9ce]'
      }
    case 1:
      return {
        icon: `ph:gender-female-bold`,
        class: 'text-[#dd243c]'
      }
    default:
      return {
        icon: `ph:gender-male-bold`,
        class: 'text-[#23a9ce]'
      }
  }
})
</script>

<style scoped></style>
