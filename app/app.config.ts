export default defineAppConfig({
  icon: { mode: 'css', cssLayer: 'base' },
  ui: {
    colors: {
      primary: 'blue'
    },
    popover: {
      slots: {
        content: 'game-popover'
      }
    }
  }
})
