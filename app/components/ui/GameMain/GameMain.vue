<template>
  <div id="game-panel" class="relative flex items-center justify-center">
    <div
      class="custom-foreground-bg relative z-1 h-[640px] w-[900px] overflow-hidden rounded-[14px] border border-surface-400 bg-surface-200 shadow-main"
    >
      <slot />
    </div>
    <div
      class="custom-background-bg absolute h-[640px] w-[900px] rotate-[-1.6deg] rounded-[14px] bg-surface-650 shadow-main"
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
