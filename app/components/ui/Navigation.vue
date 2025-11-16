<template>
  <ul class="h-6 flex gap-3 items-center">
    <UTooltip :delay-duration="0" text="消息" :disable-closing-trigger="true">
      <li class="size-6 nav-icon hi"></li>
    </UTooltip>

    <UTooltip :delay-duration="0" text="背包" :disable-closing-trigger="true">
      <li class="size-6 nav-icon package"></li>
    </UTooltip>

    <UTooltip :delay-duration="0" text="截屏" :disable-closing-trigger="false">
      <li class="size-6 nav-icon camera"></li>
    </UTooltip>

    <UTooltip
      :delay-duration="0"
      :text="`音效：${sound ? '开启' : '关闭'}`"
      :disable-closing-trigger="true"
    >
      <li
        class="size-6 nav-icon"
        :class="sound ? 'sound-enabled' : 'sound-disabled'"
        @click="sound = !sound"
      ></li>
    </UTooltip>

    <UTooltip :delay-duration="0" text="帮助" :disable-closing-trigger="true">
      <li class="size-6 nav-icon help"></li>
    </UTooltip>

    <UTooltip :delay-duration="0" text="GitHub" :disable-closing-trigger="true">
      <li class="size-6 nav-icon github"></li>
    </UTooltip>
  </ul>
</template>

<script setup lang="ts">
const sound = ref(true)
</script>

<style scoped>
.nav-icon {
  filter: drop-shadow(0px 0px 2px rgb(161, 87, 17));
  cursor: pointer;
  background-image: url('~/assets/icons/navicon-sprites.webp');
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-color: transparent;
  --sprites-index: 0;
  background-position: 0 calc(var(--sprites-index) * -24px);
}

.nav-icon.hi {
  --sprites-index: 0;
}
.nav-icon.hi:hover {
  --sprites-index: 1;
}

.nav-icon.package {
  --sprites-index: 2;
}
.nav-icon.package:hover {
  --sprites-index: 3;
}

.nav-icon.camera {
  --sprites-index: 4;
}
.nav-icon.camera:hover {
  --sprites-index: 5;
}

.nav-icon.sound-enabled {
  --sprites-index: 6;
}
.nav-icon.sound-enabled:hover {
  --sprites-index: 7;
}
.nav-icon.sound-disabled {
  --sprites-index: 8;
}
.nav-icon.sound-disabled:hover {
  --sprites-index: 9;
}

.nav-icon.help {
  --sprites-index: 10;
}
.nav-icon.help:hover {
  --sprites-index: 11;
}

.nav-icon.github {
  --sprites-index: 12;
}
.nav-icon.github:hover {
  --sprites-index: 13;
}
</style>
