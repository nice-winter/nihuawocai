<template>
  <button
    type="button"
    class="group relative inline-flex items-center justify-center align-middle select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-80"
    :class="[sizeConfig.dimensions, colorConfig.text]"
    :disabled="disabled"
  >
    <span
      v-if="!type.startsWith('arrow')"
      class="z-10 relative"
      :class="[sizeConfig.fontSize, color !== 'playing' ? 'btn-text-shadow' : '']"
    >
      <slot />
    </span>

    <UIcon
      v-if="iconName"
      :name="iconName"
      class="absolute inset-0 w-full h-full"
      :class="colorConfig.icon"
    />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ButtonProps {
  type?: 'normal' | 'arrow-left' | 'arrow-right'
  size?: 'sm' | 'base' | 'lg' | 'xl'
  color?: 'normal' | 'red' | 'green' | 'blue' | 'playing'
  disabled?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'normal',
  size: 'base',
  color: 'normal',
  disabled: false
})

const sizeConfigs = {
  arrow: { dimensions: 'w-[16px] h-[26px]', fontSize: '' },
  sm: { dimensions: 'w-[51px] h-[26px]', fontSize: 'text-sm2' },
  base: { dimensions: 'w-[75px] h-[26px]', fontSize: 'text-sm2' },
  lg: { dimensions: 'w-[131px] h-[51px]', fontSize: 'text-[1.5rem] font-black' },
  xl: { dimensions: 'w-[307px] h-[26px]', fontSize: 'text-sm2' }
}

const colorConfigs = {
  normal: {
    text: 'text-white disabled:text-[#ddd]',
    icon: 'text-game-taupe-500 group-hover:text-game-taupe-400 group-active:text-game-taupe-600 group-disabled:text-[#b3aca5]'
  },

  red: {
    text: 'text-white disabled:text-[#ddd]',
    icon: 'text-game-red-500 group-hover:text-game-red-400 group-active:text-game-red-600 group-disabled:text-game-red-300'
  },

  green: {
    text: 'text-white disabled:text-[#ddd]',
    icon: 'text-game-green-500 group-hover:text-game-green-400 group-active:text-game-green-600 group-disabled:text-game-green-300'
  },

  blue: {
    text: 'text-white disabled:text-[#ddd]',
    icon: 'text-game-blue-500 group-hover:text-game-blue-400 group-active:text-game-blue-600 group-disabled:text-game-blue-300'
  },

  playing: {
    text: 'text-wood-800 disabled:text-[#ddd]',
    icon: 'text-game-sand-500 group-hover:text-game-sand-400 group-active:text-game-sand-600 group-disabled:text-game-sand-300'
  }
}

const sizeConfig = computed(() => {
  if (props.type.startsWith('arrow')) {
    return sizeConfigs.arrow
  }
  return sizeConfigs[props.size] || sizeConfigs.base
})

const colorConfig = computed(() => {
  return colorConfigs[props.color] || colorConfigs.normal
})

const iconName = computed(() => {
  if (props.type === 'arrow-left') return 'custom:arrow-left'
  if (props.type === 'arrow-right') return 'custom:arrow-right'
  return `custom:button-${props.size}`
})
</script>

<style scoped>
.btn-text-shadow {
  text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.5);
}
</style>
