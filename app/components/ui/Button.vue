<template>
  <button
    class="inline-flex items-center justify-center align-middle text-white disabled:text-[#ddd] cursor-pointer disabled:cursor-not-allowed select-none game-button"
    :class="[classNameSize, classNameColor]"
  >
    <span class="z-1 game-button__text" :class="{ hidden: type.startsWith('arrow') }">
      <slot />
    </span>

    <UIcon
      v-if="type === 'normal' && size === 'xl'"
      name="custom:button-xl"
      class="w-[307px] h-[26px] absolute game-button__icon"
    />

    <UIcon
      v-if="type === 'normal' && size === 'lg'"
      name="custom:button-lg"
      class="w-[131px] h-[51px] absolute game-button__icon"
    />

    <UIcon
      v-if="type === 'normal' && size === 'base'"
      name="custom:button-base"
      class="w-[75px] h-[26px] absolute game-button__icon"
    />

    <UIcon
      v-if="type === 'normal' && size === 'sm'"
      name="custom:button-sm"
      class="w-[51px] h-[26px] absolute game-button__icon"
    />

    <UIcon
      v-if="type === 'arrow-left'"
      name="custom:arrow-left"
      class="w-4 h-[26px] absolute game-button__icon"
    />

    <UIcon
      v-if="type === 'arrow-right'"
      name="custom:arrow-right"
      class="w-4 h-[26px] absolute game-button__icon"
    />
  </button>
</template>

<script setup lang="ts">
interface ButtonProps {
  type?: 'normal' | 'arrow-left' | 'arrow-right'
  size?: 'sm' | 'base' | 'lg' | 'xl'
  color?: 'normal' | 'red' | 'green' | 'blue' | 'playing'
}

const { type = 'normal', size = 'base', color = 'normal' } = defineProps<ButtonProps>()

const classNameSize = computed(() => {
  if (type === 'normal') {
    return `game-button-size__${size}`
  } else if (type.concat('arrow')) {
    return `game-button-size__arrow`
  } else {
    return 'game-button-size__medium'
  }
})
const classNameColor = computed(() => `game-button-color__${color}`)
</script>

<style lang="css" scoped>
.game-button {
  text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.5);

  &.game-button-size__arrow {
    width: 16px;
    height: 26px;
  }

  &.game-button-size__sm {
    width: 51px;
    height: 26px;

    > .game-button__text {
      font-size: 0.8rem;
    }
  }
  &.game-button-size__base {
    width: 75px;
    height: 26px;

    > .game-button__text {
      font-size: 0.8rem;
    }
  }
  &.game-button-size__lg {
    width: 131px;
    height: 51px;

    > .game-button__text {
      font-size: 1.5rem;
      font-weight: bolder;
    }
  }
  &.game-button-size__xl {
    width: 307px;
    height: 26px;

    > .game-button__text {
      font-size: 0.8rem;
    }
  }

  /* 'normal' */
  &.game-button-color__normal {
    > .game-button__icon {
      color: #7a6955;
    }
  }
  &.game-button-color__normal:hover {
    > .game-button__icon {
      color: #8d7860;
    }
  }
  &.game-button-color__normal:active {
    > .game-button__icon {
      color: #6d5e4c;
    }
  }
  &.game-button-color__normal:disabled {
    > .game-button__icon {
      color: #b3aca5;
    }
  }

  /* 'red' */
  &.game-button-color__red {
    > .game-button__icon {
      color: #e20032;
    }
  }
  &.game-button-color__red:hover {
    > .game-button__icon {
      color: #ff0030;
    }
  }
  &.game-button-color__red:active {
    > .game-button__icon {
      color: #d2012f;
    }
  }
  &.game-button-color__red:disabled {
    > .game-button__icon {
      color: #ff849f;
    }
  }

  /* 'green' */
  &.game-button-color__green {
    > .game-button__icon {
      color: #5f6f27;
    }
  }
  &.game-button-color__green:hover {
    > .game-button__icon {
      color: #6b7d2b;
    }
  }
  &.game-button-color__green:active {
    > .game-button__icon {
      color: #4f5d1c;
    }
  }
  &.game-button-color__green:disabled {
    > .game-button__icon {
      color: #99a766;
    }
  }

  /* 'blue' */
  &.game-button-color__blue {
    > .game-button__icon {
      color: #3e96ec;
    }
  }
  &.game-button-color__blue:hover {
    > .game-button__icon {
      color: #49a4ff;
    }
  }
  &.game-button-color__blue:active {
    > .game-button__icon {
      color: #3782ce;
    }
  }
  &.game-button-color__blue:disabled {
    > .game-button__icon {
      color: #6aacee;
    }
  }

  /* 'playing' */
  &.game-button-color__playing {
    color: #766746;
    text-shadow: none;

    > .game-button__icon {
      color: #c9bc9c;
    }
  }
  &.game-button-color__playing:hover {
    > .game-button__icon {
      color: #d6c9a7;
    }
  }
  &.game-button-color__playing:active {
    > .game-button__icon {
      color: #c2b598;
    }
  }
  &.game-button-color__playing:disabled {
    > .game-button__icon {
      color: #cfcbbf;
    }
  }
}
</style>
