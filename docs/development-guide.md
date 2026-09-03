# 开发指南

## 新增依赖说明

以下是相对基础 Nuxt 项目额外引入的关键依赖：

| 依赖                   | 版本   | 用途                                                                               |
| ---------------------- | ------ | ---------------------------------------------------------------------------------- |
| `@pinia/colada`        | 2.4.2  | Pinia 数据获取插件，提供 `useMutation` / `useQuery` 等声明式 API，用于管理异步状态 |
| `@vueuse/core`         | 13.9.0 | Vue 组合式工具集，提供 `useStorage`、`useEventListener` 等常用 hooks               |
| `@vueuse/integrations` | 13.9.0 | VueUse 第三方集成（fuse.js 模糊搜索等）                                            |
| `nuxt-auth-utils`      | 0.11.1 | Nuxt 认证工具，提供 OAuth 登录、session 管理、JWT 签发                             |
| `fabric`               | 6.6.4  | Canvas 绘图引擎，画板核心依赖（有魔改类型声明，见下方）                            |
| `crossws`              | 0.4.1  | WebSocket 库，服务端实时通信核心                                                   |
| `mitt`                 | 3.0.1  | 轻量事件总线，用于 WS / Player / Room 三层事件驱动                                 |
| `zod`                  | 4.1.8  | Schema 验证库，用于 WS 消息参数校验                                                |
| `emoji-mart-vue-fast`  | 15.0.5 | Emoji 选择器组件                                                                   |
| `iro.js`               | 5.5.2  | 颜色选择器（圆形色轮）                                                             |
| `idb-keyval`           | 6.2.2  | IndexedDB 封装，用于客户端本地存储                                                 |
| `fuse.js`              | 7.3.0  | 模糊搜索引擎，用于 emoji / 词汇搜索                                                |

## Composables 索引

### 自定义组合式函数

| 文件                                                        | 导出                                                                                          | 说明                                              |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| [useBubble.ts](../app/composables/useBubble.ts)             | `useBubble()`                                                                                 | 气泡消息管理（玩家头顶聊天/系统提示）             |
| [useCountdown.ts](../app/composables/useCountdown.ts)       | `useCountdown()`                                                                              | 倒计时管理（游戏计时器）                          |
| [useMessageBox.ts](../app/composables/useMessageBox.ts)     | `useMessageBox()`                                                                             | 命令式消息弹窗（替代 ElMessageBox）               |
| [useModal.ts](../app/composables/useModal.ts)               | `useModal()`                                                                                  | 可复用弹窗状态管理（mixin 模式）                  |
| [useSound.ts](../app/composables/useSound.ts)               | `useSound()`                                                                                  | 音效播放（基于 Web Audio API）                    |
| [usePaginatedMap.ts](../app/composables/usePaginatedMap.ts) | `usePaginatedMap()`                                                                           | 分页 Map 数据结构，用于大厅房间列表等大数据集分页 |
| [bubbleRegistry.ts](../app/composables/bubbleRegistry.ts)   | `bubbleRegistry`                                                                              | 气泡注册表单例（管理所有气泡实例的生命周期）      |
| [crop.ts](../app/composables/crop.ts)                       | -                                                                                             | 图片裁剪工具                                      |
| [eventBus.ts](../app/composables/eventBus.ts)               | -                                                                                             | 前端事件总线（基于 mitt）                         |
| [text.ts](../app/composables/text.ts)                       | -                                                                                             | 文本处理工具                                      |
| [utils.ts](../app/composables/utils.ts)                     | `useMounted()` `useSupported()` `throttle()` `debounce()` `useResizeObserver()` `useScroll()` | 通用工具函数集合（节流/防抖/滚动监听/尺寸监听）   |

### 全局自动导入

以下由 Nuxt 自动导入，无需手动 import：

| 来源                         | 导出示例       |
| ---------------------------- | -------------- |
| `~/composables/useChat`      | `useChat`      |
| `~/composables/useGameState` | `useGameState` |
| `~/composables/usePlayer`    | `usePlayer`    |
| `~/composables/useRoom`      | `useRoom`      |
| `~/composables/useRoomChat`  | `useRoomChat`  |
| `~/composables/useSound`     | `useSound`     |
| `~/composables/useToast`     | `useToast`     |
| `~/composables/useWs`        | `useWs`        |
| `~/stores/user`              | `useUserStore` |

## Fabric.js 类型声明

[app/types/fabric.d.ts](../app/types/fabric.d.ts) 扩展了 fabric.js 的原生类型，添加了项目自定义属性：

```typescript
declare module 'fabric' {
  namespace fabric {
    interface Object {
      locked?: boolean // 是否锁定（禁止选中/移动/缩放）
      erasable?: boolean // 是否可被橡皮擦擦除
      wsid?: string // WebSocket 关联 ID（用于多人同步）
      zIndex?: number // 图层层级
      _isLine?: boolean // 是否为直线工具绘制的线条
    }
  }
}
```

**注意事项**：

- `locked` 属性在 [sketchpad.ts](../app/lib/game/sketchpad.ts) 中通过 `perPixelTargetFind` 和事件拦截实现运行时锁定，而非 fabric 原生功能
- `wsid` 用于多人画板同步，每个绘制对象在创建时分配唯一 ID
- `erasable` 在 `configureBrush()` 中根据 `eraserWidth > 0` 动态设置
