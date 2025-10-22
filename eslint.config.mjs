// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  {
    name: 'app/custom-rules',
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  }
)
