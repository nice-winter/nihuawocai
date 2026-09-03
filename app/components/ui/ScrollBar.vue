<script setup lang="ts">
import { h, computed, useSlots, withModifiers } from 'vue'
import type { CSSProperties, Ref } from 'vue'

export interface ScrollBarProps {
  /** 内容容器的 CSS 类名 */
  contentClass?: string
  /** 内容容器的内联样式 */
  contentStyle?: CSSProperties
  /** 滚动条的尺寸（单位：px） */
  size?: number
  /** 滚动条的显示触发方式 */
  trigger?: 'hover' | 'none'
  /** 是否自动隐藏滚动条（仅 trigger: 'hover' 时生效） */
  autoHide?: boolean
  /** 滚动条自动隐藏的延迟时间（单位：ms） */
  delay?: number
  /** 是否启用横向滚动 */
  xScrollable?: boolean
  /** 是否启用纵向滚动 */
  yScrollable?: boolean
  /** 横向滚动条的位置 */
  xPlacement?: 'top' | 'bottom'
  /** 纵向滚动条的位置 */
  yPlacement?: 'left' | 'right'
}

const {
  contentClass = undefined,
  contentStyle = {},
  size = 5,
  trigger = 'hover',
  autoHide = true,
  delay = 500,
  xScrollable = false,
  yScrollable = true,
  xPlacement = 'bottom',
  yPlacement = 'right'
} = defineProps<ScrollBarProps>()

const slots = useSlots()
const emits = defineEmits(['scroll', 'scrollend'])
const scrollOnBottom = defineModel<boolean>('scrollOnBottom', { default: false })

// --- DOM refs ---
const containerRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()
const railVerticalRef = ref<HTMLElement>()
const railHorizontalRef = ref<HTMLElement>()

const autoShowTrack = computed(() => trigger === 'hover')
const mouseEnter = ref(false)

// --- Y 轴 ---
const yAxis = useScrollbarAxis({
  axis: 'y',
  containerRef,
  contentRef,
  railRef: railVerticalRef,
  autoShowTrack,
  autoHide,
  delay,
  size,
  mouseEnter,
  onScrollEnd: (e, direction) => emits('scrollend', e, direction)
})

// --- X 轴 ---
const xAxis = useScrollbarAxis({
  axis: 'x',
  containerRef,
  contentRef,
  railRef: railHorizontalRef,
  autoShowTrack,
  autoHide,
  delay,
  size,
  mouseEnter,
  onScrollEnd: (e, direction) => emits('scrollend', e, direction)
})

// --- useScroll 方向检测 ---
const {
  directions: { left: scrollingLeft, right: scrollingRight, top: scrollingTop, bottom: scrollingBottom }
} = useScroll(containerRef)

// --- 是否存在滚动 ---
const isScroll = computed(() => {
  if (!yAxis.scrollSize.value && !xAxis.scrollSize.value) return false
  return (yScrollable && yAxis.isScrollable.value) || (xScrollable && xAxis.isScrollable.value)
})

// --- 滚动到底部检测 ---
const isScrollOnBottom = computed(() => {
  const { scrollTop, scrollHeight, clientHeight } = getScrollData()
  return scrollHeight < clientHeight || scrollTop + clientHeight >= scrollHeight - 14
})

// 用户是否主动滚动过（用于区分"从未滚动"和"正在看历史消息"）
const userHasScrolled = ref(false)

watch(isScrollOnBottom, (val) => {
  scrollOnBottom.value = val
}, { immediate: true })

// --- 滚动事件 ---
const isProgrammaticScroll = ref(false)

function onScroll(e: Event): void {
  // 区分用户主动滚动和程序滚动
  if (!isProgrammaticScroll.value) {
    userHasScrolled.value = true
  }
  // 水平方向
  if (scrollingLeft || scrollingRight) {
    const direction = scrollingLeft ? 'left' : 'right'
    emits('scroll', e, direction)
    if (autoShowTrack.value) {
      xAxis.showTrack.value = true
      if (!xAxis.trackPressed.value && autoHide) {
        xAxis.debouncedScrollEnd(e, direction)
        xAxis.debouncedHide()
      }
    }
  }
  // 垂直方向
  if (scrollingTop || scrollingBottom) {
    const direction = scrollingTop ? 'top' : 'bottom'
    emits('scroll', e, direction)
    if (autoShowTrack.value) {
      yAxis.showTrack.value = true
      if (!yAxis.trackPressed.value && autoHide) {
        yAxis.debouncedScrollEnd(e, direction)
        yAxis.debouncedHide()
      }
    }
  }
  xAxis.updateScrollPos()
  yAxis.updateScrollPos()
}

function onMouseEnter(): void {
  mouseEnter.value = true
  if (xAxis.trackPressed.value || yAxis.trackPressed.value) {
    xAxis.mousePressedLeave.value = false
    yAxis.mousePressedLeave.value = false
  } else if (!autoHide) {
    xAxis.showTrack.value = true
    yAxis.showTrack.value = true
  }
}

function onMouseLeave(): void {
  mouseEnter.value = false
  if (xAxis.trackPressed.value || yAxis.trackPressed.value) {
    xAxis.mousePressedLeave.value = true
    yAxis.mousePressedLeave.value = true
  } else if (!autoHide) {
    if (xAxis.showTrack.value) xAxis.debouncedHide()
    if (yAxis.showTrack.value) yAxis.debouncedHide()
  }
}

// --- 对外暴露 ---
function scrollTo(options?: ScrollToOptions): void {
  isProgrammaticScroll.value = true
  containerRef.value?.scrollTo(options)
  nextTick(() => {
    isProgrammaticScroll.value = false
  })
}

function scrollBy(options?: ScrollToOptions): void {
  isProgrammaticScroll.value = true
  containerRef.value?.scrollBy(options)
  nextTick(() => {
    isProgrammaticScroll.value = false
  })
}

function scrollToBottom(): void {
  isProgrammaticScroll.value = true
  userHasScrolled.value = false
  containerRef.value?.scrollTo({ top: Number.MAX_SAFE_INTEGER })
  nextTick(() => {
    isProgrammaticScroll.value = false
  })
}

function getScrollData() {
  return {
    scrollTop: yAxis.scrollPos.value,
    scrollWidth: xAxis.scrollSize.value,
    scrollHeight: yAxis.scrollSize.value,
    clientWidth: xAxis.clientSize.value,
    clientHeight: yAxis.clientSize.value
  }
}

defineExpose({ scrollTo, scrollBy, scrollToBottom, getScrollData, userHasScrolled })

// --- 渲染 ---
const containerStyle: CSSProperties = {
  '--scrollbar-width': `${size}px`,
  '--scrollbar-height': `${size}px`,
  '--scrollbar-border-radius': `${size}px`,
  '--scrollbar-color': 'rgba(0, 0, 0, 0.25)',
  '--scrollbar-color-hover': 'rgba(0, 0, 0, 0.4)',
  '--scrollbar-rail-horizontal-top': '4px 2px auto 2px',
  '--scrollbar-rail-horizontal-bottom': 'auto 2px 4px 2px',
  '--scrollbar-rail-vertical-right': '2px 4px 2px auto',
  '--scrollbar-rail-vertical-left': '2px auto 2px 4px',
  '--scrollbar-rail-color': 'transparent'
}

function createTrack(
  axis: 'x' | 'y',
  refEl: Ref<HTMLElement | undefined>,
  style: CSSProperties,
  show: boolean,
  enterHandler: () => void,
  leaveHandler: () => void,
  downHandler: (e: MouseEvent) => void,
  placement: string,
  display: boolean
) {
  const isY = axis === 'y'
  return h(
    'div',
    {
      ref: refEl as unknown as (el: unknown) => void,
      class: ['scrollbar-rail', isY ? 'rail-vertical' : 'rail-horizontal', isY ? `rail-vertical-${placement}` : `rail-horizontal-${placement}`],
      style: { display: display ? 'block' : 'none' }
    },
    h('div', {
      class: ['scrollbar-track', trigger === 'none' || show ? 'track-visible' : null],
      style,
      onMouseenter: autoShowTrack.value && autoHide ? enterHandler : () => false,
      onMouseleave: autoShowTrack.value && autoHide ? leaveHandler : () => false,
      onMousedown: withModifiers((e: Event) => downHandler(e as MouseEvent), ['prevent', 'stop'])
    })
  )
}

const render = () => {
  const defaultSlot = slots.default ? slots.default() : []
  const container = defaultSlot[0]

  if (!container?.children) return

  const scrollContentWrapper = h(
    'div',
    {
      ref: containerRef,
      class: ['scrollbar-container', isScroll.value ? 'container-scroll' : null],
      onScroll
    },
    h(
      'div',
      {
        ref: contentRef,
        class: ['scrollbar-content', contentClass],
        style: xScrollable ? { width: 'fit-content', ...contentStyle } : contentStyle
      },
      container.children
    )
  )

  const yTrack = createTrack(
    'y', railVerticalRef, yAxis.trackStyle.value,
    yAxis.showTrack.value, yAxis.onEnterTrack, yAxis.onLeaveTrack, yAxis.handleMouseDown,
    yPlacement, yScrollable
  )

  const xTrack = createTrack(
    'x', railHorizontalRef, xAxis.trackStyle.value,
    xAxis.showTrack.value, xAxis.onEnterTrack, xAxis.onLeaveTrack, xAxis.handleMouseDown,
    xPlacement, xScrollable
  )

  return h(
    container,
    {
      ...container.props,
      class: [container.props?.class, 'with-scrollbar'].filter(Boolean).join(' '),
      style: { ...container.props?.style, ...containerStyle },
      onMouseenter: isScroll.value && trigger === 'hover' ? onMouseEnter : () => false,
      onMouseleave: isScroll.value && trigger === 'hover' ? onMouseLeave : () => false
    },
    [scrollContentWrapper, yTrack, xTrack]
  )
}
</script>

<template>
  <render />
</template>

<style lang="css">
.with-scrollbar {
  overflow: hidden;
  position: relative;
  z-index: auto;
  height: 100%;
  width: 100%;
}

.with-scrollbar .scrollbar-container {
  width: 100%;
  height: 100%;
  min-height: inherit;
  max-height: inherit;
  scrollbar-width: none;
}

.with-scrollbar .scrollbar-container::-webkit-scrollbar,
.with-scrollbar .scrollbar-container::-webkit-scrollbar-track-piece,
.with-scrollbar .scrollbar-container::-webkit-scrollbar-thumb {
  width: 0;
  height: 0;
  display: none;
}

.with-scrollbar .scrollbar-container .scrollbar-content {
  box-sizing: border-box;
  min-width: 100%;
}

.with-scrollbar .scrollbar-container .scrollbar-content::after,
.with-scrollbar .scrollbar-container .scrollbar-content::before {
  content: '';
  display: block;
}

.with-scrollbar .container-scroll {
  overflow: scroll;
}

.with-scrollbar .scrollbar-rail {
  position: absolute;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
  background: var(--scrollbar-rail-color);
}

.with-scrollbar .scrollbar-rail .scrollbar-track {
  z-index: 9;
  position: absolute;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  background-color: var(--scrollbar-color);
  transition:
    background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.with-scrollbar .scrollbar-rail .scrollbar-track:hover {
  background-color: var(--scrollbar-color-hover);
}

.with-scrollbar .scrollbar-rail .track-visible {
  opacity: 1;
  pointer-events: all;
}

.with-scrollbar .rail-vertical {
  width: var(--scrollbar-width);
}

.with-scrollbar .rail-vertical .scrollbar-track {
  width: var(--scrollbar-width);
  border-radius: var(--scrollbar-border-radius);
  bottom: 0;
}

.with-scrollbar .rail-vertical-left {
  inset: var(--scrollbar-rail-vertical-left);
}

.with-scrollbar .rail-vertical-right {
  inset: var(--scrollbar-rail-vertical-right);
}

.with-scrollbar .rail-horizontal {
  height: var(--scrollbar-height);
}

.with-scrollbar .rail-horizontal .scrollbar-track {
  height: var(--scrollbar-height);
  border-radius: var(--scrollbar-border-radius);
  right: 0;
}

.with-scrollbar .rail-horizontal-top {
  inset: var(--scrollbar-rail-horizontal-top);
}

.with-scrollbar .rail-horizontal-bottom {
  inset: var(--scrollbar-rail-horizontal-bottom);
}

.with-scrollbar .scrollbar-thumb {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.5);
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
