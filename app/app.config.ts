export default defineAppConfig({
  icon: { mode: 'css', cssLayer: 'base' },
  ui: {
    popover: {
      slots: {
        content: 'game-popover'
      }
    }
  }
})
