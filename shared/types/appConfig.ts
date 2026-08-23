import type { LevelInfo } from '~~/shared/types/level'
import type { Gender } from '~~/shared/types/gender'

export interface AppConfig {
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
      perMinuteChatCount: number
      /** 时间相关设置 */
      time: {
        /** 聊天消息发送间隔时间（秒） @default 5 */
        chatIntervalTimeSecond: number
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
        url: string
      }[]
      /** 房间功能开关 */
      feature: {
        /** 是否启用踢人功能 @default true */
        kick: boolean
        /** 是否启用广播功能 @default true */
        broadcast: boolean
        /** 邀请功能设置 */
        invite: {
          /** 是否允许邀请空闲玩家 @default true */
          idle: boolean
          /** 是否允许邀请同城玩家 @default false */
          sameCity: boolean
        }
      }
      /** 每轮最大广播次数，0 为不限制 @default 0 */
      maxBroadcastCount: number
      /** 每分钟聊天消息限制条数，0 为不限制 @default 0 */
      perMinuteChatCount: number
      /** 房间密码最大长度 @default 4 */
      passwordMaxLengh: number
      /** 时间相关设置 */
      time: {
        /** 广播消息发送间隔时间（秒） @default 300 */
        broadcastIntervalTimeSecond: number
        /** 聊天消息发送间隔时间（秒） @default 1 */
        chatIntervalTimeSecond: number
        /** 游戏开始前的准备等待时间（秒） @default 30 */
        preStartTimeSecond: number
        /** 最大准备等待时间（秒） @default 60 */
        maxPreStartTimeSecond: number
        /** 邀请有效时间（秒） @default 15 */
        invitationValidTimeSecond: number
        /** 挂机判定超时时间（秒） @default 300 */
        afkTimeSecond: number
      }
      /** 轮相关设置 */
      cycle: {
        /** 最大轮数，2 则为每人画 2 次 @default 2 */
        count: number
        /** 时间相关设置 */
        time: {
          /** 开始绘画前的等待时间 @default 5 */
          roundStartWaitTimeSecond: number
          /** 绘画开始后，N 秒内仍未有任何动作，则判定为绘画超时，直接结束当前回合 @default 20 */
          roundDrawingTimeoutSecond: number
          /** 绘画时间 @default 60 */
          roundDrawingTimeSecond: number
          /** 最大绘画时间，预留给加时卡道具等使用 @default 120 */
          maxRoundDrawingTimeSecond: number
          /** 绘画过程中弹出提示词的时间节点（相对于起始绘画时间） @default [20,40] */
          roundPromptTimeSecond: number[]
          /** 绘画时，若有人猜对，直接将剩余时间缩短为至此值 @default 20 */
          roundBingoTimeSecond: number
          /** 小回合结束时的互动的等待时间 @default 5 */
          roundEndWaitTimeSecond: number
          /** 最终结算面板的显示时间 @default 8 */
          cycleEndWaitTimeSecond: number
        }
        /** 回合计分规则 */
        scoreRule: {
          /** 画手计分相关规则 */
          drawingPlayer: {
            /** 首次被猜对给画手加多少分 @default 3 */
            firstBingo: number
            /** 在首次被猜对后，剩余的玩家每猜对一个给画手加多少分 @default 2 */
            bingo: number
          }
          /** 其余玩家计分相关规则 */
          player: {
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
