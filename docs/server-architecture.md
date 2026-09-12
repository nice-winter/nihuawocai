# 服务端架构与事件系统

## 项目概述

"你画我猜"(NIHUAWOCAI) 是一个基于 Nuxt 4 的实时多人在线画画猜词游戏。服务端使用 Nitro 引擎，核心通信基于 WebSocket。

## 目录结构

```
server/
├── api/              # REST API 端点
│   ├── app-config.get.ts         # 获取应用配置
│   ├── app-config.post.ts        # 更新应用配置（需登录）
│   └── admin/                    # 后台管理 API（需管理员权限）
│       ├── init.post.ts          # 首次超级管理员初始化（需 init secret）
│       ├── auth-check.get.ts     # 鉴权检查（返回 adminUserId）
│       ├── config.get.ts         # 获取完整配置
│       ├── config.put.ts         # 更新配置
│       ├── debug.get.ts          # 调试信息（限 super_admin）
│       ├── stats.get.ts          # 仪表盘统计数据
│       ├── admins/
│       │   ├── index.get.ts      # 获取管理员列表
│       │   ├── index.post.ts     # 添加管理员
│       │   └── [id].delete.ts    # 移除管理员
│       ├── users/
│       │   ├── index.get.ts      # 用户列表（分页 + 搜索）
│       │   └── [id].put.ts       # 更新用户信息/禁用
│       └── words/
│           ├── index.get.ts      # 词库列表
│           ├── index.post.ts     # 创建词库
│           ├── [id].get.ts       # 词库详情
│           ├── [id].put.ts       # 更新词库
│           └── [id].delete.ts    # 删除词库
├── middleware/       # 服务端中间件
│   └── admin-auth.ts             # 管理员权限校验（JWT token → adminUserId）
├── plugins/          # Nitro 启动插件
│   ├── storage.ts    # 存储层初始化（SQLite/FS 双驱动）
│   ├── session.ts    # Session KV（TODO 未完成）
│   ├── word.ts       # 初始化默认词库
│   ├── admin-init.ts # 首次启动生成管理员初始化 secret
│   └── zz-banner.ts  # 启动 banner 打印
├── routes/
│   ├── _ws/server.ts       # WebSocket 入口（defineWebSocketHandler）
│   ├── auth/github.get.ts  # GitHub OAuth 登录
│   ├── auth/steam.get.ts   # Steam OAuth 登录
│   ├── auth/x.get.ts       # X(Twitter) OAuth 登录
│   └── user/[id].get|post.ts # 用户资料 CRUD
├── services/         # 业务逻辑层（核心）
│   ├── app-config.ts # 应用全局配置管理
│   ├── chat.ts       # 聊天服务（发言 + 猜词联动）
│   ├── game.ts       # 游戏核心逻辑（状态机、回合、计分）
│   ├── player.ts     # 在线玩家管理 + 消息广播
│   ├── room.ts       # 房间生命周期管理
│   ├── user.ts       # 用户持久化数据 CRUD
│   └── word.ts       # 词库管理（CRUD + 随机抽词）
├── types/
│   └── ws.d.ts       # crossws PeerContext 扩展类型
├── utils/
│   ├── admin.ts      # 管理员工具函数（JWT 签发/校验、init secret、角色判断）
│   └── banner.ts     # Banner 打印工具
└── ws/               # WebSocket 层
    ├── index.ts      # WS hooks（upgrade/open/message/close/error）+ 心跳
    ├── core/
    │   ├── channel.ts    # Pub/Sub 频道管理（未被主要使用）
    │   ├── connection.ts # 从 peer 解析用户 session
    │   ├── events.ts     # mitt 事件总线（ws:connect/message/disconnect/error）
    │   └── sender.ts     # 发送工具（sendToAll/sendToChannel/sendToUser）
    ├── handlers/     # WS 消息处理器（按领域拆分）
    │   ├── index.ts      # 统一注册所有 handler
    │   ├── room.ts       # 房间操作（创建/加入/离开/坐下/换位/密码/广播/邀请/开始/快速匹配）
    │   ├── game.ts       # 游戏操作（画板交互/放弃/送道具）
    │   ├── player.ts     # 玩家操作（获取资料/大厅玩家列表）
    │   └── chat.ts       # 聊天操作（发言）
    ├── schemas/
    │   └── room.ts       # Zod 验证 schema（room 相关消息）
    └── utils/
        └── index.ts      # WsPeer/WsEvents 类型、safeSend/reply/defineWsHandlers 工具
```

## 核心架构设计

### 1. WebSocket 通信模型

- **协议**: 使用 `crossws` 库，消息通过 CBOR 二进制编码 (`encode`/`decode`)
- **入口**: `server/routes/_ws/server.ts` → `server/ws/index.ts` 的 `hooks`
- **心跳**: 30 秒 Ping/Pong，超时断开
- **消息路由**: `wsEventBus`（mitt）→ `handlers/index.ts` 按 `msg.type` 分发到对应 handler
- **消息格式**: `WebsocketMessage<T>` 包含 `type`、`payload`、`rid`（请求 ID 用于 reply）
- **回复机制**: `reply(peer, rid)` 返回一个函数，自动附加 `_reply: true` 和 `_rid`

### 2. 事件驱动架构

后端采用三层 mitt 事件总线，形成**单向依赖链**——上游不知道下游的存在，下游通过监听上游事件来响应。

```
WebSocket 连接 (crossws hooks)
       │
       ▼  wsEventBus.emit('ws:connect/message/disconnect/error')
┌──────────────────────────┐
│  Layer 1: wsEventBus     │  ws/core/events.ts
│  传输层：连接生命周期      │
└───────────┬──────────────┘
            │ player.ts 监听 connect/disconnect，管理在线玩家
            ▼  playerEventBus.emit('player:connect/beforeDisconnect/disconnected')
┌──────────────────────────┐
│  Layer 2: playerEventBus │  services/player.ts
│  玩家层：上下线状态        │
└───────────┬──────────────┘
            │ room.ts 监听 beforeDisconnect，踢出房间
            ▼  roomEventBus.emit('room:event:create/destroy/player_join/...')
┌──────────────────────────┐
│  Layer 3: roomEventBus   │  services/room.ts
│  房间层：房间生命周期      │
└───────────┬──────────────┘
            │ game.ts 监听 game_start/player_leave/onlooker_join
            ▼
┌──────────────────────────┐
│  game.ts (纯消费者)       │  services/game.ts
│  游戏层：状态机驱动        │
└──────────────────────────┘
```

**各层事件清单：**

| 层级 | 事件总线         | 事件                                                                                                                                                                                                                       | 发射方      | 消费方                       |
| ---- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------------------------- |
| L1   | `wsEventBus`     | `ws:connect` `ws:message` `ws:disconnect` `ws:error`                                                                                                                                                                       | ws/index.ts | handlers/index.ts, player.ts |
| L2   | `playerEventBus` | `player:connect` `player:beforeDisconnect` `player:disconnected`                                                                                                                                                           | player.ts   | room.ts                      |
| L3   | `roomEventBus`   | `room:event:create` `room:event:destroy` `room:event:player_join` `room:event:player_leave` `room:event:onlooker_join` `room:event:onlooker_sit` `room:event:onlooker_leave` `room:event:game_start` `room:event:game_end` | room.ts     | game.ts                      |

**设计原则：game.ts 是纯下游消费者**——添加游戏模块时只需在 game.ts 里 `roomEventBus.on(...)` 即可，无需修改 room.ts 任何代码。

### 3. 消息广播分层

`player.ts` 提供四种广播范围：

- `sendToPlayer(msg, id)` — 发给特定玩家（`_scope: 'player'`）
- `sendToAllPlayer(msg)` — 发给所有在线玩家（`_scope: 'all'`）
- `sendToRoom(msg, roomNumber, excludes?)` — 发给房间内玩家（`_scope: 'room'`）
- `sendToLobby(msg)` — 发给大厅玩家（`_scope: 'lobby'`）

### 4. 游戏状态机

**GamePhase**: `game_start` → `game_round` → `game_settlement` → `game_end`

**RoundPhase**: `round_prepare` → `drawing` → `interaction` → `round_end`

核心流程：

1. 房主调用 `room:game_start` → room 服务设置 `playing=true` → 触发 `room:event:game_start`
2. game 服务监听事件 → `gameStart()` 初始化 GameState → 开始回合循环
3. 每回合：准备倒计时 → 画手收到答案 → 绘画阶段（AFK 检测 + 提示词渐显）→ 猜词/超时进入互动阶段 → 回合结束
4. 所有轮次完成 → 结算阶段（展示积分榜）→ 游戏结束

**计分规则**: 首答(firstBingo)和后续答(bingo)有不同分值，画手和猜题者都得分。

**猜词逻辑**: 通过 `chat:say` 消息触发 → `chat.ts` 调用 `game.ts` 的 `handleGuess()` → 匹配成功则广播 `game:event:guess:bingo`

### 5. 存储层

`storage.ts` 插件初始化时挂载 4 个存储表：`app`、`session`、`word`、`user_data`

- **生产模式**: SQLite（通过 `db0` + `unstorage/drivers/db0`）
- **开发模式**: 文件系统（`unstorage/drivers/fs`，路径 `.data/database/{table}`）

### 6. 用户认证

使用 `nuxt-auth-utils`，支持三种 OAuth 登录：

- GitHub
- Steam
- X (Twitter)

登录成功后创建/更新 `UserData`，session 通过 `setUserSession`/`getUserSession` 管理。

### 7. 词库系统

`word.ts` 提供完整的词库 CRUD：

- 支持多词库（每个词库有 id、name、描述、编辑者列表）
- 默认词库 `default-official` 在启动时自动初始化
- 抽词策略：先随机选库，再随机选词
- 每个词包含 `word`（答案）和 `prompts[]`（提示词数组，在绘画阶段渐显）

### 8. Admin 后台管理系统

提供完整的后台管理能力，基于 JWT 无状态鉴权。

**权限模型**：

- `super_admin`（超级管理员）：拥有所有权限，可管理其他管理员
- `admin`（普通管理员）：可管理用户、词库、配置，不可管理管理员列表

**初始化流程**：

1. 服务端首次启动 → `admin-init.ts` 插件检测 `appConfig.admin.superAdminId` 是否存在
2. 若不存在 → 生成一次性 `init secret`（32 字节 hex，10 分钟有效），打印到控制台
3. 管理员访问 `/admin/init` 页面 → 输入 secret + 调用 `POST /api/admin/init` 完成初始化
4. 初始化后清除 secret，后续不再生成

**鉴权机制**：

- `POST /api/admin/auth` 使用用户 session 签发 JWT token（`nuxt-auth-utils` 的 `signJwt`，8 小时有效）
- 前端每次请求携带 `Authorization: Bearer <token>`
- `admin-auth.ts` 中间件验证 token → 解析 userId → 从存储读取角色 → 注入 `event.context.adminUserId`
- `isAdminUser()` 工具函数判断用户是否为管理员（super_admin 或 admin）
- `requireSuperAdmin()` 在 handler 中做 super_admin 权限校验

**API 端点**：

| 方法   | 路径                    | 说明                 | 权限            |
| ------ | ----------------------- | -------------------- | --------------- |
| POST   | `/api/admin/auth`       | 签发 JWT token       | 已登录用户      |
| GET    | `/api/admin/auth-check` | 检查鉴权状态         | 需 token        |
| POST   | `/api/admin/init`       | 首次超级管理员初始化 | 已登录 + secret |
| GET    | `/api/admin/stats`      | 仪表盘统计           | admin+          |
| GET    | `/api/admin/config`     | 获取完整配置         | admin+          |
| PUT    | `/api/admin/config`     | 更新配置             | admin+          |
| GET    | `/api/admin/debug`      | 调试信息             | super_admin     |
| GET    | `/api/admin/admins`     | 管理员列表           | admin+          |
| POST   | `/api/admin/admins`     | 添加管理员           | super_admin     |
| DELETE | `/api/admin/admins/:id` | 移除管理员           | super_admin     |
| GET    | `/api/admin/users`      | 用户列表（分页搜索） | admin+          |
| PUT    | `/api/admin/users/:id`  | 更新用户信息/禁用    | admin+          |
| GET    | `/api/admin/words`      | 词库列表             | admin+          |
| POST   | `/api/admin/words`      | 创建词库             | admin+          |
| GET    | `/api/admin/words/:id`  | 词库详情             | admin+          |
| PUT    | `/api/admin/words/:id`  | 更新词库             | admin+          |
| DELETE | `/api/admin/words/:id`  | 删除词库             | admin+          |

**前端页面**（`app/pages/admin/`）：

| 页面         | 说明             |
| ------------ | ---------------- |
| `init.vue`   | 首次管理员初始化 |
| `index.vue`  | 仪表盘主页       |
| `config.vue` | 系统配置管理     |
| `users.vue`  | 用户管理         |
| `words.vue`  | 词库管理         |
| `admins.vue` | 管理员管理       |

## WS 消息类型汇总

### 客户端 → 服务端（Handler）

- `room:list_pull` / `room:create` / `room:join` / `room:leave` / `room:sit` / `room:seat_switch` / `room:password_change` / `room:broadcast` / `room:invite` / `room:game_start` / `room:quick_match`
- `game:drawing:give_up` / `game:drawing:sketchpad` / `game:interaction:gift`
- `player:get_profile` / `player:lobby_players_pull`
- `chat:say`

### 服务端 → 客户端（Event）

- `room:event:create` / `room:event:destroy` / `room:event:player_join` / `room:event:player_leave` / `room:event:onlooker_join` / `room:event:onlooker_sit` / `room:event:onlooker_leave` / `room:event:stage_update` / `room:event:seat_switch` / `room:event:locked_state_change` / `room:event:password_change` / `room:event:broadcast` / `room:event:invite` / `room:event:info` / `room:event:owner_change`
- `game:event:start` / `game:event:end` / `game:event:settlement` / `game:event:state` / `game:event:round:prepare` / `game:event:drawing:start` / `game:event:interaction:start` / `game:event:round:end` / `game:event:word` / `game:event:prompt` / `game:event:timer:update` / `game:event:sketchpad` / `game:event:guess:bingo` / `game:event:interaction:gift` / `game:event:notice`
- `player:event:logged_in` / `player:event:state_update` / `player:event:lobby_players_add` / `player:event:lobby_players_remove`
- `chat:event:say`

---

## 前端事件架构

前端同样采用双层事件总线，与后端的三层形成镜像关系。

### 1. 双层 EventBus

```
WebSocket Worker (二进制 CBOR 流)
       │
       ▼  Worker postMessage → store 接收
┌──────────────────────────────────────────────────────────────┐
│  Layer 1: wsEventBus  (app/stores/ws.ts, mitt)               │
│  传输层事件: ws:connected / ws:message / ws:error /           │
│             ws:disconnected                                  │
│  职责: 连接管理、请求/响应 Promise 映射、日志                   │
└────────────────────────┬─────────────────────────────────────┘
                         │ 各 domain store 监听 ws:message
                         │ 按 type 前缀过滤 + 数据富化
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  Layer 2: eventBus  (app/composables/eventBus.ts, mitt)      │
│  业务/UI 层事件: game:event:* / chat:event:say /              │
│                 current:room:event:* / sketchpad:* / ui:*    │
│  职责: 一次性 UI 效果（动画、音效、toast、弹窗）                │
└──────────────────────────────────────────────────────────────┘
```

### 2. Store 的双重职责

每个 domain store（game/room/chat）同时承担两个角色：

```ts
// 以 game store 为例
wsEventBus.on('ws:message', (msg) => {
  if (msg.type.startsWith('game:')) {
    // 角色 A：更新 reactive state → Vue 模板自动响应（持续状态）
    state.bingoPlayers = payload.bingo_players
    state.scores = payload.scores

    // 角色 B：emit 到 eventBus → UI 组件监听（一次性效果）
    eventBus.emit('game:event:guess:bingo', { ...payload })
  }
})
```

**区分原则：**

| 类型                                    | 放哪里            | 举例                                                       |
| --------------------------------------- | ----------------- | ---------------------------------------------------------- |
| **持续状态**（模板绑定、computed 依赖） | `reactive state`  | 分数、当前画手、回合数、倒计时                             |
| **一次性 UI 效果**（触发后即忘）        | `eventBus.emit()` | 播放音效、弹 toast、插入系统消息、播放抛物线动画、过场动画 |

代码中标记为 `⚡ UI 广播点 ⚡` 的位置即为 eventBus 触发点。

### 3. Store 数据富化（Enrichment）

后端 WS 消息传输的是 ID（节省带宽），store 转发到 eventBus 时会将其富化为完整对象，让 UI 组件无需关心查找逻辑：

```ts
// 后端发的是 ID
payload: { id: 'abc', drawer: 'xyz', bingo_players: ['abc'] }

// store 转发时富化为 Player 对象
eventBus.emit('game:event:guess:bingo', {
  ...payload,
  player: getPlayerFromCurrentRoom(payload.id)!  // ID → Player
})

eventBus.emit('game:event:interaction:start', {
  ...payload,
  drawerPlayer: getPlayerFromCurrentRoom(state.drawer!)!,
  bingoPlayers: payload.bingo_players
    .map(id => getPlayerFromCurrentRoom(id))
    .filter(Boolean)
})
```

因此前端 eventBus 的类型定义（`app/composables/eventBus.ts`）中，事件 payload 会比 `shared/types/protocol.ts` 中的 ServerEventMap 多出 `drawerPlayer`、`fromPlayer`、`bingoPlayers: Player[]` 等字段。

### 4. UI 组件消费方式

组件通过 `useEventBus` composable 订阅事件，自动绑定生命周期：

```ts
// 自动在 onBeforeMount 订阅、onUnmounted 取消
useEventBus('game:event:guess:bingo', ({ player, score_delta }) => {
  playBingoSound()
  addChatSystemMessage(`${player.nickname} 猜对了！+${score_delta.guesserGain}`)
})

useEventBus('game:event:interaction:gift', ({ fromPlayer, item_type }) => {
  playThrowAnimation(fromPlayer.id, item_type)
})
```

---

## 新增模块接入指南

### 新增后端 Service

1. **确定挂载层级**：该 service 应监听哪一层的事件？
   - 需要感知玩家上下线 → 监听 `playerEventBus`
   - 需要感知房间生命周期 → 监听 `roomEventBus`
   - 只处理 WS 消息 → 在 `ws/handlers/` 添加 handler

2. **事件监听**（以监听房间事件为例）：

```ts
// server/services/my-service.ts
import { roomEventBus } from './room'

roomEventBus.on('room:event:game_start', ({ roomNumber, room }) => {
  // 响应游戏开始
})
```

3. **广播消息**：通过 player.ts 的四个 sender 函数，不要自行管理连接

```ts
import { sendToRoom, sendToPlayer, sendToAllPlayer, sendToLobby } from './player'
```

### 新增前端 Store

1. **在 ws.ts 注册 ws:message 监听**，按 `type` 前缀过滤：

```ts
// app/stores/my-store.ts
const { wsEventBus, send } = useWsStore()

wsEventBus.on('ws:message', (msg) => {
  if (!msg.type.startsWith('my_module:')) return

  // 1. 更新 reactive state（持续状态）
  state.xxx = msg.xxx

  // 2. 如有一次性 UI 效果，emit 到 eventBus
  eventBus.emit('my_module:event:xxx', { ...msg, enrichedData })
})
```

2. **如需新增 eventBus 事件类型**，在 `app/composables/eventBus.ts` 的 `Events` 类型中添加条目

3. **UI 组件使用 `useEventBus` 订阅**，不要直接操作 wsEventBus

### 新增 WS 消息类型

1. 在 `shared/types/protocol.ts` 对应的 Map 中添加条目（ServerEventMap / ClientEventMap / ClientResponseMap）
2. 后端：在 `ws/handlers/` 添加 handler（客户端→服务端），或在 service 中 `sendToRoom`/`sendToPlayer`（服务端→客户端）
3. 前端：在对应 store 中处理 ws:message，在 eventBus.ts 的 Events 中声明 UI 事件类型
