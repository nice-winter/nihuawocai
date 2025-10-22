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
          d="M210 243 c-8 -2 -22 -7 -30 -10 -27 -11 -40 -11 -34 -2 3 5 -1 9 -9
          9 -22 0 -122 -121 -110 -134 3 -3 0 -13 -8 -22 -11 -14 -11 -18 -1 -21 6 -3
          10 -9 6 -14 -3 -5 -2 -13 1 -19 3 -5 17 2 31 18 l25 27 -17 -28 c-20 -33 -11
          -46 18 -28 18 11 20 11 15 -3 -10 -26 3 -19 46 27 36 38 37 38 16 8 l-23 -34
          22 5 c14 4 22 2 22 -7 0 -21 41 -6 79 29 30 27 32 28 18 6 -10 -15 -13 -30 -8
          -39 6 -9 11 -10 15 -3 4 6 13 9 22 5 8 -3 24 3 36 13 12 11 18 13 14 7 -4 -7
          -5 -13 -2 -13 3 0 21 24 41 52 19 29 35 48 35 43 0 -6 -7 -20 -15 -32 -8 -11
          -19 -32 -24 -45 -8 -22 -7 -24 28 -25 51 -2 79 22 81 72 3 63 1 77 -11 70 -6
          -4 -5 3 3 14 11 18 11 23 0 30 -8 4 -13 10 -12 12 1 2 -1 11 -5 19 -10 27 -55
          18 -81 -15 -25 -31 -32 -28 -14 5 7 13 7 21 0 25 -5 3 -10 1 -10 -5 0 -6 -4
          -9 -9 -6 -5 4 -23 -6 -40 -20 -17 -14 -31 -21 -31 -15 0 5 5 13 10 16 6 3 10
          12 10 20 0 24 -46 10 -91 -28 -57 -49 -73 -47 -24 3 21 22 37 40 35 39 -3 0
          -12 -3 -20 -6z m110 -137 c0 -2 -8 -10 -17 -17 -16 -13 -17 -12 -4 4 13 16 21
          21 21 13z"
        />
        <path d="M23 225 c-9 -25 2 -27 22 -5 17 18 17 20 1 20 -9 0 -19 -7 -23 -15z" />
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
          d="M90 246 c-6 -6 -10 -6 -10 -2 0 5 -6 3 -14 -3 -8 -6 -20 -10 -27 -9
          -7 2 -13 -8 -14 -25 -1 -15 -7 -33 -13 -39 -28 -28 -9 -27 23 1 49 43 53 39
          11 -11 -20 -23 -32 -44 -27 -48 6 -3 6 -11 1 -20 -25 -39 -4 -29 52 25 l61 60
          -50 -65 c-67 -88 -70 -94 -44 -85 16 5 21 2 21 -11 0 -16 1 -16 20 1 19 17 20
          17 20 1 0 -11 4 -14 13 -9 6 4 24 8 40 9 19 0 43 16 79 50 l52 49 -45 -54
          c-36 -45 -40 -54 -22 -49 12 3 24 1 28 -6 3 -8 7 -8 10 0 3 6 17 9 31 6 19 -3
          37 6 77 39 l52 44 -28 -36 c-33 -44 -34 -53 -2 -47 14 3 25 1 25 -5 0 -6 10
          -1 23 10 18 17 24 19 34 8 6 -7 35 -13 64 -14 47 -1 58 3 89 32 22 20 27 23
          12 6 -18 -20 -20 -28 -10 -35 14 -10 34 -10 61 -1 9 4 23 9 31 11 17 6 27 68
          12 78 -8 6 -8 10 2 16 14 10 24 92 11 92 -5 0 -9 7 -9 16 0 8 -4 12 -10 9 -5
          -3 -10 -2 -10 2 0 14 -47 8 -66 -8 -16 -13 -17 -12 -12 8 6 21 4 22 -21 10
          -32 -15 -85 -11 -74 6 4 7 -12 -5 -35 -25 -52 -47 -62 -48 -29 -5 l26 34 -52
          -9 c-74 -14 -92 -14 -90 -3 2 12 -93 12 -119 0 -10 -4 -25 -4 -34 -1 -10 4
          -32 -7 -57 -26 l-42 -33 26 35 26 35 -29 0 c-16 0 -33 -4 -38 -9z"
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
