export default defineNuxtConfig({
  // 基础设置
  compatibilityDate: '2025-07-15',
  ssr: false,

  // 应用信息
  app: {
    head: {
      title: '我画你猜'
    }
  },

  // 全局样式
  css: ['~/assets/css/main.css'],

  // 模块
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
    '@vueuse/nuxt',
    '@nuxtjs/i18n'
  ],

  // UI 相关
  ui: {
    colorMode: false,
    experimental: {
      componentDetection: true
    }
  },

  // 字体
  fonts: {
    provider: 'local'
  },

  // 图标
  icon: {
    serverBundle: 'local',
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/icons'
      }
    ]
  },

  // 国际化
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'en',
    locales: [
      {
        code: 'en',
        name: 'English'
      },
      {
        code: 'zh_cn',
        name: '简体中文'
      },
      {
        code: 'zh_tw',
        name: '繁體中文'
      }
    ]
  },

  // Vite 配置
  vite: {
    server: {
      hmr: {
        path: 'hmr/'
      }
    }
  },

  // Nitro 配置
  nitro: {
    experimental: {
      websocket: true,
      database: true,
      tasks: true
    }
  },

  // 实验功能
  experimental: {
    typescriptPlugin: true
  },

  // Devtools
  devtools: { enabled: true }
})
