# Shared 类型结构

`@/shared` 是前后端共享代码的根目录，核心是 WebSocket 事件协议的类型契约。

## 目录结构

```
shared/
├── types/
│   ├── protocol.ts     ← 🌟 唯一类型契约：三个事件映射表
│   ├── ws.ts           ← 辅助泛型（ServerEvent/ClientResponse 等）
│   ├── game.ts         ← 游戏状态机（GamePhase/RoundPhase/道具/计分）
│   ├── player.ts       ← Player = UserData 别名，PlayerState
│   ├── room.ts         ← RoomInfo（列表）/ Room（完整）
│   ├── user.ts         ← 第三方用户（GitHub/Steam/X）
│   ├── userData.ts     ← 用户数据结构（DB 存储）
│   ├── appConfig.ts    ← 应用配置类型
│   ├── level.ts        ← 等级表 / 用户等级信息
│   ├── gender.ts       ← 性别选项
│   └── auth.d.ts       ← #auth-utils 模块声明
├── utils/
│   ├── crypto.ts       ← CBOR 二进制编解码
│   ├── levelHelper.ts  ← 等级计算工具类
│   ├── defu.ts         ← 对象深合并（数值求和）
│   └── index.ts        ← shortHash 生成
├── defaultAppConfig.ts ← 默认配置实例
└── defaultEmojis.ts    ← 默认表情列表
```

## WebSocket 事件协议（protocol.ts）

三个映射表：

- **ServerEventMap** — 服务端→客户端推送，命名 `模块:event:动作`
- **ClientEventMap** — 客户端→服务端请求，命名 `模块:动作`
- **ClientResponseMap** — 请求→响应的返回类型映射

数据约定：游戏事件带 `payload` 字段，房间/玩家事件字段平铺。

### 字段语义约定（全协议强制）

1. **作用域房间** —— `room:*` 事件 envelope 必带 `roomId: string`（身份键，nanoid 不可复用）与 `roomNumber: number`（用户句柄，0-999 会回收复用，仅供 UI 展示与「按号加入」入口）。**身份比较只允许用 `roomId`，禁止用 `roomNumber`。**
2. **人的发起者/目标** —— Player 对象用 `sender` / `target`；id 字符串用 `senderId` / `targetId`（游戏内猜中者用 `guesser` / `guesserId`）。
3. **全协议禁用 `from` / `to` 字段名**（历史遗留的一词多义已清除）。

### 传输层信封（ws.ts）

| 字段         | 说明                                               |
| ------------ | -------------------------------------------------- |
| `type`       | 事件/消息名                                        |
| `_scope`     | 投递范围：`'player' \| 'all' \| 'room' \| 'lobby'` |
| `_reply`     | 是否为请求-响应的回包                              |
| `_rid`       | 请求 ID，用于匹配回包                              |
| `_t`         | 服务端时间戳（`pong` 不带）                        |
| `successful` | 请求是否成功（仅回包）                             |

## 辅助泛型（ws.ts）

| 类型                | 用途                              |
| ------------------- | --------------------------------- |
| `ServerMessage<T>`  | 已知事件名 → 完整消息结构         |
| `ServerEvent`       | 联合类型，switch/case 自动窄化    |
| `ClientMessage<T>`  | 已知消息名 → 完整发送结构         |
| `ClientResponse<T>` | 已知请求名 → 带 successful 的响应 |
| `WsScope`           | `_scope` 投递范围字面量联合       |

## 游戏状态机（game.ts）

- **GamePhase**: `game_start` → `game_round` → `game_settlement` → `game_end`
- **RoundPhase**: `round_prepare` → `drawing` → `interaction` → `round_end`
- **ItemType**: `flower` | `egg` | `slipper`

## 类型继承链

```
UserData → Player (别名) → LoggedInPlayer (Player & PlayerState)
                              ↓
                    RoomInfo.players / Room.players
```

## 使用方式

- **后端 handler**: 返回 `ServerEventMap[key]` 或 `ClientResponseMap[key]`
- **前端 store**: `msg as ServerEvent` 后 switch/case 自动窄化
- **前端请求**: `await send({ type }) as ClientResponse<'xxx'>` 取响应

---

## Admin 后台相关类型

> 以下类型定义在 `shared/utils/admin.ts` 中，前后端共享。

### `AdminUser`

管理员用户数据

```typescript
interface AdminUser {
  id: string // 用户 ID
  nickname: string // 昵称
  avatar: string // 头像 URL
  provider: string // 登录来源（github/steam/x）
  role: string // 角色：'super_admin' | 'admin'
  createdAt: string // 创建时间
  lastLoginAt: string // 最后登录时间
}
```

### `AdminConfig`

后台全局配置（`AppConfig` 的子集）

```typescript
interface AdminConfig {
  loginMethods: Record<string, boolean> // 登录方式开关
  guestMode: boolean // 游客模式开关
  siteName: string // 站点名称
  siteDescription: string // 站点描述
  announcement: {
    content: string // 公告内容（Markdown）
    enabled: boolean // 是否启用公告
  }
  drawing: {
    maxLayers: number // 最大图层数
    maxUndoSteps: number // 最大撤销步数
    enablePressure: boolean // 是否启用手写笔压感
    enableEraser: boolean // 是否启用橡皮擦
  }
  game: {
    maxRooms: number // 房间上限
    maxPlayersPerRoom: number // 每房间最大人数
    defaultRoundTime: number // 默认回合时长（秒）
    defaultRounds: number // 默认轮次
    defaultMaxTurns: number // 默认最大回合数
  }
  security: {
    enableCaptcha: boolean // 是否启用验证码
    enableIPBlacklist: boolean // 是否启用 IP 黑名单
    maxLoginAttempts: number // 最大登录尝试次数
  }
  maintenance: {
    enabled: boolean // 维护模式开关
    message: string // 维护提示语
  }
  oauth: Record<string, { enabled: boolean; clientId?: string }> // OAuth 配置
  admin: {
    superAdminId?: string // 超级管理员用户 ID
    admins: string[] // 普通管理员用户 ID 列表
  }
}
```

### `AdminStats`

仪表盘统计数据

```typescript
interface AdminStats {
  onlinePlayers: number // 当前在线玩家数
  activeRooms: number // 活跃房间数
  totalUsers: number // 总用户数
  totalWordLibraries: number // 词库数量
  serverUptime: number // 服务器运行时间（秒）
}
```
