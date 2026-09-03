<template>
  <div>
    <p class="flex gap-4">
      <UButton @click="pullRoomList">拉取房间列表</UButton>
      <UButton @click="create">创房</UButton>
      <UButton @click="leave">退房</UButton>
      <UInput v-model="roomNumber" class="w-16" />
      <UButton @click="join">进房</UButton>
      <UButton @click="msgbox">msgbox</UButton>
    </p>
    <p>Status: {{ status }}</p>
    <div>
      <Text :text="text" style="--emoji-size: 20px" />
    </div>

    <div id="test" ref="testRef" class="relative w-3xl h-156 border border-black">
      <UiThrower ref="throwerRef" :container="testRef" />
    </div>

    <div class="flex gap-4">
      <UButton @click="() => flower()">送花</UButton>
      <UButton @click="() => flower(100)">送花100朵</UButton>
      <UButton @click="() => flower(1000)">送花1000朵</UButton>
      <UButton @click="() => flower(114514)">送花114514朵</UButton>
    </div>
    <div class="flex gap-4">
      <UButton @click="() => slipper()">扔拖鞋</UButton>
    </div>
    <div class="flex gap-4">
      <UButton @click="() => countdown()">倒计时</UButton>
    </div>
    <div class="flex gap-4">
      <UButton @click="() => playSound('pop')">泡泡音效</UButton>
      <UButton @click="() => playSound('clock')">时钟</UButton>
    </div>

    <!-- ScrollBar 测试 -->
    <h2 class="mt-8 mb-2 text-lg font-bold">ScrollBar 测试</h2>
    <div class="flex gap-4">
      <div>
        <p class="mb-1 text-sm text-gray-500">垂直滚动 (300×200)</p>
        <UiScrollBar :size="6" :style="{ '--scrollbar-color': '#888' }">
          <div class="w-72 border border-gray-300 p-3" style="height: 200px">
            <p v-for="i in 50" :key="i" class="py-1">垂直滚动行 {{ i }}</p>
          </div>
        </UiScrollBar>
      </div>
      <div>
        <p class="mb-1 text-sm text-gray-500">水平滚动 (300×200)</p>
        <UiScrollBar :x-scrollable="true" :y-scrollable="false" :size="6" :style="{ '--scrollbar-color': '#888' }">
          <div class="border border-gray-300 p-3" style="height: 200px; width: 300px">
            <div class="flex gap-8 whitespace-nowrap">
              <span v-for="i in 30" :key="i" class="inline-block px-4 py-2 bg-gray-100 rounded">宽内容 {{ i }}</span>
            </div>
          </div>
        </UiScrollBar>
      </div>
      <div>
        <p class="mb-1 text-sm text-gray-500">
          滚动到底部检测: {{ isTestScrollOnBottom ? '✅ 已到底' : '⬇️ 未到底' }}
        </p>
        <UiScrollBar
          ref="testScrollBarRef"
          v-model:scroll-on-bottom="isTestScrollOnBottom"
          :auto-hide="false"
          :size="6"
          :style="{ '--scrollbar-color': '#888' }"
        >
          <div class="w-72 border border-gray-300 p-3" style="height: 200px">
            <p v-for="i in 50" :key="i" class="py-1">底部检测行 {{ i }}</p>
          </div>
        </UiScrollBar>
        <div class="mt-1 flex gap-2">
          <UButton size="xs" @click="testScrollBarRef?.scrollTo({ top: 999999 })">滚到底</UButton>
          <UButton size="xs" @click="testScrollBarRef?.scrollTo({ top: 0 })">滚到顶</UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Text from '~/components/ui/TextRender.vue'
import CountdownModal from '~/components/modal/CountdownModal.vue'

const testRef = ref<HTMLElement | null>(null)
const throwerRef = useTemplateRef('throwerRef')

const { playSound } = useSound()

const flower = (count?: number) => {
  throwerRef.value?.throwFlower(count)
}

const slipper = () => {
  throwerRef.value?.throwSlipper()
}

const text = `wkmsadkw<a href="111">222</a>啊啊啊{:30:}啊啊啊啊啊啊啊啊啊啊{:💩:}{:19:}？`

const wsStore = useWsStore()
const { send, open } = wsStore
const { status } = storeToRefs(wsStore)
const countdownModal = useModal(CountdownModal, { parent: '#test' })

const roomNumber = ref('')

// ScrollBar 测试
const testScrollBarRef = useTemplateRef('testScrollBarRef')
const isTestScrollOnBottom = ref(false)

onMounted(() => {
  // open()
})

const pullRoomList = () => {
  send({
    type: 'room:list_pull'
  })
}

const create = () => {
  send({
    type: 'room:create'
  })
}

const leave = () => {
  send({
    type: 'room:leave'
  })
}

const join = () => {
  if (roomNumber.value) {
    send({
      type: 'room:join',
      roomNumber: Number(roomNumber.value)
    })
  }
}

const msgbox = () => {
  useMessageBox().show('aaaaa')
}

const countdown = async () => {
  await countdownModal.open({ initialValue: 5 })
}
</script>

<style scoped></style>
