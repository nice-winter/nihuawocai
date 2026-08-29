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

## 辅助泛型（ws.ts）

| 类型                | 用途                              |
| ------------------- | --------------------------------- |
| `ServerMessage<T>`  | 已知事件名 → 完整消息结构         |
| `ServerEvent`       | 联合类型，switch/case 自动窄化    |
| `ClientMessage<T>`  | 已知消息名 → 完整发送结构         |
| `ClientResponse<T>` | 已知请求名 → 带 successful 的响应 |

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
