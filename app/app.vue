<script setup lang="ts">
const { data } = await useFetch('/api/hello')
console.log(data.value)
</script>

<template>
  <UApp>
    <UiGameMainFrame>
      <template #panel>
        <UiGameMainPanel>
          <UiGameMainLobby />
          <!-- <UiGameMainRoom /> -->
        </UiGameMainPanel>
      </template>
    </UiGameMainFrame>
  </UApp>
</template>
