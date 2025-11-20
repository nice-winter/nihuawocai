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
