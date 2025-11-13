/**
 * 用于对响应式 Map 进行分页管理的组合函数
 * @param map 响应式 Map
 * @param pageSize 每页数量
 */
export const usePaginatedMap = <K, V>(map: Map<K, V>, pageSize: number) => {
  const currentPage = ref(1)

  // 总页数
  const totalPages = computed(() => {
    const size = map.size
    return Math.max(1, Math.ceil(size / pageSize))
  })

  // 当前页的值数组
  const currentPageItems = computed(() => {
    const values = Array.from(map.values())
    const start = (currentPage.value - 1) * pageSize
    const end = start + pageSize
    return values.slice(start, end)
  })

  const nextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++
  }

  const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--
  }

  // 监听 map.size，自动校正页码
  watch(
    () => map.size,
    () => {
      if (currentPage.value > totalPages.value) {
        currentPage.value = totalPages.value
      }
    }
  )

  return {
    currentPage,
    currentPageItems,
    totalPages,
    nextPage,
    prevPage
  }
}
