<template>
  <div class="game-main-frame">
    <div class="game-main-frame__header">
      <div class="game-main-frame__header slot-wrapper">
        <slot name="header" />
      </div>
    </div>

    <div class="game-main-frame__panel">
      <slot name="panel" />
    </div>

    <div class="game-main-frame__footer">
      <div class="game-main-frame__footer slot-wrapper">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped>
.game-main-frame {
  position: relative;
  display: flex;
  flex-direction: column;
}

.game-main-frame {
  & > &__header,
  & > &__footer {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    div.slot-wrapper {
      width: 900px;
      height: 100%;
    }
  }

  & > &__header {
    height: 3rem;
  }
  & > &__footer {
    height: 5rem;
  }
}
</style>
