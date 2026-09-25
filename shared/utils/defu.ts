import { createDefu } from 'defu'

/**
 * 对象求和合并
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defuSum = createDefu((obj: any, key, value) => {
  if (typeof obj[key] === 'number' && typeof value === 'number') {
    obj[key] += value
    return true
  }
})

/**
 * 递归合并对象，数组字段直接替换而非拼接（默认 defu 是拼接）
 * 适用于局部更新：传了就用传的，没传保留原值
 */
export const defuReplaceArray = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) || Array.isArray(value)) {
    obj[key] = value
    return true
  }
})
