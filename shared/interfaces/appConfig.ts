import type { LevelInfo } from '#shared/interfaces/level'
import type { Gender } from '#shared/interfaces/gender'

export interface AppConfig {
  name: string
  announcements: string[]
  genders: Gender[]
  game: {
    levels: LevelInfo[]
    lobby: {
      perMinuteChatCount: number
      time: {
        chatIntervalTimeSecond: number
      }
    }
    room: {
      banners: {
        imgUrl: string
        description: string
        url: string
      }[]
      feature: {
        kick: boolean
        broadcast: boolean
        invite: {
          idle: boolean
          sameCity: boolean
        }
      }
      maxBroadcastCount: number
      perMinuteChatCount: number
      passwordMaxLengh: number
      time: {
        broadcastIntervalTimeSecond: number
        chatIntervalTimeSecond: number
        preStartTimeSecond: number
        maxPreStartTimeSecond: number
        invitationValidTimeSecond: number
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
          /** 轮（整局游戏）的等待（结算面板显示）时间 @default 8 */
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
