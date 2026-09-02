import type { IKeyframe } from '@/components/ui/FlyingItem.vue'

/**
 * 创建扔拖鞋的动画关键帧
 * 动画流程：
 * 1. 从屏幕外旋转甩入 (0-25%)
 * 2. 到达目标位置，减速 (25-40%)
 * 3. 沿屏幕向下滑落 (40-80%)
 * 4. 淡出消失 (80-100%)
 *
 * @param startX 起始 X 坐标
 * @param startY 起始 Y 坐标
 * @param endX 目标 X 坐标
 * @param endY 目标 Y 坐标
 * @param containerHeight 容器高度
 */
export const createSlipperAnimation = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  containerHeight: number
): IKeyframe[] => {
  // 滑落到底部的位置
  const slideEndY = containerHeight - 60

  return [
    {
      // 0%: 起始位置（屏幕外）
      offset: 0,
      transform: `translate(${startX}px, ${startY}px) rotate(0deg) scale(1.2)`,
      opacity: 1,
      easing: 'ease-out'
    },
    {
      // 25%: 飞到目标位置，旋转 720°
      offset: 0.25,
      transform: `translate(${endX}px, ${endY}px) rotate(740deg) scale(1)`,
      opacity: 1,
      easing: 'ease-out'
    },
    {
      // 40%: 轻微回弹，旋转停止
      offset: 0.4,
      transform: `translate(${endX}px, ${endY + 10}px) rotate(740deg) scale(1)`,
      opacity: 1,
      easing: 'ease-in-out'
    },
    {
      // 80%: 滑落到屏幕底部
      offset: 0.8,
      transform: `translate(${endX + 20}px, ${slideEndY}px) rotate(740deg) scale(1)`,
      opacity: 0,
      easing: 'ease-in'
    },
    {
      // 100%: 淡出消失
      offset: 1,
      transform: `translate(${endX + 20}px, ${slideEndY}px) rotate(740deg) scale(1)`,
      opacity: 0,
      easing: 'ease-in'
    }
  ]
}

/**
 * 创建鞋印出现动画
 * 拖鞋到达时出现，拖鞋滑落时渐隐
 *
 * @param x 鞋印 X 坐标
 * @param y 鞋印 Y 坐标
 */
export const createPrintAnimation = (
  x: number,
  y: number
): IKeyframe[] => {
  return [
    {
      // 0%: 鞋印直接出现（完全显现）
      offset: 0,
      transform: `translate(${x}px, ${y}px) rotate(740deg) scale(1)`,
      opacity: 1,
      easing: 'ease-out'
    },
    {
      // 30%: 鞋印保持完全显现
      offset: 0.3,
      transform: `translate(${x}px, ${y}px) rotate(740deg) scale(1)`,
      opacity: 1,
      easing: 'ease-out'
    },
    {
      // 100%: 拖鞋滑落，鞋印渐隐
      offset: 1,
      transform: `translate(${x}px, ${y}px) rotate(740deg) scale(1)`,
      opacity: 0,
      easing: 'ease-in'
    }
  ]
}
