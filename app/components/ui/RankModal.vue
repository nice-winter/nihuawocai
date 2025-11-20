<template>
  <Teleport :to="targetEl">
    <div
      v-if="visible"
      class="z-114514 flex items-center justify-center bg-transparent"
      :class="parent ? 'absolute inset-0' : 'fixed inset-0'"
    >
      <div ref="modalRef" class="bg-texture rounded-md shadow-hard flex flex-col" tabindex="0">
        <div class="">
          <div class="flex flex-col text-[#804B19] text-light select-none">
            <div class="flex justify-between px-3 py-1.5 text-[13px]">
              <span />
              <span
                >倒计时：<span class="text-(--game-red)">{{ t }}</span></span
              >
            </div>

            <ul class="text-[13px]">
              <li
                v-for="(p, index) in r"
                :key="p.player.id"
                class="flex items-center justify-between gap-3 p-3 odd:bg-[#c5630e24]"
              >
                <span class="w-18 flex items-center justify-between text-right">
                  <UIcon v-if="index === 0" name="emojione:1st-place-medal" class="size-6" />
                  <UIcon v-if="index === 1" name="emojione:2nd-place-medal" class="size-6" />
                  <UIcon v-if="index === 2" name="emojione:3rd-place-medal" class="size-6" />

                  <span class="ml-auto"
                    ><span class="text-lg text-(--game-red)">{{ p.score }}</span
                    >分</span
                  >
                </span>

                <div class="w-48 flex items-center gap-1">
                  <UiAvatar :player="p.player" class="size-10" />
                  <UiGenderIcon :gender="p.player.gender" />
                  <span class="max-w-32 text-default truncate">{{ p.player.nickname }}</span>
                </div>

                <div class="flex-1 flex items-center gap-1">
                  <span class="w-14 flex items-center gap-1">
                    <UIcon name="custom:icon-flower" class="size-4 shrink-0" />
                    <span>({{ p.flower }})</span>
                  </span>

                  <span class="w-14 flex items-center gap-1">
                    <UIcon name="custom:icon-egg" class="size-4 shrink-0" />
                    <span>({{ p.egg }})</span>
                  </span>

                  <span class="w-14 flex items-center gap-1">
                    <UIcon name="custom:icon-slipper" class="size-4 shrink-0" />
                    <span>({{ p.slipper }})</span>
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Player } from '~~/shared/interfaces/player'

export interface RankItem {
  score: number
  flower: number
  egg: number
  slipper: number
  player: Player
}

export interface ThrowerModalProps {
  countdown?: number
  ranks?: RankItem[]
  parent?: Element
}
const { parent = '', ranks = [], countdown = 8 } = defineProps<ThrowerModalProps>()

const visible = ref(false)
const resolveFn = ref<(() => void) | null>(null)
const rejectFn = ref<(() => void) | null>(null)
const modalRef = ref<HTMLDivElement | null>(null)
const targetEl = computed(() => parent ?? document.body)

const r = computed(() => [...ranks].sort((a, b) => b.score - a.score))

const t = ref(countdown)
const timer = ref<number | null>(null)

const open = (): Promise<void> => {
  visible.value = true

  return new Promise<void>((resolve, reject) => {
    resolveFn.value = resolve
    rejectFn.value = reject
  })
}

const close = () => {
  resolveFn.value?.()
  visible.value = false
  clearTimeout(timer.value!)
}

onMounted(() => {
  timer.value = setInterval(() => {
    t.value--
    if (t.value === 0) {
      close()
    }
  }, 1000)
})
onUnmounted(() => {
  clearTimeout(timer.value!)
})

defineExpose({ open })
</script>

<style scoped></style>
