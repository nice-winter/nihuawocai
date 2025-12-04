<template>
  <ul class="h-6 flex gap-3 items-center">
    <UTooltip :delay-duration="0" text="消息" :disable-closing-trigger="true">
      <li class="relative size-6 sprites-icon nav-icon hi">
        <span
          v-if="hi > 0"
          class="absolute -right-1 -bottom-0.5 min-w-4 px-0.5 text-mini text-white text-center bg-bland-blue-500 rounded-xs"
          >{{ hiCountText }}</span
        >
      </li>
    </UTooltip>

    <UTooltip :delay-duration="0" text="背包" :disable-closing-trigger="true">
      <li class="size-6 sprites-icon nav-icon package"></li>
    </UTooltip>

    <UTooltip :delay-duration="0" text="截屏" :disable-closing-trigger="false">
      <li class="size-6 sprites-icon nav-icon camera" @click="screenshot"></li>
    </UTooltip>

    <UTooltip
      :delay-duration="0"
      :text="`音效：${settingStore.settings.sound ? '开启' : '关闭'}`"
      :disable-closing-trigger="true"
    >
      <li
        class="size-6 sprites-icon nav-icon"
        :class="settingStore.settings.sound ? 'sound-enabled' : 'sound-disabled'"
        @click="settingStore.switchSound"
      ></li>
    </UTooltip>

    <UTooltip :delay-duration="0" text="帮助" :disable-closing-trigger="true">
      <li class="size-6 sprites-icon nav-icon help" @click="openWiki"></li>
    </UTooltip>

    <UTooltip :delay-duration="0" text="GitHub" :disable-closing-trigger="true">
      <li class="size-6 sprites-icon nav-icon github" @click="openRepo"></li>
    </UTooltip>
  </ul>
</template>

<script setup lang="ts">
const settingStore = useSettingStore()

const hi = ref(0)
const sound = ref(true)

const hiCountText = computed(() => (hi.value > 99 ? '99+' : hi.value.toString()))

const screenshot = () => {
  setTimeout(() => eventBus.emit('ui:screenshot'), 114) // 延迟等 Tooltip 消失再触发
}

const openWiki = () => {
  window.open('https://github.com/nice-winter/nihuawocai/wiki', '_blank')
}

const openRepo = () => {
  window.open('https://github.com/nice-winter/nihuawocai', '_blank')
}
</script>

<style scoped>
.nav-icon {
  background-position: 0 calc(var(--sprites-index) * -24px);
  filter: drop-shadow(0px 0px 2px rgb(161, 87, 17));
  cursor: pointer;
}

.nav-icon.hi {
  --sprites-index: 2;
}
.nav-icon.hi:hover {
  --sprites-index: 3;
}

.nav-icon.package {
  --sprites-index: 4;
}
.nav-icon.package:hover {
  --sprites-index: 5;
}

.nav-icon.camera {
  --sprites-index: 6;
}
.nav-icon.camera:hover {
  --sprites-index: 7;
}

.nav-icon.sound-enabled {
  --sprites-index: 8;
}
.nav-icon.sound-enabled:hover {
  --sprites-index: 9;
}
.nav-icon.sound-disabled {
  --sprites-index: 10;
}
.nav-icon.sound-disabled:hover {
  --sprites-index: 11;
}

.nav-icon.help {
  --sprites-index: 12;
}
.nav-icon.help:hover {
  --sprites-index: 13;
}

.nav-icon.github {
  --sprites-index: 14;
}
.nav-icon.github:hover {
  --sprites-index: 15;
}
</style>
