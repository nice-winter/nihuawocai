<template>
  <div class="flex flex-col gap-4 px-0.5 bg-[#ffffff2b]">
    <div class="grid grid-cols-7 grid-rows-2 gap-0 items-center justify-center">
      <span
        v-for="color in sketchpadStore.options.colors"
        :key="color"
        class="size-8 cursor-pointer"
        :class="{ selected: color === selectedColor }"
        :style="`background-color: ${color}`"
        :data-hexcolor="color"
        @click="onSelectColor(color)"
      />
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-4">
        <span
          v-for="(w, index) in sketchpadStore.options.widths"
          :key="w * index"
          class="size-8 flex items-center justify-center cursor-pointer"
          :class="{
            selected: sketchpadStore.brushOptions.width === index,
            'bg-white': sketchpadStore.brushOptions.width === index
          }"
          :data-width="sketchpadStore.currentBrushObjetc?.widths[index]"
          @click="onSelectWidth(index)"
        >
          <span
            class="rounded-full bg-(--ui-text)"
            :style="{ width: `${w}px`, height: `${w}px` }"
          />
        </span>
      </div>

      <div class="flex items-center gap-4">
        <span
          v-for="brush in brushes"
          :key="brush.name"
          class="size-8 flex items-center justify-center cursor-pointer"
          :class="{
            selected: brush.name === sketchpadStore.currentBrush,
            'bg-white': brush.name === sketchpadStore.currentBrush
          }"
          :data-brush="brush"
          @click="onSelectBrush(brush.name)"
        >
          <UIcon :name="brush.icon" class="size-6" />
        </span>

        <span
          class="size-8 flex items-center justify-center cursor-pointer"
          @click="sketchpadStore.undo"
        >
          <UIcon name="material-symbols:undo-rounded" class="size-6" />
        </span>
        <span
          class="size-8 flex items-center justify-center cursor-pointer"
          @click="sketchpadStore.redo"
        >
          <UIcon name="material-symbols:redo-rounded" class="size-6" />
        </span>
        <span
          class="size-8 flex items-center justify-center cursor-pointer"
          @click="sketchpadStore.clear"
        >
          <UIcon name="material-symbols:delete-outline-rounded" class="size-6" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BrushesNameString } from '~/interfaces/brush'
import { useSketchpadStore } from '~/stores/sketchpad/sketchpadStore'

const sketchpadStore = useSketchpadStore()

const brushes = computed(() => sketchpadStore.brushes)

const selectedColor = defineModel<string>('color')
selectedColor.value = sketchpadStore.options.colors[0]
const selectedWidth = defineModel<number>('width')
selectedWidth.value = sketchpadStore.options.widths[1]
const selectedBrush = defineModel<string>('brush')
selectedBrush.value = sketchpadStore.currentBrush

const onSelectColor = (color: string) => {
  selectedColor.value = color
  sketchpadStore.updateBrushOptions({ color })
  // console.log(`[Toolbar]`, `select color:`, color)
}
const onSelectWidth = (width: number) => {
  selectedWidth.value = width
  sketchpadStore.updateBrushOptions({ width })
  // console.log(`[Toolbar]`, `select width:`, width)
}
const onSelectBrush = (brush: BrushesNameString) => {
  selectedBrush.value = brush
  sketchpadStore.setCurrentBrush(brush)
}
</script>

<style scoped>
.selected {
  position: relative;
  z-index: 1;
  box-shadow:
    0 0 0 1px #000,
    0 0 0 2px #fff,
    0 0 0 3px #000;
}
</style>
