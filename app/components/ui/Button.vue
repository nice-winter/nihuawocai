<template>
  <button class="n-button" :class="[classNameSize, classNameColor]">
    <span class="n-button__text">
      <slot />
    </span>

    <svg
      v-if="size === 'large'"
      class="n-button__svg"
      viewBox="0 0 131.000000 51.000000"
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <g
        transform="translate(0.000000,51.000000) scale(0.100000,-0.100000)"
        fill="#000000"
        stroke="none"
      >
        <path
          d="M90 496 c-6 -8 -17 -13 -25 -10 -14 6 -58 -44 -50 -56 3 -5 1 -11 -5
          -15 -14 -8 -13 -45 1 -45 7 0 8 -7 3 -17 -14 -30 -13 -234 1 -223 8 7 10 1 7
          -21 -5 -36 16 -82 35 -75 7 3 13 -1 13 -8 0 -21 23 -26 117 -26 83 0 86 1 131
          38 26 20 52 44 59 52 7 8 13 11 13 6 0 -4 -14 -25 -30 -46 -17 -21 -30 -40
          -30 -43 0 -3 134 -5 298 -5 l299 0 17 26 17 27 -5 -26 -6 -26 106 0 c57 0 107
          4 110 9 3 4 10 8 15 8 6 0 7 -5 4 -10 -4 -7 3 -8 22 -4 82 20 96 46 94 184 -1
          78 -1 79 5 144 5 47 3 57 -8 50 -11 -6 -11 -5 0 9 11 13 11 21 0 44 -18 37
          -77 77 -94 63 -8 -8 -14 -7 -17 2 -4 9 -9 7 -18 -7 -17 -27 -71 -77 -76 -71
          -3 3 4 17 14 33 11 15 23 33 26 39 10 17 -224 18 -235 1 -6 -9 -10 -9 -16 1
          -6 9 -38 12 -118 10 l-109 -2 -100 -96 c-55 -53 -111 -105 -125 -115 -23 -19
          73 88 147 163 49 49 45 60 -15 43 -20 -6 -30 -6 -27 0 4 5 -14 8 -42 6 -46 -3
          -52 -7 -142 -97 -86 -86 -91 -88 -16 -5 15 17 41 47 58 69 l31 39 -52 -6 c-28
          -3 -56 -8 -62 -12 -5 -3 -10 -1 -10 5 0 15 -122 10 -132 -5 -11 -15 -60 -14
          -54 2 7 17 -9 17 -24 -1z m752 -33 c-23 -32 -70 -76 -57 -53 17 29 68 90 73
          86 2 -3 -5 -17 -16 -33z m-512 3 c0 -2 -8 -10 -17 -17 -16 -13 -17 -12 -4 4
          13 16 21 21 21 13z m338 -298 c-73 -79 -142 -147 -153 -151 -11 -4 47 60 130
          143 82 82 151 150 153 150 2 0 -56 -64 -130 -142z m-505 97 c-15 -19 -29 -32
          -32 -29 -4 4 48 64 56 64 2 0 -9 -16 -24 -35z m-58 -65 c-10 -11 -20 -18 -23
          -15 -7 6 18 35 31 35 5 0 2 -9 -8 -20z m976 -88 c-12 -22 -41 -48 -41 -36 0 8
          40 54 47 54 2 0 -1 -8 -6 -18z m29 -49 c-35 -40 -60 -59 -60 -46 0 10 83 94
          88 88 3 -2 -10 -21 -28 -42z m-881 -20 c-17 -22 -31 -33 -43 -33 -5 0 1 11 14
          25 27 28 50 34 29 8z m482 -16 c-10 -9 -11 -8 -5 6 3 10 9 15 12 12 3 -3 0
          -11 -7 -18z"
        />
      </g>
    </svg>
    <svg
      v-if="size === 'small'"
      class="n-button__svg"
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      width="51.000000pt"
      height="26.000000pt"
      viewBox="0 0 51.000000 26.000000"
      preserveAspectRatio="xMidYMid meet"
    >
      <g
        transform="translate(0.000000,26.000000) scale(0.100000,-0.100000)"
        fill="#000000"
        stroke="none"
      >
        <path
          d="M47 202 c-31 -31 -42 -49 -32 -49 17 0 85 70 85 87 0 15 -2 14 -53
          -38z"
        />
        <path
          d="M19 242 c-16 -11 -19 -27 -19 -107 0 -72 4 -97 16 -109 8 -9 20 -17
          25 -17 5 -1 15 -2 22 -3 6 -1 20 5 30 13 16 13 17 13 12 -1 -7 -18 14 -19 36
          -2 8 6 21 14 29 19 12 6 13 5 3 -6 -7 -7 -13 -15 -13 -19 0 -3 47 -6 105 -8
          99 -3 106 -2 128 20 12 13 16 16 8 6 -19 -24 -14 -27 39 -19 57 8 69 30 69
          133 0 65 -3 82 -19 98 -23 23 -46 26 -54 8 -5 -10 -7 -10 -12 0 -3 7 -25 12
          -52 12 -42 0 -51 -5 -101 -52 -54 -52 -53 -43 1 17 l28 30 -36 3 c-31 3 -43
          -3 -78 -35 -22 -21 -31 -27 -20 -13 41 49 41 50 -47 47 -47 -1 -89 -7 -100
          -15z"
        />
      </g>
    </svg>
    <svg
      v-if="size === 'medium'"
      class="n-button__svg"
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      width="75.000000pt"
      height="26.000000pt"
      viewBox="0 0 75.000000 26.000000"
      preserveAspectRatio="xMidYMid meet"
    >
      <g
        transform="translate(0.000000,26.000000) scale(0.100000,-0.100000)"
        fill="#000000"
        stroke="none"
      >
        <path
          d="M55 252 c-50 -6 -55 -16 -55 -118 0 -83 2 -95 22 -114 27 -25 45 -25
          71 -3 19 17 20 17 14 1 -8 -23 25 -25 43 -3 7 8 17 15 22 15 6 0 5 -7 -2 -16
          -12 -13 -8 -15 31 -13 25 2 50 10 57 18 12 14 13 14 8 -2 -5 -16 0 -18 42 -16
          28 2 52 9 60 18 12 14 13 14 8 -2 -5 -16 2 -18 82 -16 48 1 93 6 100 11 8 7
          12 7 12 -1 0 -20 33 -12 64 17 l31 27 -24 -27 -24 -28 48 4 c26 3 54 11 62 18
          14 15 24 129 15 186 -7 49 -43 63 -80 31 -15 -13 -21 -17 -14 -9 6 8 12 17 12
          21 0 5 -75 8 -167 8 l-168 0 -55 -52 c-48 -46 -50 -47 -12 -7 23 25 42 48 42
          51 0 3 -17 6 -37 7 -31 1 -45 -5 -78 -36 -28 -26 -32 -28 -12 -6 15 16 27 33
          27 37 0 6 -88 5 -145 -1z m365 -22 c-6 -11 -16 -20 -22 -20 -6 0 -3 9 7 20 10
          11 20 20 22 20 2 0 -1 -9 -7 -20z m-96 -155 c-14 -19 -31 -35 -37 -35 -6 0 4
          16 23 35 19 19 36 35 37 35 2 0 -8 -16 -23 -35z m110 0 c-14 -19 -31 -35 -37
          -35 -6 0 4 16 23 35 19 19 36 35 37 35 2 0 -8 -16 -23 -35z"
        />
      </g>
    </svg>
  </button>
</template>

<script setup lang="ts">
interface NButtonProps {
  size?: 'small' | 'medium' | 'large'
  color?: 'normal' | 'red' | 'green' | 'blue'
}

const { size = 'medium', color = 'normal' } = defineProps<NButtonProps>()

const classNameSize = computed(() => `n-button-size__${size}`)
const classNameColor = computed(() => `n-button-color__${color}`)
</script>

<style lang="less" scoped>
.n-button {
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: center;
  user-select: none;
  &:disabled {
    cursor: not-allowed;
  }

  > span.n-button__text {
    z-index: 2;
    color: #fff;
    text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.5);
  }

  > svg.n-button__svg {
    position: absolute;
    z-index: 1;
    width: 100%;
    height: 100%;
  }

  &.n-button-size__small {
    width: 51px;
    height: 26px;

    > span.n-button__text {
      font-size: 0.8rem;
      line-height: 1.6rem;
    }
  }
  &.n-button-size__medium {
    width: 75px;
    height: 26px;

    > span.n-button__text {
      font-size: 0.8rem;
      line-height: 1.6rem;
    }
  }
  &.n-button-size__large {
    width: 131px;
    height: 51px;

    > span.n-button__text {
      font-size: 1.5rem;
      line-height: 3.1rem;
      font-weight: bolder;
    }
  }

  // 'normal'
  &.n-button-color__normal {
    > svg.n-button__svg path {
      fill: #7a6955;
    }
  }
  &.n-button-color__normal:hover {
    > svg.n-button__svg path {
      fill: #8d7860;
    }
  }
  &.n-button-color__normal:active {
    > svg.n-button__svg path {
      fill: #6d5e4c;
    }
  }
  &.n-button-color__normal:disabled {
    > svg.n-button__svg path {
      fill: #a3968b;
    }
  }

  //  'red'
  &.n-button-color__red {
    > svg.n-button__svg path {
      fill: #e20032;
    }
  }
  &.n-button-color__red:hover {
    > svg.n-button__svg path {
      fill: #ff0038;
    }
  }
  &.n-button-color__red:active {
    > svg.n-button__svg path {
      fill: #d2012f;
    }
  }
  &.n-button-color__red:disabled {
    > svg.n-button__svg path {
      fill: #ff849f;
    }
  }

  //  'green'
  &.n-button-color__green {
    > svg.n-button__svg path {
      fill: #5e6e25;
    }
  }
  &.n-button-color__green:hover {
    > svg.n-button__svg path {
      fill: #7e9233;
    }
  }
  &.n-button-color__green:active {
    > svg.n-button__svg path {
      fill: #5c6b24;
    }
  }
  &.n-button-color__green:disabled {
    > svg.n-button__svg path {
      fill: #99a766;
    }
  }

  //  'blue'
  &.n-button-color__blue {
    > svg.n-button__svg path {
      fill: #3e96ec;
    }
  }
  &.n-button-color__blue:hover {
    > svg.n-button__svg path {
      fill: #49a4ff;
    }
  }
  &.n-button-color__blue:active {
    > svg.n-button__svg path {
      fill: #3782ce;
    }
  }
  &.n-button-color__blue:disabled {
    > svg.n-button__svg path {
      fill: #6aacee;
    }
  }
}
</style>
