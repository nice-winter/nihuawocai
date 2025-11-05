<script setup lang="ts">
import { h, ref, computed, onMounted, useSlots, withModifiers } from 'vue'
import type { CSSProperties } from 'vue'
import { debounce, useResizeObserver, useScroll } from '~/composables/utils'

export interface ScrollBarProps {
  /**
   * 内容容器的 CSS 类名
   *
   * @default undefined
   */
  contentClass?: string

  /**
   * 内容容器的内联样式
   *
   * @default {}
   */
  contentStyle?: CSSProperties

  /**
   * 滚动条的尺寸（单位：px）
   *
   * @default 5
   */
  size?: number

  /**
   * 滚动条的显示触发方式
   *
   * - `'hover'`: 鼠标悬停时显示
   * - `'none'`: 始终显示
   *
   * @default 'hover'
   */
  trigger?: 'hover' | 'none'

  /**
   * 是否自动隐藏滚动条
   *
   * @remarks
   * 仅当 `trigger: 'hover'` 时生效。
   *
   * - `true`: 鼠标在滚动区域内且不滚动时自动隐藏，滚动时自动显示；
   * - `false`: 鼠标在滚动区域内时始终显示，无论是否在滚动。
   *
   * @default true
   */
  autoHide?: boolean

  /**
   * 滚动条自动隐藏的延迟时间（单位：ms）
   *
   * @remarks
   * 仅当 `autoHide: true` 时生效。
   *
   * @default 500
   */
  delay?: number

  /**
   * 是否启用横向滚动
   *
   * @default false
   */
  xScrollable?: boolean

  /**
   * 是否启用纵向滚动
   *
   * @default true
   */
  yScrollable?: boolean

  /**
   * 横向滚动条的位置
   *
   * - `'top'`: 顶部
   * - `'bottom'`: 底部
   *
   * @default 'bottom'
   */
  xPlacement?: 'top' | 'bottom'

  /**
   * 纵向滚动条的位置
   *
   * - `'left'`: 左侧
   * - `'right'`: 右侧
   *
   * @default 'right'
   */
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

const containerRef = ref<HTMLElement>() // 滚动容器 DOM 引用
const contentRef = ref<HTMLElement>() // 滚动内容 DOM 引用
const railVerticalRef = ref<HTMLElement>() // 垂直滚动条 DOM 引用
const railHorizontalRef = ref<HTMLElement>() // 水平滚动条 DOM 引用

const showYTrack = ref(false) // 是否显示垂直滚动条
const showXTrack = ref(false) // 是否显示横向滚动条
const containerScrollHeight = ref(0) // 滚动区域高度，包括溢出高度
const containerScrollWidth = ref(0) // 滚动区域宽度，包括溢出宽度
const containerClientHeight = ref(0) // 滚动区域高度，不包括溢出高度
const containerClientWidth = ref(0) // 滚动区域宽度，不包括溢出宽度
const containerHeight = ref(0) // 容器高度
const containerWidth = ref(0) // 容器宽度
const contentHeight = ref(0) // 内容高度
const contentWidth = ref(0) // 内容宽度
const railHeight = ref(0) // 滚动条高度
const railWidth = ref(0) // 滚动条宽度
const containerScrollTop = ref(0) // 垂直滚动距离
const containerScrollLeft = ref(0) // 水平滚动距离
const mouseEnter = ref(false) // 鼠标是否在滚动区域内
const trackYPressed = ref(false) // 垂直滚动条是否被按下
const trackXPressed = ref(false) // 水平滚动条是否被按下
const mousePressedLeave = ref(false) // 鼠标在按下滚动条并拖动时是否离开滚动区域
const memoYTop = ref<number>(0) // 鼠标选中并按下垂直滚动条时已滚动的垂直距离
const memoXLeft = ref<number>(0) // 鼠标选中并按下水平滚动条时已滚动的水平距离
const memoMouseY = ref<number>(0) // 鼠标选中并按下垂直滚动条时的鼠标 Y 坐标
const memoMouseX = ref<number>(0) // 鼠标选中并按下水平滚动条时的鼠标 X 坐标
const horizontalContentStyle = { width: 'fit-content' } // 水平滚动时内容区域默认样式
const yTrackHover = ref(false) // 鼠标是否在垂直滚动条上
const xTrackHover = ref(false) // 鼠标是否在水平滚动条上
const emits = defineEmits(['scroll', 'scrollend'])
const scrollOnButtom = defineModel<boolean>('scrollOnButtom', { default: false })
const isScrollOnBottom = computed(() => {
  const { scrollTop, scrollHeight, clientHeight } = getScrollData()
  // 小于容器高度时，直接返回 true
  // 留点余量（14px），就当它到底了吧...
  const is = scrollHeight < clientHeight || scrollTop + clientHeight >= scrollHeight - 14
  return is
})
watch(
  () => isScrollOnBottom.value,
  (newValue) => {
    scrollOnButtom.value = newValue
  },
  {
    immediate: true
  }
)

const autoShowTrack = computed(() => trigger === 'hover')

// 是否存在垂直滚动
const isYScroll = computed(() => containerScrollHeight.value > containerClientHeight.value)
// 是否存在水平滚动
const isXScroll = computed(() => containerScrollWidth.value > containerClientWidth.value)
// 是否存在滚动，水平或垂直
const isScroll = computed(() => {
  if (containerScrollHeight.value || containerScrollWidth.value) {
    return (yScrollable && isYScroll.value) || (xScrollable && isXScroll.value)
  }
  return true
})
// 垂直滚动条高度
const trackHeight = computed(() => {
  if (yScrollable && isYScroll.value) {
    if (containerHeight.value && contentHeight.value && railHeight.value) {
      const value = Math.min(
        containerHeight.value,
        (railHeight.value * containerHeight.value) / contentHeight.value + 1.5 * size
      )
      return Number(value.toFixed(4))
    }
  }
  return 0
})
// 滚动条垂直偏移
const trackTop = computed(() => {
  if (containerHeight.value && contentHeight.value && railHeight.value) {
    return (
      (containerScrollTop.value / (contentHeight.value - containerHeight.value)) *
      (railHeight.value - trackHeight.value)
    )
  }
  return 0
})
// 垂直滚动条样式
const verticalTrackStyle = computed(() => {
  return {
    top: `${trackTop.value}px`,
    height: `${trackHeight.value}px`
  }
})
// 横向滚动条宽度
const trackWidth = computed(() => {
  if (xScrollable && isXScroll.value) {
    if (containerWidth.value && contentWidth.value && railWidth.value) {
      const value = (railWidth.value * containerWidth.value) / contentWidth.value + 1.5 * size
      return Number(value.toFixed(4))
    }
  }
  return 0
})
// 滚动条水平偏移
const trackLeft = computed(() => {
  if (containerWidth.value && contentWidth.value && railWidth.value) {
    return (
      (containerScrollLeft.value / (contentWidth.value - containerWidth.value)) *
      (railWidth.value - trackWidth.value)
    )
  }
  return 0
})
// 水平滚动条样式
const horizontalTrackStyle = computed(() => {
  return {
    left: `${trackLeft.value}px`,
    width: `${trackWidth.value}px`
  }
})

onMounted(() => {
  updateState()
})

const {
  left: scrollingLeft,
  right: scrollingRight,
  top: scrollingTop,
  bottom: scrollingBottom
} = useScroll(containerRef)

useResizeObserver([containerRef, contentRef], updateState)

function updateScrollState(): void {
  containerScrollTop.value = containerRef.value?.scrollTop || 0
  containerScrollLeft.value = containerRef.value?.scrollLeft || 0
}
function updateScrollBarState(): void {
  containerScrollHeight.value = containerRef.value?.scrollHeight || 0
  containerScrollWidth.value = containerRef.value?.scrollWidth || 0
  containerClientHeight.value = containerRef.value?.clientHeight || 0
  containerClientWidth.value = containerRef.value?.clientWidth || 0
  containerHeight.value = containerRef.value?.offsetHeight || 0
  containerWidth.value = containerRef.value?.offsetWidth || 0
  contentHeight.value = contentRef.value?.offsetHeight || 0
  contentWidth.value = contentRef.value?.offsetWidth || 0
  railHeight.value = railVerticalRef.value?.offsetHeight || 0
  railWidth.value = railHorizontalRef.value?.offsetWidth || 0
}
function updateState(): void {
  updateScrollState()
  updateScrollBarState()
}

const debounceYScrollEnd = debounce(yScrollEnd, 100)
const debounceXScrollEnd = debounce(xScrollEnd, 100)
const debounceHideYScrollBar = debounce(hideYScrollBar, 100 + delay)
const debounceHideXScrollBar = debounce(hideXScrollBar, 100 + delay)

function yScrollEnd(e: Event, direction: 'left' | 'right' | 'top' | 'bottom'): void {
  emits('scrollend', e, direction)
}
function xScrollEnd(e: Event, direction: 'left' | 'right' | 'top' | 'bottom'): void {
  emits('scrollend', e, direction)
}
function hideYScrollBar(): void {
  if (autoShowTrack.value) {
    if (autoHide && !yTrackHover.value) {
      showYTrack.value = false
    }
    if (!autoHide && !mouseEnter.value) {
      showYTrack.value = false
    }
  }
}
function hideXScrollBar(): void {
  if (autoShowTrack.value) {
    if (autoHide && !xTrackHover.value) {
      showXTrack.value = false
    }
    if (!autoHide && !mouseEnter.value) {
      showXTrack.value = false
    }
  }
}
function onScroll(e: Event): void {
  if (scrollingLeft.value || scrollingRight.value) {
    let direction: string = ''
    if (scrollingLeft.value) {
      direction = 'left'
    }
    if (scrollingRight.value) {
      direction = 'right'
    }
    emits('scroll', e, direction)
    if (autoShowTrack.value) {
      showXTrack.value = true
      if (!trackXPressed.value && autoHide) {
        debounceXScrollEnd(e, direction)
        debounceHideXScrollBar()
      }
    }
  }
  if (scrollingTop.value || scrollingBottom.value) {
    let direction: string = ''
    if (scrollingTop.value) {
      direction = 'top'
    }
    if (scrollingBottom.value) {
      direction = 'bottom'
    }
    emits('scroll', e, direction)
    if (autoShowTrack.value) {
      showYTrack.value = true
      if (!trackYPressed.value && autoHide) {
        debounceYScrollEnd(e, direction)
        debounceHideYScrollBar()
      }
    }
  }
  updateScrollState()
}
function onMouseEnter(): void {
  mouseEnter.value = true
  if (trackXPressed.value || trackYPressed.value) {
    mousePressedLeave.value = false
  } else {
    if (!autoHide) {
      showXTrack.value = true
      showYTrack.value = true
    }
  }
}
function onMouseLeave(): void {
  mouseEnter.value = false
  if (trackXPressed.value || trackYPressed.value) {
    mousePressedLeave.value = true
  } else {
    if (!autoHide) {
      if (showXTrack.value) {
        debounceHideXScrollBar()
      }
      if (showYTrack.value) {
        debounceHideYScrollBar()
      }
    }
  }
}
function onEnterYTrack(): void {
  yTrackHover.value = true
}
function onLeaveYTrack(): void {
  yTrackHover.value = false
  if (!trackYPressed.value) {
    debounceHideYScrollBar()
  }
}
function onEnterXTrack(): void {
  xTrackHover.value = true
}
function onLeaveXTrack(): void {
  xTrackHover.value = false
  if (!trackXPressed.value) {
    debounceHideXScrollBar()
  }
}
function handleYTrackMouseDown(e: MouseEvent): void {
  trackYPressed.value = true
  memoYTop.value = containerScrollTop.value
  memoMouseY.value = e.clientY
  document.addEventListener('mousemove', handleYTrackMouseMove)
  document.addEventListener('mouseup', handleYTrackMouseUp)
  handleYTrackMouseMove(e)
}
function handleYTrackMouseMove(e: MouseEvent): void {
  const diffY = e.clientY - memoMouseY.value
  const dScrollTop =
    (diffY * (contentHeight.value - containerHeight.value)) /
    (containerHeight.value - trackHeight.value)
  const toScrollTopUpperBound = contentHeight.value - containerHeight.value
  let toScrollTop = memoYTop.value + dScrollTop
  toScrollTop = Math.min(toScrollTopUpperBound, toScrollTop)
  toScrollTop = Math.max(toScrollTop, 0)
  if (containerRef.value) containerRef.value.scrollTop = toScrollTop
}
function handleYTrackMouseUp(): void {
  trackYPressed.value = false
  if (autoShowTrack.value && autoHide && !yTrackHover.value) {
    debounceHideYScrollBar()
  } else if (autoShowTrack.value && !autoHide && mousePressedLeave.value) {
    mousePressedLeave.value = false
    debounceHideYScrollBar()
  }
  document.removeEventListener('mousemove', handleYTrackMouseMove)
  document.removeEventListener('mouseup', handleYTrackMouseUp)
}
function handleXTrackMouseDown(e: MouseEvent): void {
  trackXPressed.value = true
  memoXLeft.value = containerScrollLeft.value
  memoMouseX.value = e.clientX
  document.addEventListener('mousemove', handleXTrackMouseMove)
  document.addEventListener('mouseup', handleXTrackMouseUp)
  handleXTrackMouseMove(e)
}
function handleXTrackMouseMove(e: MouseEvent): void {
  const diffX = e.clientX - memoMouseX.value
  const dScrollLeft =
    (diffX * (contentWidth.value - containerWidth.value)) /
    (containerWidth.value - trackWidth.value)
  const toScrollLeftUpperBound = contentWidth.value - containerWidth.value
  let toScrollLeft = memoXLeft.value + dScrollLeft
  toScrollLeft = Math.min(toScrollLeftUpperBound, toScrollLeft)
  toScrollLeft = Math.max(toScrollLeft, 0)
  if (containerRef.value) containerRef.value.scrollLeft = toScrollLeft
}
function handleXTrackMouseUp(): void {
  trackXPressed.value = false
  if (autoShowTrack.value && autoHide && !xTrackHover.value) {
    debounceHideXScrollBar()
  } else if (autoShowTrack.value && !autoHide && mousePressedLeave.value) {
    mousePressedLeave.value = false
    debounceHideXScrollBar()
  }
  document.removeEventListener('mousemove', handleXTrackMouseMove)
  document.removeEventListener('mouseup', handleXTrackMouseUp)
}

function scrollTo(options?: ScrollToOptions): void {
  containerRef.value?.scrollTo(options)
}
function scrollBy(options?: ScrollToOptions): void {
  containerRef.value?.scrollBy(options)
}
function getScrollData() {
  return {
    scrollTop: containerScrollTop.value,
    scrollWidth: containerScrollWidth.value,
    scrollHeight: containerScrollHeight.value,
    clientWidth: containerClientWidth.value,
    clientHeight: containerClientHeight.value
  }
}

defineExpose({
  scrollTo,
  scrollBy,
  getScrollData
})

const render = () => {
  const defaultSlot = slots.default ? slots.default() : []
  const container = defaultSlot[0]

  if (container?.children) {
    const scrollContentWrapper = h(
      'div',
      {
        ref: containerRef,
        class: ['scrollbar-container', isScroll.value ? 'container-scroll' : null],
        onScroll: onScroll
      },
      h(
        'div',
        {
          ref: contentRef,
          class: ['scrollbar-content', contentClass],
          style: [xScrollable ? { ...horizontalContentStyle, ...contentStyle } : contentStyle]
        },
        container.children
      )
    )

    const YScrollable = h(
      'div',
      {
        ref: railVerticalRef,
        class: ['scrollbar-rail', 'rail-vertical', `rail-vertical-${yPlacement}`],
        style: { display: yScrollable ? `block` : `none` }
      },
      h('div', {
        class: ['scrollbar-track', trigger === 'none' || showYTrack.value ? 'track-visible' : null],
        style: verticalTrackStyle.value,
        onMouseenter: autoShowTrack.value && autoHide ? onEnterYTrack : () => false,
        onMouseleave: autoShowTrack.value && autoHide ? onLeaveYTrack : () => false,
        onMousedown: withModifiers(
          (e) => handleYTrackMouseDown(e as MouseEvent),
          ['prevent', 'stop']
        )
      })
    )

    const XScrollable = h(
      'div',
      {
        ref: railHorizontalRef,
        class: ['scrollbar-rail', 'rail-horizontal', `rail-horizontal-${xPlacement}`],
        style: { display: xScrollable ? `block` : `none` }
      },
      h('div', {
        class: ['scrollbar-track', trigger === 'none' || showXTrack.value ? 'track-visible' : null],
        style: horizontalTrackStyle.value,
        onMouseenter: autoShowTrack.value && autoHide ? onEnterXTrack : () => false,
        onMouseleave: autoShowTrack.value && autoHide ? onLeaveXTrack : () => false,
        onMousedown: withModifiers(
          (e) => handleXTrackMouseDown(e as MouseEvent),
          ['prevent', 'stop']
        )
      })
    )

    const containerStyle = `
          --scrollbar-width: ${size}px;
          --scrollbar-height: ${size}px;
          --scrollbar-border-radius: ${size}px;
          --scrollbar-color: rgba(0, 0, 0, 0.25);
          --scrollbar-color-hover: rgba(0, 0, 0, 0.4);
          --scrollbar-rail-horizontal-top: 4px 2px auto 2px;
          --scrollbar-rail-horizontal-bottom: auto 2px 4px 2px;
          --scrollbar-rail-vertical-right: 2px 4px 2px auto;
          --scrollbar-rail-vertical-left: 2px auto 2px 4px;
          --scrollbar-rail-color: transparent;
        `

    return h(
      container,
      {
        ...container.props,
        class: [container.props?.class, 'with-scrollbar'].filter(Boolean).join(' '),
        style: {
          ...container.props?.style,
          ...Object.fromEntries(
            containerStyle
              .split(';')
              .filter((item) => item)
              .map((item) => item.split(':').map((part) => part.trim()))
              .filter((item) => item[0])
          )
        },
        onMouseenter: isScroll.value && trigger === 'hover' ? onMouseEnter : () => false,
        onMouseleave: isScroll.value && trigger === 'hover' ? onMouseLeave : () => false
      },
      [scrollContentWrapper, YScrollable, XScrollable]
    )
  }
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

/* scrollbar container */
.with-scrollbar .scrollbar-container {
  width: 100%;
  height: 100%;
  min-height: inherit;
  max-height: inherit;
  scrollbar-width: none;
}

/* hide native webkit scrollbars */
.with-scrollbar .scrollbar-container::-webkit-scrollbar,
.with-scrollbar .scrollbar-container::-webkit-scrollbar-track-piece,
.with-scrollbar .scrollbar-container::-webkit-scrollbar-thumb {
  width: 0;
  height: 0;
  display: none;
}

/* content inside container */
.with-scrollbar .scrollbar-container .scrollbar-content {
  box-sizing: border-box;
  min-width: 100%;
}

/* pseudo elements for content */
.with-scrollbar .scrollbar-container .scrollbar-content::after,
.with-scrollbar .scrollbar-container .scrollbar-content::before {
  content: '';
  display: block;
}

/* optional class to force native scrolling */
.with-scrollbar .container-scroll {
  overflow: scroll;
}

/* scrollbar rail and track */
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

/* hover style for track */
.with-scrollbar .scrollbar-rail .scrollbar-track:hover {
  background-color: var(--scrollbar-color-hover);
}

/* utility class to make track visible / interactive */
.with-scrollbar .scrollbar-rail .track-visible {
  opacity: 1;
  pointer-events: all;
}

/* vertical rail specifics */
.with-scrollbar .rail-vertical {
  width: var(--scrollbar-width);
}

.with-scrollbar .rail-vertical .scrollbar-track {
  width: var(--scrollbar-width);
  border-radius: var(--scrollbar-border-radius);
  bottom: 0;
}

/* vertical rail left / right placement */
.with-scrollbar .rail-vertical-left {
  inset: var(--scrollbar-rail-vertical-left);
}

.with-scrollbar .rail-vertical-right {
  inset: var(--scrollbar-rail-vertical-right);
}

/* horizontal rail specifics */
.with-scrollbar .rail-horizontal {
  height: var(--scrollbar-height);
}

.with-scrollbar .rail-horizontal .scrollbar-track {
  height: var(--scrollbar-height);
  border-radius: var(--scrollbar-border-radius);
  right: 0;
}

/* horizontal rail top / bottom placement */
.with-scrollbar .rail-horizontal-top {
  inset: var(--scrollbar-rail-horizontal-top);
}

.with-scrollbar .rail-horizontal-bottom {
  inset: var(--scrollbar-rail-horizontal-bottom);
}

/* thumb */
.with-scrollbar .scrollbar-thumb {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.5);
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
