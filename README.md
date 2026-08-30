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
  <img src="https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/pnpm-11-F69220?logo=pnpm&logoColor=white" alt="pnpm" />
  <img src="https://img.shields.io/badge/Fabric.js-7-CC2936?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTEyIDJMMiA3bDEwIDUgMTAtNUwyIDd6Ii8+PC9zdmc+" alt="Fabric.js" />
  <a href="LICENSE"><img src="https://img.shields.io/github/license/nice-winter/nihuawocai" alt="License" /></a>
</p>

<p align="center">
  <a href="#">🎮 在线游玩</a> · <a href="docs/">📖 开发文档</a> · <a href="#">💬 社区</a>
</p>

---

## ✨ 功能特性

- 🎨 **实时对战** — 多人在线同房竞技，一人作画众人猜
- 🖌️ **画板工具** — 丰富的画笔、颜色、橡皮擦等绘图工具
- 🏠 **房间系统** — 创建/加入房间，支持自定义游戏规则
- 💬 **实时聊天** — WebSocket 驱动的即时消息，猜词互动零延迟
- 🌍 **国际化** — 内置 i18n 支持，轻松切换多语言
- 📱 **响应式** — 适配桌面端与移动端

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

| 层级         | 技术                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| **框架**     | [Nuxt 4](https://nuxt.com) · [Vue 3](https://vuejs.org)                  |
| **语言**     | [TypeScript](https://www.typescriptlang.org)                             |
| **状态管理** | [Pinia](https://pinia.vuejs.org)                                         |
| **画布**     | [Fabric.js](http://fabricjs.com)                                         |
| **实时通信** | WebSocket (Nitro 原生支持)                                               |
| **样式**     | [Nuxt UI](https://ui.nuxt.com) · [Tailwind CSS](https://tailwindcss.com) |
| **国际化**   | [@nuxtjs/i18n](https://i18n.nuxtjs.org)                                  |
| **数据库**   | [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)             |
| **包管理**   | [pnpm](https://pnpm.io)                                                  |
| **容器化**   | Docker · Docker Compose                                                  |
| **代码规范** | ESLint · Prettier · Husky + lint-staged                                  |

## 📁 项目结构

```
nihuawocai/
├── app/                  # 前端应用
│   ├── components/       # Vue 组件
│   ├── composables/      # 组合式函数
│   ├── layouts/          # 布局组件
│   ├── pages/            # 页面路由
│   ├── stores/           # Pinia 状态管理
│   └── workers/          # Web Workers
├── server/               # 后端服务 (Nitro)
│   ├── api/              # API 接口
│   ├── ws/               # WebSocket 处理
│   ├── services/         # 业务服务层
│   └── utils/            # 工具函数
├── shared/               # 前后端共享类型
├── docs/                 # 项目文档
├── i18n/                 # 国际化资源
└── public/               # 静态资源
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

### Docker 部署

```bash
# 构建并启动
docker compose up -d
```

## 📖 开发文档

- **[Shared 类型结构](docs/shared-types.md)** — 前后端共享的 TypeScript 类型定义
- **[服务端架构](docs/server-architecture.md)** — 服务端技术架构与设计说明

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feat/my-feature`
3. 提交改动：`git commit -m 'feat(scope): 添加某个功能'`
4. 推送分支：`git push origin feat/my-feature`
5. 提交 Pull Request

> 提交前请确保通过 `pnpm lint` 检查。

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
