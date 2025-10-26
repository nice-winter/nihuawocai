<script setup lang="ts">
const { data } = await useFetch('/api/hello')
console.log(data.value)
</script>

<template>
  <UApp>
    <div class="w-full flex flex-row justify-center">
      <div class="w-5xl min-h-[1151px] flex flex-col custom-bg bg-top bg-size-[1024px]">
        <div class="w-full h-40"></div>
        <div class="w-full h-10 flex justify-center items-center">
          <div class="w-[900px] flex flex-row justify-center">
            <span class="font-sans text-5xl quotation" style="margin-left: -28px">“</span>
            <span class="grow text-light px-2">
              【公告】阿星啊，你总得计划一下吧，这么年轻难道不工作，就混小太保啊。
            </span>
            <span class="font-sans text-5xl quotation" style="margin-right: -28px">”</span>
          </div>
        </div>
        <UiGameMainFrame class="">
          <template #panel>
            <UiGameMainPanel>
              <!-- <UiGameMainLobby /> -->
              <UiGameMainRoom />
            </UiGameMainPanel>
          </template>
        </UiGameMainFrame>
      </div>
    </div>
  </UApp>
</template>

<style scoped>
.custom-bg {
  background-image: url(~/assets/bg.jpg);
  background-repeat: no-repeat;
}

.quotation {
  line-height: 0;
  font-family: sans-serif;
  text-shadow:
    2px 2px 0 #ffffff,
    -1px 1px 0 #ffffff,
    2px 1px 0 #ffffff;
  color: #db0030;
  padding-top: 20px;
  user-select: none;
}
</style>
