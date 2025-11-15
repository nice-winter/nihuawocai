<template>
  <div class="h-6 flex gap-3 items-center">
    <div class="size-6 nav-icon hi"></div>

    <div class="size-6 nav-icon package"></div>

    <div class="size-6 nav-icon camera"></div>

    <div class="size-6 nav-icon sound-enabled"></div>

    <div class="size-6 nav-icon help"></div>

    <div class="size-6 nav-icon github"></div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.nav-icon {
  filter: drop-shadow(0px 0px 2px rgb(161, 87, 17));
  cursor: pointer;
}

.nav-icon.hi {
  background:
    url('~/assets/icons/button-hi.png') no-repeat center center,
    transparent;
  background-size: contain;
}
.nav-icon.hi:hover {
  background:
    url('~/assets/icons/button-hi-hover.png') no-repeat center center,
    transparent;
  background-size: contain;
}

.nav-icon.package {
  background:
    url('~/assets/icons/button-package.png') no-repeat center center,
    transparent;
  background-size: contain;
}
.nav-icon.package:hover {
  background:
    url('~/assets/icons/button-package-hover.png') no-repeat center center,
    transparent;
  background-size: contain;
}

.nav-icon.camera {
  background:
    url('~/assets/icons/button-camera.png') no-repeat center center,
    transparent;
  background-size: contain;
}
.nav-icon.camera:hover {
  background:
    url('~/assets/icons/button-camera-hover.png') no-repeat center center,
    transparent;
  background-size: contain;
}

.nav-icon.sound-enabled {
  background:
    url('~/assets/icons/button-sound-enabled.png') no-repeat center center,
    transparent;
  background-size: contain;
}
.nav-icon.sound-enabled:hover {
  background:
    url('~/assets/icons/button-sound-enabled-hover.png') no-repeat center center,
    transparent;
  background-size: contain;
}

.nav-icon.help {
  background:
    url('~/assets/icons/button-help.png') no-repeat center center,
    transparent;
  background-size: contain;
}
.nav-icon.help:hover {
  background:
    url('~/assets/icons/button-help-hover.png') no-repeat center center,
    transparent;
  background-size: contain;
}

.nav-icon.github {
  background:
    url('~/assets/icons/button-github.png') no-repeat center center,
    transparent;
  background-size: contain;
}
.nav-icon.github:hover {
  background:
    url('~/assets/icons/button-github-hover.png') no-repeat center center,
    transparent;
  background-size: contain;
}
</style>
