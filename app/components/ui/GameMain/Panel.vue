<template>
  <div class="game-main-panel">
    <div class="game-main-panel__panel foreground">
      <slot />
    </div>
    <div class="game-main-panel__panel background" />
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped>
.game-main-panel {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-main-panel__panel {
  width: 900px;
  height: 640px;
  border-radius: 14px;
  box-shadow: 0 0 4px 2px rgb(176 129 73);
  overflow: hidden;

  &.foreground {
    z-index: 2;
    border: 1px solid #eee;
    background-color: #f7ebdf;
    background-image:
      linear-gradient(#eae0d0 1px, transparent 1px),
      linear-gradient(90deg, #eae0d0 1px, transparent 1px);
    background-size: 16px 16px;
  }
  &.background {
    z-index: 1;
    position: absolute;
    transform: rotate(-1.6deg);
    background-color: #cdb69b;
  }
}
</style>
