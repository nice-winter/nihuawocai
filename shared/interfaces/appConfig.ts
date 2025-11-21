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
        /** 最大轮数，1 则为每人画一次 */
        count: number
        /** 时间相关设置 */
        time: {
          /** 开始绘画前的等待时间 */
          roundStartWaitTimeSecond: number
          /** 绘画开始后，N 秒内仍未有任何动作，则判定为绘画超时，直接结束当前回合 */
          roundDrawingTimeoutSecond: number
          /** 绘画时间 */
          roundDrawingTimeSecond: number
          /** 最大绘画时间，预留给加时卡道具等使用 */
          maxRoundDrawingTimeSecond: number
          /** 绘画过程中弹出提示词的时间节点 */
          roundPromptTimeSecond: number[]
          /** 绘画时，若有人猜对，直接将剩余时间设置为至此值 */
          roundBingoTimeSecond: number
          /** 结束绘画的互动的等待时间 */
          roundEndWaitTimeSecond: number
          /** 轮（整局游戏）结束的等待（结算面板显示）时间 */
          cycleEndWaitTimeSecond: number
        }
        /** 回合计分规则 */
        scoreRule: {
          /** 画手计分相关规则 */
          drawingPlayer: {
            /** 被第一个玩家答对给画手加多少分 */
            firstBingo: number
            /** 在被第一个玩家答对后，被剩余的玩家答对时每个玩家给画手加多少分 */
            bingo: number
          }
          /** 其余玩家计分相关规则 */
          player: {
            /** 第一个答对的玩家加多少分 */
            firstBingo: number
            /** 其余答对的玩家加多少分 */
            bingo: number
          }
        }
      }
    }
  }
}
