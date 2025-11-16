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
    },
    tooltip: {
      slots: {
        content: 'game-tooltip'
      }
    }
  }
})
