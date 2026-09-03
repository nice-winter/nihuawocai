<template>
  <div class="p-6 space-y-6 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold text-highlighted">测试面板</h1>

    <!-- 房间操作 -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-users" class="size-5 text-primary" />
          <span class="font-semibold">房间操作</span>
          <UBadge :label="status" variant="subtle" class="ml-auto" />
        </div>
      </template>

      <div class="flex flex-wrap items-center gap-3">
        <UButton label="拉取房间列表" variant="outline" @click="pullRoomList" />
        <UButton label="创房" @click="create" />
        <UButton label="退房" color="error" variant="outline" @click="leave" />
        <UInput v-model="roomNumber" placeholder="房间号" class="w-24" />
        <UButton label="进房" :disabled="!roomNumber" @click="join" />
      </div>
    </UCard>

    <!-- 画板 & 特效测试 -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-sparkles" class="size-5 text-warning" />
          <span class="font-semibold">画板 & 特效</span>
        </div>
      </template>

      <div class="flex gap-4">
        <!-- 画板区域 -->
        <div id="sketchpad-container" ref="sketchpadContainerRef" class="relative h-128 flex-1 overflow-hidden rounded-lg border border-muted">
          <!-- <UiGameMainRoomPlayingSketchpad /> -->
          <UiThrower ref="throwerRef" :container="sketchpadContainerRef" />
        </div>

        <!-- 简易工具栏 -->
        <div class="flex flex-col gap-3">
          <!-- 颜色盘 -->
          <div class="grid grid-cols-2 gap-1">
            <span
              v-for="color in testColors"
              :key="color"
              class="size-7 cursor-pointer rounded-sm border border-muted"
              :class="{ 'ring-2 ring-primary ring-offset-1': selectedColor === color }"
              :style="{ backgroundColor: color }"
              @click="onSelectColor(color)"
            />
          </div>

          <USeparator />

          <!-- 笔刷 -->
          <div class="flex flex-col items-center gap-1">
            <UTooltip text="画笔">
              <UButton
                :icon="'i-material-symbols:brush'"
                :variant="sketchpadStore.currentBrush === 'pencil' ? 'solid' : 'ghost'"
                color="neutral"
                size="sm"
                @click="sketchpadStore.setCurrentBrush('pencil')"
              />
            </UTooltip>
            <UTooltip text="橡皮擦">
              <UButton
                :icon="'i-material-symbols:ink-eraser'"
                :variant="sketchpadStore.currentBrush === 'eraser' ? 'solid' : 'ghost'"
                color="neutral"
                size="sm"
                @click="sketchpadStore.setCurrentBrush('eraser')"
              />
            </UTooltip>
          </div>

          <USeparator />

          <!-- 操作 -->
          <div class="flex flex-col items-center gap-1">
            <UTooltip text="撤销">
              <UButton icon="i-material-symbols:undo-rounded" variant="ghost" color="neutral" size="sm" @click="sketchpadStore.undo" />
            </UTooltip>
            <UTooltip text="重做">
              <UButton icon="i-material-symbols:redo-rounded" variant="ghost" color="neutral" size="sm" @click="sketchpadStore.redo" />
            </UTooltip>
            <UTooltip text="清空">
              <UButton icon="i-material-symbols:delete-outline-rounded" variant="ghost" color="error" size="sm" @click="sketchpadStore.clear" />
            </UTooltip>
          </div>
        </div>
      </div>

      <!-- 特效按钮 -->
      <div class="mt-4 flex flex-wrap gap-2">
        <UButton label="送花 🌹" color="primary" variant="soft" @click="flower()" />
        <UButton label="送花×100" color="primary" variant="soft" @click="flower(100)" />
        <UButton label="送花×1000" color="primary" variant="soft" @click="flower(1000)" />
        <UButton label="送花×114514" color="primary" variant="soft" @click="flower(114514)" />
        <UButton label="扔拖鞋 🩴" color="warning" variant="soft" @click="slipper()" />
        <UButton label="倒计时" color="info" variant="soft" @click="countdown" />
        <UButton label="泡泡音效" color="neutral" variant="ghost" @click="playSound('pop')" />
        <UButton label="时钟音效" color="neutral" variant="ghost" @click="playSound('clock')" />
        <UButton label="MessageBox" color="neutral" variant="ghost" @click="msgbox" />
      </div>
    </UCard>

    <!-- 文本渲染 -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-type" class="size-5 text-info" />
          <span class="font-semibold">文本渲染</span>
        </div>
      </template>

      <Text :text="text" style="--emoji-size: 20px" />
    </UCard>

    <!-- ScrollBar 测试 -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-scroll" class="size-5 text-secondary" />
          <span class="font-semibold">ScrollBar 测试</span>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 垂直滚动 -->
        <div>
          <p class="text-sm text-muted mb-2">垂直滚动</p>
          <UiScrollBar :size="6" :style="{ '--scrollbar-color': '#888' }">
            <div class="w-full border border-muted p-3 rounded" style="height: 200px">
              <p v-for="i in 50" :key="i" class="py-1 text-default">垂直滚动行 {{ i }}</p>
            </div>
          </UiScrollBar>
        </div>

        <!-- 水平滚动 -->
        <div>
          <p class="text-sm text-muted mb-2">水平滚动</p>
          <UiScrollBar :x-scrollable="true" :y-scrollable="false" :size="6" :style="{ '--scrollbar-color': '#888' }">
            <div class="border border-muted p-3 rounded" style="height: 200px; width: 300px">
              <div class="flex gap-8 whitespace-nowrap">
                <span v-for="i in 30" :key="i" class="inline-block px-4 py-2 bg-muted rounded">宽内容 {{ i }}</span>
              </div>
            </div>
          </UiScrollBar>
        </div>

        <!-- 底部检测 -->
        <div>
          <p class="text-sm text-muted mb-2">
            底部检测:
            <UBadge :label="isTestScrollOnBottom ? '已到底' : '未到底'" :color="isTestScrollOnBottom ? 'success' : 'neutral'" size="sm" />
          </p>
          <UiScrollBar
            ref="testScrollBarRef"
            v-model:scroll-on-bottom="isTestScrollOnBottom"
            :auto-hide="false"
            :size="6"
            :style="{ '--scrollbar-color': '#888' }"
          >
            <div class="w-full border border-muted p-3 rounded" style="height: 200px">
              <p v-for="i in 50" :key="i" class="py-1 text-default">底部检测行 {{ i }}</p>
            </div>
          </UiScrollBar>
          <div class="mt-2 flex gap-2">
            <UButton label="滚到底" size="xs" variant="outline" @click="testScrollBarRef?.scrollTo({ top: 999999 })" />
            <UButton label="滚到顶" size="xs" variant="outline" @click="testScrollBarRef?.scrollTo({ top: 0 })" />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import Text from '~/components/ui/TextRender.vue'
import CountdownModal from '~/components/modal/CountdownModal.vue'

const sketchpadContainerRef = useTemplateRef('sketchpadContainerRef')
const throwerRef = useTemplateRef('throwerRef')

const { playSound } = useSound()
const sketchpadStore = useSketchpadStore()

const flower = (count?: number) => {
  throwerRef.value?.throwFlower(count)
}

const slipper = () => {
  throwerRef.value?.throwSlipper()
}

const text = `wkmsadkw<a href="111">222</a>啊啊啊{:30:}啊啊啊啊啊啊啊啊啊啊{:💩:}{:19:}？`

const wsStore = useWsStore()
const { send } = wsStore
const { status } = storeToRefs(wsStore)
const countdownModal = useModal(CountdownModal, { parent: '#sketchpad-container' })

const roomNumber = ref('')

// 画板工具栏
const testColors = ['#000000', '#ff0000', '#00aa00', '#0000ff', '#ff9900', '#9900ff', '#00cccc', '#ff6699']
const selectedColor = ref(testColors[0])

const onSelectColor = (color: string) => {
  selectedColor.value = color
  sketchpadStore.updateBrushOptions({ color })
}

// ScrollBar
const testScrollBarRef = useTemplateRef('testScrollBarRef')
const isTestScrollOnBottom = ref(false)

const pullRoomList = () => {
  send({ type: 'room:list_pull' })
}

const create = () => {
  send({ type: 'room:create' })
}

const leave = () => {
  send({ type: 'room:leave' })
}

const join = () => {
  if (roomNumber.value) {
    send({ type: 'room:join', roomNumber: Number(roomNumber.value) })
  }
}

const msgbox = () => {
  useMessageBox().show('aaaaa')
}

const countdown = async () => {
  await countdownModal.open({ initialValue: 5 })
}
</script>
