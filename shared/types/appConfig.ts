import type { LevelInfo } from './level'
import type { Gender } from './gender'

export interface AppConfig {
  /** 后台管理配置 */
  admin: {
    /** 超级管理员用户 ID（只有一个，拥有所有权限） */
    superAdminId: string
    /** 管理员用户 ID 列表（权限一致，可被超级管理员管理） */
    adminIds: string[]
    /** 日志等级覆盖（-1=silent, 0=error, 1=warn, 2=info, 3=debug, 4=verbose）
     *  留空则使用 CONSOLA_LEVEL 环境变量或默认值（dev=3, prod=2）
     */
    logLevel?: number | ''
  }
  /** 应用名称 */
  name: string
  /** 公告列表 */
  announcements: string[]
  /** 性别选项列表 */
  genders: Gender[]
  game: {
    /** 等级信息列表 */
    levels: LevelInfo[]
    /** 大厅相关设置 */
    lobby: {
      /** 每分钟聊天消息限制条数，0 为不限制 @default 0 */
      maxChatPerMinute: number
      /** 时间相关设置 */
      time: {
        /** 聊天消息发送间隔时间（秒） @default 5 */
        chatIntervalSeconds: number
      }
    }
    /** 房间相关设置 */
    room: {
      /** 房间横幅广告列表 */
      banners: {
        /** 横幅图片地址 */
        imgUrl: string
        /** 横幅描述文本 */
        description: string
        /** 横幅跳转链接 */
        linkUrl: string
      }[]
      /** 房间功能开关 */
      features: {
        /** 是否启用踢人功能 @default true */
        kick: boolean
        /** 是否启用广播功能（在大厅/未开局房间内发送房间邀请广播） @default true */
        lobbyBroadcast: boolean
        /** 邀请功能设置 */
        invite: {
          /** 是否允许邀请空闲玩家 @default true */
          canInviteIdle: boolean
          /** 是否允许邀请同城玩家 @default false */
          canInviteSameCity: boolean
        }
      }
      /** 每轮最大广播次数，0 为不限制 @default 0 */
      maxLobbyBroadcastCount: number
      /** 每分钟聊天消息限制条数，0 为不限制 @default 0 */
      maxChatPerMinute: number
      /** 房间密码最大长度 @default 4 */
      passwordMaxLength: number
      /** 最大旁观人数（建房时未指定则用此默认值） @default 5 */
      maxOnlookers: number
      /** 时间相关设置 */
      time: {
        /** 广播消息发送间隔时间（秒） @default 300 */
        lobbyBroadcastIntervalSeconds: number
        /** 聊天消息发送间隔时间（秒） @default 1 */
        chatIntervalSeconds: number
        /** 游戏开始前的准备等待时间（秒） @default 30 */
        preStartWaitSeconds: number
        /** 最大准备等待时间（秒） @default 60 */
        maxPreStartWaitSeconds: number
        /** 邀请有效时间（秒） @default 15 */
        inviteValidSeconds: number
        /** 无动作累计达到该秒数即判定为 AFK（秒） @default 300 */
        afkTimeoutSeconds: number
      }
      /** 轮相关设置 */
      cycle: {
        /** 最大轮数，2 则为每人画 2 次 @default 2 */
        count: number
        /** 时间相关设置 */
        time: {
          /** 开始绘画前的等待时间 @default 5 */
          turnStartWaitSeconds: number
          /** 绘画开始后，N 秒内仍未有任何动作，则判定为绘画超时，直接结束当前回合 @default 20 */
          turnDrawingTimeoutSeconds: number
          /** 绘画时间 @default 60 */
          turnDrawingDurationSeconds: number
          /** 最大绘画时间，预留给加时卡道具等使用 @default 120 */
          maxTurnDrawingDurationSeconds: number
          /** 绘画过程中弹出提示词的时间节点（相对于起始绘画时间，单位秒） @default [20,40] */
          hintOffsetSeconds: number[]
          /** 绘画时，若有人猜对，直接将剩余时间缩短为至此值 @default 20 */
          bingoShortenToSeconds: number
          /** 小回合结束时的互动的等待时间 @default 5 */
          turnEndWaitSeconds: number
          /** 最终结算面板的显示时间 @default 8 */
          settlementDisplaySeconds: number
        }
        /** 回合计分规则 */
        scoreRules: {
          /** 画手计分相关规则 */
          drawer: {
            /** 首次被猜对给画手加多少分 @default 3 */
            firstBingo: number
            /** 在首次被猜对后，剩余的玩家每猜对一个给画手加多少分 @default 2 */
            bingo: number
          }
          /** 猜题者计分相关规则 */
          guesser: {
            /** 第一个猜对的玩家加多少分 @default 2 */
            firstBingo: number
            /** 其余猜对的玩家加多少分 @default 1 */
            bingo: number
          }
          /** 最终结算积分时，是否包含中途退出的玩家 @default false */
          includeLeaversInSettlement: boolean
        }
      }
    }
  }
}
