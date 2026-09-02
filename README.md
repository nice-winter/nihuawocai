<p align="center">
  <img alt="banner" src="public/images/banner-readme-mini.png" width="600" />
</p>

<h1 align="center">你画我猜</h1>

<p align="center">
  新浪微博小游戏「你画我猜」的社区复刻版，俗称「渣浪画猜」、「旧版画猜」。
</p>

<p align="center">
  <a href="https://github.com/nice-winter/nihuawocai/actions/workflows/ci.yml"><img src="https://github.com/nice-winter/nihuawocai/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <img src="https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt&logoColor=white" alt="Nuxt 4" />
  <img src="https://img.shields.io/badge/@nuxt/ui-3-00DC82?logo=nuxt&logoColor=white" alt="@nuxt/ui" />
  <a href="LICENSE"><img src="https://img.shields.io/github/license/nice-winter/nihuawocai" alt="License" /></a>
</p>

<p align="center">
  <a href="#">🎮 在线游玩</a> · <a href="docs/">📖 开发文档</a> · <a href="#">💬 社区</a>
</p>

---

## ✨ 功能特性

本项目为新浪微博小游戏「你画我猜」的社区复刻版，以下为原版功能对标情况：

| 分类     | 原版功能           | 实现状态      | 与原版差异                                       |
| -------- | ------------------ | ------------- | ------------------------------------------------ |
| **系统** | 星座区服           | 🔨 开发中     | —                                                |
|          | Hi私信             | 🔨 开发中     | —                                                |
|          | 好友               | 🔨 开发中     | —                                                |
|          | 背包               | 🔨 开发中     | —                                                |
|          | 排行榜             | 🔨 开发中     | —                                                |
|          | 资料卡             | ✅ 已实现     | 会显示玩家认证说明                               |
|          | 截屏分享           | ⚠️ 已部分实现 | 仅支持保存为 PNG 图片到本地，暂无在线分享功能    |
|          | 词库               | ✅ 已实现     | 支持玩家创建自定义词库                           |
|          | 聊天表情           | ✅ 已实现     | 因历史资料丢失，使用 QQ 小黄脸表情替代           |
|          | 换词卡/加时卡      | 🔨 开发中     | —                                                |
| **大厅** | 房间列表           | ✅ 已实现     | —                                                |
|          | 大厅聊天           | ✅ 已实现     | —                                                |
|          | 喇叭               | ❌ 暂无计划   | —                                                |
| **房间** | 创建房间           | ✅ 已实现     | 允许更详细的房间设置（可自定义词库，计分规则等） |
|          | 密码               | ✅ 已实现     | 允许设置复杂字符密码                             |
|          | 邀请空闲玩家       | ✅ 已实现     | —                                                |
|          | 广播               | ✅ 已实现     | —                                                |
|          | 头像框             | ✅ 已实现     | —                                                |
|          | 旁观               | ⚠️ 已部分实现 | 可自定义旁观人数上限                             |
| **画板** | 基础画板           | ✅ 已实现     | —                                                |
|          | 撤销/重做/一键清除 | ✅ 已实现     | —                                                |
|          | 笔触               | ⚠️ 已部分实现 | 压感、真丝等原版高级笔触尚未实现                 |
|          | 画笔皮肤           | 🔨 开发中     | —                                                |
|          | 互动道具           | ⚠️ 已部分实现 | 鸡蛋道具尚未完成                                 |

> **状态说明：** ✅ 已实现 · 🔨 开发中 · ⚠️ 已部分实现 · ❌ 暂无计划

## 📸 游戏截图

<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/7859d5f6-f455-4136-8a10-2ccd53f832e3" alt="截图 1" /></td>
    <td><img src="https://github.com/user-attachments/assets/c5701f5c-4b8c-439e-b89d-d80716f6c5c1" alt="截图 2" /></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/69226827-598d-4261-b99e-0e75e1d2e62d" alt="截图 3" /></td>
    <td><img src="https://github.com/user-attachments/assets/8566c3ef-8804-4845-a648-8931dbf55f39" alt="截图 4" /></td>
  </tr>
  <tr>
    <td colspan="2" align="center"><img src="https://github.com/user-attachments/assets/db78508e-0159-45ad-8825-779d90f3f0fc" alt="截图 5" /></td>
  </tr>
</table>

## 🛠️ 技术栈

| 层级         | 技术                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| **框架**     | [Nuxt 4](https://nuxt.com) · [Vue 3](https://vuejs.org)                                 |
| **语言**     | [TypeScript](https://www.typescriptlang.org)                                            |
| **状态管理** | [Pinia](https://pinia.vuejs.org)                                                        |
| **画布**     | [Fabric.js](http://fabricjs.com)                                                        |
| **实时通信** | WebSocket (Nitro 原生支持)                                                              |
| **样式**     | [Nuxt UI](https://ui.nuxt.com) · Tailwind CSS                                           |
| **国际化**   | [@nuxtjs/i18n](https://i18n.nuxtjs.org)                                                 |
| **存储**     | [db0](https://github.com/unjs/db0) · [unstorage](https://unstorage.io) · better-sqlite3 |
| **数据验证** | [Zod](https://zod.dev)                                                                  |
| **音效**     | [Howler.js](https://howlerjs.com)                                                       |
| **截屏**     | [@zumer/snapdom](https://github.com/nice-winter/nihuawocai)                             |
| **包管理**   | [pnpm](https://pnpm.io)                                                                 |
| **容器化**   | Docker · Docker Compose                                                                 |
| **测试**     | [Vitest](https://vitest.dev) · [Playwright](https://playwright.dev)                     |
| **代码规范** | ESLint · Prettier · Husky + lint-staged                                                 |

## 📁 项目结构

```
nihuawocai/
├── app/                  # 前端应用
│   ├── animations/       # 动画
│   ├── assets/           # 静态资源（图标、音效、字体、样式）
│   ├── components/       # Vue 组件
│   ├── composables/      # 组合式函数
│   ├── layouts/          # 布局组件
│   ├── middleware/       # 中间件
│   ├── pages/            # 页面路由
│   ├── stores/           # Pinia 状态管理
│   └── workers/          # Web Workers
├── server/               # 后端服务 (Nitro)
│   ├── api/              # API 接口
│   ├── middleware/       # 中间件
│   ├── plugins/          # 插件
│   ├── routes/           # 路由
│   ├── services/         # 业务服务层
│   ├── utils/            # 工具函数
│   └── ws/               # WebSocket 处理
├── shared/               # 前后端共享
│   ├── types/            # 共享类型
│   └── utils/            # 共享工具函数
├── docs/                 # 项目文档
├── i18n/                 # 国际化资源
│   └── locales/          # 语言包
├── public/               # 静态资源
├── test/                 # 测试
└── tools/                # 工具脚本
```

## 🚀 快速开始

### 环境要求

- **Node.js** >= 24
- **pnpm** >= 11

### 本地开发

```bash
# 克隆项目
git clone https://github.com/nice-winter/nihuawocai.git
cd nihuawocai

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 `http://localhost:3000` 即可。

> **开发模式说明：** 为便于调试，开发环境下的存储层会使用 `unstorage` 的文件系统驱动（数据保存在 `.data/` 目录），生产环境则使用 SQLite。

### Docker 部署

```bash
# 构建并启动
docker compose up -d
```

## 📖 开发文档

- **[Shared 类型结构](docs/shared-types.md)** — 前后端共享的 TypeScript 类型定义
- **[服务端架构](docs/server-architecture.md)** — 服务端技术架构与设计说明

## 💬 作者的碎碎念

> 本项目基于我的个人记忆、昔日游戏好友的回忆口述，以及互联网留存的相关游戏截图进行尽可能准确的复刻。
>
> 在这个游戏中，我结识了许多珍贵的朋友，它陪伴我走过了整个青春时期。然而，游戏早已停服多年，只留下难以释怀的遗憾。
>
> 十年间，世事更迭，生活改变了许多，但我始终无法将它从记忆中放下。于是，我萌生了将这款游戏重新复刻出来的想法……
>
> _——谨以此作，献给那段再也无法回头的青春，以及曾经在其中相遇的我们。_

## 📄 License

[MIT](LICENSE)

---

> **免责声明：** 本项目为非盈利社区性项目，无意侵犯其版权，所有权利均归其各自所有者所有。
