/**
 * 启动 banner 插件
 * 在所有其他插件初始化完成后，汇总输出启动信息
 */
export default defineNitroPlugin(async () => {
  await showBanner()
})
