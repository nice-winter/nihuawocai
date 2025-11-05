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
      cycle: {
        count: number
        time: {
          roundStartWaitTimeSecond: number
          roundDrawingTimeoutSecond: number
          roundDrawingTimeSecond: number
          maxRoundDrawingTimeSecond: number
          roundPromptTimeSecond: number[]
          roundBingoTimeSecond: number
          roundEndWaitTimeSecond: number
          cycleEndWaitTimeSecond: number
        }
        scoreRule: {
          drawingPlayer: {
            bingo: number
            firstBingo: number
          }
          player: {
            bingo: number
            firstBingo: number
          }
        }
      }
    }
  }
}
