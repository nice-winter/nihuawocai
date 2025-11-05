import { ref, getCurrentInstance, onMounted, toValue, computed, watch, onBeforeUnmount } from 'vue'
import type { Ref, ComputedRef } from 'vue'

/**
 * 用于判断组件是否已挂载的自定义钩子
 *
 * 在组件的生命周期中，我们经常需要知道组件是否已经挂载，特别是在异步操作或者动态渲染的场景中
 * 此钩子通过在组件挂载时设置一个 Ref 对象的状态来帮助我们进行判断
 *
 * @returns { Ref<boolean> } 返回一个 Ref 对象，用于指示组件是否已挂载
 */
export function useMounted(): Ref<boolean> {
  const isMounted = ref(false)
  // 获取当前组件的实例
  const instance = getCurrentInstance()
  if (instance) {
    onMounted(() => {
      isMounted.value = true
    }, instance)
  }
  return isMounted
}

/**
 * 检查 api 是否支持
 *
 * 用于检查给定的回调函数是否在组件挂载期间被支持
 *
 * @param {() => unknown} callback 回调函数，用于执行某些操作，并返回用于计算的值
 * @returns {ComputedRef<boolean>} 返回一个计算属性，该属性在组件挂载时会触发回调函数，并根据回调函数的返回值计算支持状态
 */
export function useSupported(callback: () => unknown): ComputedRef<boolean> {
  const isMounted = useMounted()
  return computed(() => {
    // to trigger the ref
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    isMounted.value
    return Boolean(callback())
  })
}

/**
 * 节流函数 throttle
 *
 * 该函数用于生成一个节流函数，用于控制某个函数在给定时间间隔内只能被执行一次
 * 主要用于性能优化，例如限制事件处理函数的触发频率
 *
 * @param {Function} fn 要被节流的函数
 * @param {number} [delay = 300] 节流的时间间隔，单位 ms，默认为 300ms
 * @returns {Function} 返回一个新的节流的函数
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function throttle(fn: Function, delay: number = 300): Function {
  let valid = true // 用于标记函数是否可以执行
  return function (...args: unknown[]) {
    if (!valid) return false // 返回 false，表示当前不执行函数
    // 返回一个新的函数，该函数负责执行节流逻辑
    if (valid) {
      fn(...args) // 执行原函数
      valid = false // 将函数置为无效
      setTimeout(() => {
        valid = true
      }, delay)
    }
  }
}

/**
 * 防抖函数 debounce
 *
 * 主要用于限制函数调用的频率，当频繁触发某个函数时，实际上只需要在最后一次触发后的一段时间内执行一次即可
 * 这对于诸如输入事件处理函数、窗口大小调整事件处理函数等可能会频繁触发的函数非常有用
 *
 * @param {Function} fn 要执行的函数
 * @param {number} [delay = 300] 防抖的时间期限，单位 ms，默认为 300ms
 * @returns {Function} 返回一个新的防抖的函数
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function debounce(fn: Function, delay: number = 300): Function {
  let timer: number | null = null // 使用闭包保存定时器的引用
  return function (...args: unknown[]) {
    // 返回一个包装函数
    if (timer) {
      // 如果定时器存在，则清除之前的定时器
      clearTimeout(timer)
    }
    // 设置新的定时器，延迟执行原函数
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * 组合式函数
 * 使用 ResizeObserver 观察 DOM 元素尺寸变化
 *
 * 该函数提供了一种方便的方式来观察一个或多个元素的尺寸变化，并在变化时执行指定的回调函数
 *
 * @param {Ref | Ref[] | HTMLElement | HTMLElement[]} target 要观察的目标，可以是 Ref 对象、Ref 数组、HTMLElement 或 HTMLElement 数组
 * @param {ResizeObserverCallback} callback 当元素尺寸变化时调用的回调函数
 * @param {object} [options = {}] ResizeObserver 选项，用于定制观察行为
 * @returns {{ start: () => void, stop: () => void }} 返回一个对象，包含停止和开始观察的方法，使用者可以调用 start 方法开始观察，调用 stop 方法停止观察
 */
export function useResizeObserver(
  target: Ref | Ref[] | HTMLElement | HTMLElement[],
  callback: ResizeObserverCallback,
  options: object = {}
): { start: () => void; stop: () => void } {
  const isSupported = useSupported(() => window && 'ResizeObserver' in window)
  let observer: ResizeObserver | undefined
  const stopObservation = ref(false)
  const targets = computed(() => {
    const targetsValue = toValue(target)
    if (targetsValue) {
      if (Array.isArray(targetsValue)) {
        return targetsValue.map((el: unknown) => toValue(el)).filter((el: unknown) => el)
      } else {
        return [targetsValue]
      }
    }
    return []
  })
  // 定义清理函数，用于断开 ResizeObserver 的连接
  const cleanup = () => {
    if (observer) {
      observer.disconnect()
      observer = undefined
    }
  }
  // 初始化 ResizeObserver，开始观察目标元素
  const observeElements = () => {
    if (isSupported.value && targets.value.length && !stopObservation.value) {
      observer = new ResizeObserver(callback)
      targets.value.forEach((element: HTMLElement) => observer!.observe(element, options))
    }
  }
  // 监听 targets 的变化，当 targets 变化时，重新建立 ResizeObserver 观察
  watch(
    () => targets.value,
    () => {
      cleanup()
      observeElements()
    },
    {
      immediate: true, // 立即触发回调，以便初始状态也被观察
      flush: 'post'
    }
  )
  const start = () => {
    stopObservation.value = false
    observeElements()
  }
  const stop = () => {
    stopObservation.value = true
    cleanup()
  }
  // 在组件卸载前清理 ResizeObserver
  onBeforeUnmount(() => cleanup())
  return {
    start,
    stop
  }
}

/**
 * 组合式函数
 * 实时监测目标元素滚动位置及状态
 *
 * 自定义钩子用于处理滚动事件和状态
 * @param {Ref | HTMLElement | Window | Document} [target = window] 滚动目标元素，可以是 Ref、HTMLElement、Window 或 Document，默认为 window
 * @param {number} [throttleDelay = 0] 节流延迟，用于限制滚动事件的触发频率，默认为 0
 * @param {(e: Event) => void} onScroll 滚动事件的回调函数，可选
 * @param {(e: Event) => void} onStop 滚动结束的回调函数，可选
 * @returns {{ x: Ref<number>, xScrollMax: Ref<number>, y: Ref<number>, yScrollMax: Ref<number>, isScrolling: Ref<boolean>, left: Ref<boolean>, right: Ref<boolean>, top: Ref<boolean>, bottom: Ref<boolean> }} 返回一个对象，包含滚动位置和各种状态信息
 */
export function useScroll(
  target: Ref | HTMLElement | Window | Document = window,
  throttleDelay: number = 0,
  onScroll?: (e: Event) => void,
  onStop?: (e: Event) => void
): {
  x: Ref<number>
  xScrollMax: Ref<number>
  y: Ref<number>
  yScrollMax: Ref<number>
  isScrolling: Ref<boolean>
  left: Ref<boolean>
  right: Ref<boolean>
  top: Ref<boolean>
  bottom: Ref<boolean>
} {
  const x = ref(0) // 水平滚动距离
  const xScrollMax = ref(0) // 水平最大可滚动距离
  const y = ref(0) // 垂直滚动距离
  const yScrollMax = ref(0) // 垂直最大可滚动距离
  const isScrolling = ref(false) // 是否正在滚动
  const left = ref(false) // 是否向左滚动
  const right = ref(false) // 是否向右滚动
  const top = ref(false) // 是否向上滚动
  const bottom = ref(false) // 是否向下滚动
  const lastScrollLeft = ref(0) // 上一次水平滚动距离
  const lastScrollTop = ref(0) // 上一次垂直滚动距离
  // 滚动事件
  function scrollEvent(e: Event) {
    isScrolling.value = true
    const eventTarget = ((e.target as Document).documentElement ?? e.target) as HTMLElement
    x.value = eventTarget.scrollLeft
    y.value = eventTarget.scrollTop
    left.value = x.value < lastScrollLeft.value
    right.value = x.value > lastScrollLeft.value
    top.value = y.value < lastScrollTop.value
    bottom.value = y.value > lastScrollTop.value
    lastScrollLeft.value = x.value
    lastScrollTop.value = y.value
    debounceScrollEnd(e)
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    onScroll && onScroll(e)
  }
  // 使用节流函数限制滚动事件触发频率
  const throttleScroll = throttle(scrollEvent, throttleDelay)
  // 滚动结束事件
  function scrollEndEvent(e: Event) {
    if (!isScrolling.value) {
      return
    }
    isScrolling.value = false
    left.value = false
    right.value = false
    top.value = false
    bottom.value = false
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    onStop && onStop(e)
  }
  // 使用防抖函数延迟处理滚动结束事件
  const debounceScrollEnd = debounce(scrollEndEvent, throttleDelay + 200)
  // 计算滚动目标元素
  const scrollTarget = computed(() => {
    const targetValue = toValue(target)
    if (targetValue) {
      return targetValue
    }
    return null
  })
  // 监听滚动目标元素的变化
  watch(
    () => scrollTarget.value,
    (to: unknown, from: unknown) => {
      if (from) {
        cleanup(from)
      }
      if (to) {
        const el: Element = ((to as Window)?.document?.documentElement ||
          (to as Document)?.documentElement ||
          (to as HTMLElement)) as Element
        xScrollMax.value = el.scrollWidth - el.clientWidth
        yScrollMax.value = el.scrollHeight - el.clientHeight
        el.addEventListener('scroll', throttleScroll as EventListener)
        el.addEventListener('scrollend', debounceScrollEnd as EventListener)
      }
    },
    {
      immediate: true,
      flush: 'post'
    }
  )
  // 清理函数，用于移除事件监听器
  function cleanup(target: unknown) {
    const el: Element = ((target as Window)?.document?.documentElement ||
      (target as Document)?.documentElement ||
      (target as HTMLElement)) as Element
    el.removeEventListener('scroll', throttleScroll as EventListener)
    el.removeEventListener('scrollend', debounceScrollEnd as EventListener)
  }
  // 在组件卸载前调用清理函数
  onBeforeUnmount(() => cleanup(scrollTarget.value))
  // 返回滚动位置和各种状态信息
  return { x, xScrollMax, y, yScrollMax, isScrolling, left, right, top, bottom }
}
