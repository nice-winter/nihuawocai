import type { Gender } from '../types/gender'

/**
 * 生成下一个可用的性别 code
 *
 * 取现有最大 code + 1，而非数组长度：
 * 删除中间项后用长度会撞上已有 code，导致 genderMap 映射错乱
 */
export const nextGenderCode = (genders: Gender[]): number =>
  genders.reduce((max, g) => Math.max(max, g.code), -1) + 1
