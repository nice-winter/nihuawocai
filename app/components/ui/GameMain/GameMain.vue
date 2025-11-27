<template>
  <div id="game-panel" class="relative flex justify-center items-center">
    <div
      class="relative z-1 w-[900px] h-[640px] rounded-[14px] overflow-hidden border border-[#eae0d0] bg-[#f7ebdf] shadow-[0_0_4px_2px_rgb(176,129,73)] custom-foreground-bg"
    >
      <slot />
    </div>
    <div
      class="absolute w-[900px] h-[640px] rounded-[14px] bg-[#cdb69b] shadow-[0_0_4px_2px_rgb(176,129,73)] rotate-[-1.6deg] custom-background-bg"
    />
  </div>
</template>

<script setup lang="ts">
import OfflineModal from '@/components/modal/OfflineModal.vue'

const { useWsEventBus } = useWsStore()
const offlineModal = useModal(OfflineModal, { parent: '#game-panel' })

useWsEventBus('ws:disconnected', ({ code, reason }) => {
  if (code === 4001) {
    offlineModal.open({
      reason: '你的账号在另一处登录。'
    })
  } else {
    offlineModal.open({
      reason
    })
  }
})
useWsEventBus('ws:error', (error) => {
  offlineModal.open({
    reason: error
  })
})
</script>

<style scoped>
.custom-foreground-bg {
  background-image:
    linear-gradient(#eae0d0ba 1px, transparent 1px),
    linear-gradient(90deg, #eae0d0ba 1px, transparent 1px);
  background-size: 11.5px 11.5px;
}

.custom-background-bg {
  background-image: repeating-linear-gradient(
    -45deg,
    #b19b79 0,
    #c3b6a2 1px,
    #cdb59a 1px,
    #cdb59a 3px
  );
}
</style>
