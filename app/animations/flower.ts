import type { IKeyframe } from '@/components/ui/FlyingItem.vue'

export const createFlowerAnimation = (
  startX: number,
  startY: number,
  endY: number
): IKeyframe[] => {
  const peakY = startY - 80

  return [
    {
      offset: 0,
      transform: `translate(${startX}px, ${startY}px) scale(1)`,
      opacity: 1,
      easing: 'ease-out'
    },
    {
      offset: 0.3,
      transform: `translate(${startX}px, ${peakY}px) scale(0.9)`,
      opacity: 1,
      easing: 'ease-in'
    },
    {
      offset: 1,
      transform: `translate(${startX}px, ${endY}px) scale(0.5)`,
      opacity: 0.5,
      easing: 'ease-in'
    }
  ]
}
