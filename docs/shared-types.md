# Shared 类型结构

`@/shared` 是前后端共享代码的根目录，核心是 WebSocket 事件协议的类型契约。

## 目录结构

```
shared/
├── types/
│   ├── protocol.ts     ← 🌟 唯一类型契约：三个事件映射表
│   ├── ws.ts           ← 辅助泛型（ServerEvent/ClientResponse 等）
│   ├── game.ts         ← 游戏状态机（GamePhase/TurnPhase/道具/计分）
│   ├── player.ts       ← Player = UserData 别名，PlayerState
│   ├── room.ts         ← RoomSummary（列表）/ Room（完整）
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

数据约定：游戏事件带 `payload` 字段，房间/玩家事件字段平铺。事件名用 snake 段（如 `seat_open_change`），字段名用 camelCase。

### 字段语义约定（全协议强制）

1. **作用域房间** —— `room:*` 事件 envelope 必带 `roomId: string`（身份键，nanoid 不可复用）与 `roomNumber: number`（用户句柄，0-999 会回收复用，仅供 UI 展示与「按号加入」入口）。**身份比较只允许用 `roomId`，禁止用 `roomNumber`。**
2. **人的发起者/目标** —— Player 对象用 `sender` / `target`；id 字符串用 `senderId` / `targetId`（游戏内猜中者用 `guesser` / `guesserId`，作画者用 `drawerId`）。
3. **全协议禁用 `from` / `to` 字段名**（历史遗留的一词多义已清除）。
4. **ID 字段带 `Id` 后缀** —— `drawerId` / `guesserId` / `bingoPlayerIds`；数组装 ID 就叫 `*Ids`，装对象才用复数名词。
5. **命名风格** —— 内部类型字段一律 camelCase；`GitHubUser` / `SteamUser` / `XUser` 是外部 API 镜像，保留上游 snake（勿把 `avatar_url` 之类的外部字段误改成 camel）。
6. **时间字段** —— 时间戳字段名用 `*At`（`expiresAt` / `createdAt`），单位一律**毫秒**（与 `Date.now()` 对齐）；时长/剩余秒数用 `*Seconds`，且按语义区分 `durationSeconds`（阶段总长）、`remainingSeconds`（剩余）、`displaySeconds`（展示时长）。
7. **词表统一** —— `turn`=单人作画回合（配置层 `cycle`=全员一轮）；`hint`=游戏提示词（勿用 prompt）；`item`=互动道具（flower/egg/slipper，勿用 gift）；`presence`=玩家所在位置（勿用 `type`，与消息信封 `type` 撞名）。
8. **布尔字段** —— 用 `is*` / `has*` 前缀（`isPlaying` / `hasPassword` / `isOpen`），不用裸形容词（`playing` / `locked` / `open`）。

### 传输层信封（ws.ts）

| 字段         | 说明                                               |
| ------------ | -------------------------------------------------- |
| `type`       | 事件/消息名                                        |
| `_scope`     | 投递范围：`'player' \| 'all' \| 'room' \| 'lobby'` |
| `_reply`     | 是否为请求-响应的回包                              |
| `_requestId` | 请求 ID，用于匹配回包（上行同名 `requestId`）      |
| `_timestamp` | 服务端时间戳（`pong` 不带）                        |
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

- **GamePhase**: `game_start` → `game_turn` → `game_settlement` → `game_end`
- **TurnPhase**: `turn_prepare` → `drawing` → `interaction` → `turn_end`
- **ItemType**: `flower` | `egg` | `slipper`

## 类型继承链

```
UserData → Player (别名) → LoggedInPlayer (Player & PlayerState)
                              ↓
                    RoomSummary.players / Room.players
```

## 使用方式

- **后端 handler**: 返回 `ServerEventMap[key]` 或 `ClientResponseMap[key]`
- **前端 store**: `msg as ServerEvent` 后 switch/case 自动窄化
- **前端请求**: `await send({ type }) as ClientResponse<'xxx'>` 取响应

---

## Admin 后台相关类型

> Admin 能力基于 `AppConfig.admin`（见 `shared/types/appConfig.ts`：`superAdminId` / `adminIds` / `logLevel`）与 `server/utils/admin.ts`（JWT 鉴权、init secret、角色判断）。后台管理界面消费的即是这些类型，无独立的 Admin 类型文件。
