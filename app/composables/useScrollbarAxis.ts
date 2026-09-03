/**
 * 滚动条单轴逻辑 composable
 *
 * 封装 X 或 Y 轴的滚动条尺寸计算、拖拽交互、显隐控制，
 * 供 ScrollBar.vue 各调用一次来消除 X/Y 重复代码。
 */
import type { CSSProperties, ComputedRef, Ref } from 'vue'

export interface UseScrollbarAxisOptions {
  axis: 'x' | 'y'
  containerRef: Ref<HTMLElement | undefined>
  contentRef: Ref<HTMLElement | undefined>
  railRef: Ref<HTMLElement | undefined>
  autoShowTrack: ComputedRef<boolean>
  autoHide: boolean
  delay: number
  size: number
  /** 鼠标是否在容器内（autoHide=false 时用于判断隐藏） */
  mouseEnter: Ref<boolean>
  onScrollEnd: (e: Event, direction: string) => void
}

export function useScrollbarAxis(options: UseScrollbarAxisOptions) {
  const { axis, containerRef, contentRef, railRef, autoShowTrack, autoHide, delay, size, mouseEnter, onScrollEnd } = options
  const isY = axis === 'y'

  // --- 状态 ---
  const showTrack = ref(false)
  const trackPressed = ref(false)
  const trackHover = ref(false)
  const mousePressedLeave = ref(false)
  const memoScroll = ref(0)
  const memoMouse = ref(0)

  // 容器尺寸
  const scrollSize = ref(0)     // scrollHeight / scrollWidth
  const clientSize = ref(0)     // clientHeight / clientWidth
  const containerSize = ref(0)  // offsetHeight / offsetWidth
  const contentSize = ref(0)    // content offsetHeight / offsetWidth
  const railSize = ref(0)       // rail offsetHeight / offsetWidth
  const scrollPos = ref(0)      // scrollTop / scrollLeft

  // --- 计算属性 ---
  const isScrollable = computed(() => scrollSize.value > clientSize.value)

  const trackSize = computed(() => {
    if (!isScrollable.value) return 0
    if (containerSize.value && contentSize.value && railSize.value) {
      const value = Math.min(
        containerSize.value,
        (railSize.value * containerSize.value) / contentSize.value + 1.5 * size
      )
      return Number(value.toFixed(4))
    }
    return 0
  })

  const trackOffset = computed(() => {
    if (containerSize.value && contentSize.value && railSize.value) {
      return (
        (scrollPos.value / (contentSize.value - containerSize.value)) *
        (railSize.value - trackSize.value)
      )
    }
    return 0
  })

  const trackStyle = computed<CSSProperties>(() =>
    isY
      ? { top: `${trackOffset.value}px`, height: `${trackSize.value}px` }
      : { left: `${trackOffset.value}px`, width: `${trackSize.value}px` }
  )

  // --- 更新函数 ---
  function updateScrollPos(): void {
    scrollPos.value = isY
      ? (containerRef.value?.scrollTop || 0)
      : (containerRef.value?.scrollLeft || 0)
  }

  function updateDimensions(): void {
    scrollSize.value = isY
      ? (containerRef.value?.scrollHeight || 0)
      : (containerRef.value?.scrollWidth || 0)
    clientSize.value = isY
      ? (containerRef.value?.clientHeight || 0)
      : (containerRef.value?.clientWidth || 0)
    containerSize.value = isY
      ? (containerRef.value?.offsetHeight || 0)
      : (containerRef.value?.offsetWidth || 0)
    contentSize.value = isY
      ? (contentRef.value?.offsetHeight || 0)
      : (contentRef.value?.offsetWidth || 0)
    railSize.value = isY
      ? (railRef.value?.offsetHeight || 0)
      : (railRef.value?.offsetWidth || 0)
  }

  function updateState(): void {
    updateScrollPos()
    updateDimensions()
  }

  // --- 隐藏逻辑 ---
  function hideScrollBar(): void {
    if (!autoShowTrack.value) return
    // autoHide=true: 鼠标不在滚动条上就隐藏
    if (autoHide && !trackHover.value) {
      showTrack.value = false
    }
    // autoHide=false: 鼠标不在容器内才隐藏
    if (!autoHide && !mouseEnter.value) {
      showTrack.value = false
    }
  }

  const debouncedHide = useDebounceFn(hideScrollBar, 100 + delay)
  const debouncedScrollEnd = useDebounceFn(
    (e: Event, direction: string) => onScrollEnd(e, direction),
    100
  )

  // --- hover 事件 ---
  function onEnterTrack(): void {
    trackHover.value = true
  }

  function onLeaveTrack(): void {
    trackHover.value = false
    if (!trackPressed.value) {
      debouncedHide()
    }
  }

  // --- 拖拽事件 ---
  function handleMouseDown(e: MouseEvent): void {
    trackPressed.value = true
    memoScroll.value = scrollPos.value
    memoMouse.value = isY ? e.clientY : e.clientX
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    handleMouseMove(e)
  }

  function handleMouseMove(e: MouseEvent): void {
    const mousePos = isY ? e.clientY : e.clientX
    const diff = mousePos - memoMouse.value
    const maxScroll = contentSize.value - containerSize.value
    const dScroll = (diff * maxScroll) / (containerSize.value - trackSize.value)
    const toScroll = Math.max(0, Math.min(maxScroll, memoScroll.value + dScroll))
    if (containerRef.value) {
      if (isY) containerRef.value.scrollTop = toScroll
      else containerRef.value.scrollLeft = toScroll
    }
  }

  function handleMouseUp(): void {
    trackPressed.value = false
    if (autoShowTrack.value && autoHide && !trackHover.value) {
      debouncedHide()
    } else if (autoShowTrack.value && !autoHide && mousePressedLeave.value) {
      mousePressedLeave.value = false
      debouncedHide()
    }
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  // --- 生命周期 ---
  onMounted(() => updateState())

  useResizeObserver([containerRef, contentRef, railRef], updateState)

  // 拖拽中组件卸载时清理
  onUnmounted(() => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  })

  return {
    showTrack,
    trackStyle,
    isScrollable,
    onEnterTrack,
    onLeaveTrack,
    handleMouseDown,
    updateScrollPos,
    updateDimensions,
    updateState,
    /** 容器垂直/水平滚动位置 */
    scrollPos,
    /** scrollHeight / scrollWidth */
    scrollSize,
    /** clientHeight / clientWidth */
    clientSize,
    /** offsetHeight / offsetWidth */
    containerSize,
    /** 内容 offsetHeight / offsetWidth */
    contentSize,
    /** 是否处于拖拽中 */
    trackPressed,
    /** 鼠标是否在按下状态离开容器 */
    mousePressedLeave,
    /** 触发滚动结束事件 */
    debouncedScrollEnd,
    /** 触发隐藏滚动条 */
    debouncedHide
  }
}
