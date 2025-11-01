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
            <span class="-ml-7 font-sans text-5xl quotation">“</span>
            <span class="grow text-light px-2">
              【公告】阿星啊，你总得<UiLinkButton color="red">计划</UiLinkButton
              >一下吧，这么年轻难道不工作，就混小太保啊。
            </span>
            <span class="-mr-7 font-sans text-5xl quotation">”</span>
          </div>
        </div>
        <UiGameMainFrame class="">
          <template #header>
            <div
              class="flex justify-between px-[.785rem] text-[13px] text-(--game-font-color) select-none"
            >
              <div class="flex gap-5 pt-5">
                <span>天秤座</span>
                <span>房间4</span>
              </div>
            </div>
          </template>

          <template #main>
            <UiGameMain>
              <!-- <UiGameMainLobby /> -->
              <UiGameMainRoom :stage="1" />
            </UiGameMain>
          </template>

          <template #footer>
            <div
              class="flex justify-between px-[.785rem] pt-4.5 text-[12px] text-[#aa7b4c91] select-none"
            >
              <div class="flex flex-col justify-center">
                <span>免责声明：本项目为非盈利社区性项目。</span>
                <span>无意侵犯其版权，所有权利均归其各自所有者所有。</span>
              </div>

              <div class="flex flex-col justify-center max-w-[20rem] text-right">
                <span>© 上海优哉游哉网络科技有限公司 版权所有</span>
                <span>《你画我猜》是其开发并持有软件著作权的软件产品</span>
              </div>
            </div>
          </template>
        </UiGameMainFrame>
      </div>
    </div>
  </UApp>
</template>

<style scoped>
.custom-bg {
  background-image: url(~/assets/bg.webp);
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
