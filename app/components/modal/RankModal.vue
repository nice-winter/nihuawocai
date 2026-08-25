<template>
  <BaseModal ref="baseModal" :parent="parent">
    <div ref="modalRef" class="bg-texture rounded-md shadow-hard flex flex-col" tabindex="0">
      <div class="">
        <div class="flex flex-col text-wood-700 text-shadow-light select-none">
          <div class="flex justify-between px-3 py-1.5 text-sm2">
            <span />
            <span
              >倒计时：<span class="text-game-red-500">{{ t }}</span></span
            >
          </div>

          <ul class="text-sm2">
            <li
              v-for="(p, index) in sortedRanks"
              :key="p.player.id"
              class="flex items-center justify-between gap-3 p-3 odd:bg-wood-100"
            >
              <span class="w-18 flex items-center justify-between text-right">
                <UIcon v-if="index === 0" name="emojione:1st-place-medal" class="size-6" />
                <UIcon v-if="index === 1" name="emojione:2nd-place-medal" class="size-6" />
                <UIcon v-if="index === 2" name="emojione:3rd-place-medal" class="size-6" />

                <span class="ml-auto"
                  ><span class="text-lg text-game-red-500">{{ p.score }}</span
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
  </BaseModal>
</template>

<script setup lang="ts">
export interface RankItem {
  score: number
  flower: number
  egg: number
  slipper: number
  player: Player
}

export interface RankModalProps {
  seconds?: number
  ranks?: RankItem[]
  parent?: Element
}

const { parent, ranks = [], seconds = 8 } = defineProps<RankModalProps>()

const baseModal = useTemplateRef('baseModal')
const modalRef = ref<HTMLDivElement | null>(null)

const sortedRanks = computed(() => [...ranks].sort((a, b) => b.score - a.score))

const { t, start } = useCountdown(seconds, () => baseModal.value?.close())

const open = (): Promise<void> => {
  start()
  return baseModal.value!.open()
}

defineExpose({ open })
</script>
