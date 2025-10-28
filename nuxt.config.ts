// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  experimental: {
    typescriptPlugin: true
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    'nuxt-auth-utils',
    '@pinia/nuxt'
  ],
  css: ['~/assets/css/main.css'],
  ui: {
    experimental: {
      componentDetection: true
    }
  },
  fonts: {
    provider: 'none'
  },
  icon: {
    provider: 'none',
    clientBundle: {
      scan: true
    },
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/icons'
      }
    ]
  }
})
