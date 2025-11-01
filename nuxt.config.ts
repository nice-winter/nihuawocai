// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    'nuxt-auth-utils',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],
  ssr: false,
  vite: {
    server: {
      hmr: {
        path: 'hmr/'
      }
    }
  },
  experimental: {
    typescriptPlugin: true
  },
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
    serverBundle: 'local',
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/icons'
      }
    ]
  },
  nitro: {
    experimental: {
      websocket: true
    }
  }
})
