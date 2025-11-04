import type { AppConfig } from '#shared/interfaces/appConfig'

export const defaultAppConfig: AppConfig = {
  name: '我画你猜',
  announcements: [
    '【公告】阿星啊，你总得<a href="#">计划</a>一下吧，这么年轻难道不工作，就混小太保啊。'
  ],
  genders: [
    {
      label: '男',
      value: 0,
      icon: 'ph:gender-male-bold',
      color: '#23a9ce'
    },
    {
      label: '女',
      value: 1,
      icon: 'ph:gender-female-bold',
      color: '#dd243c'
    },
    {
      label: '不想说',
      value: 2,
      icon: 'ph:question-mark-bold',
      color: ''
    },
    {
      label: '沃尔玛购物袋',
      value: 3,
      icon: 'tabler:shopping-bag',
      color: '#00ab07'
    },
    {
      label: '武装直升机',
      value: 4,
      icon: 'tabler:helicopter',
      color: '#ad1ef4'
    },
    {
      label: '科比',
      value: 5,
      icon: 'material-symbols:sports-basketball',
      color: '#ad1ef4'
    },
    {
      label: '咖啡杯',
      value: 6,
      icon: 'streamline-plump:coffee-mug-solid',
      color: '#ad1ef4'
    },
    {
      label: '显示器',
      value: 7,
      icon: 'material-symbols:nest-display-outline',
      color: '#ad1ef4'
    },
    {
      label: '艾玛电动车',
      value: 8,
      icon: 'material-symbols:motorcycle-rounded',
      color: '#ad1ef4'
    },
    {
      label: '厕纸',
      value: 9,
      icon: 'ph:toilet-paper-fill',
      color: '#ad1ef4'
    },
    {
      label: '双生一体',
      value: 10,
      icon: 'tabler:gender-bigender',
      color: '#ad1ef4'
    }
  ],
  game: {
    levels: [
      { level: 1, minScore: 0, title: '' },
      { level: 2, minScore: 20, title: '' },
      { level: 3, minScore: 50, title: '绘画新人' },
      { level: 4, minScore: 80, title: '绘画新人' },
      { level: 5, minScore: 120, title: '绘画新人' },
      { level: 6, minScore: 160, title: '绘画新人' },
      { level: 7, minScore: 200, title: '粗通皮毛' },
      { level: 8, minScore: 250, title: '粗通皮毛' },
      { level: 9, minScore: 300, title: '粗通皮毛' },
      { level: 10, minScore: 350, title: '粗通皮毛' },
      { level: 11, minScore: 400, title: '粗通皮毛' },
      { level: 12, minScore: 500, title: '崭露头角' },
      { level: 13, minScore: 600, title: '崭露头角' },
      { level: 14, minScore: 700, title: '崭露头角' },
      { level: 15, minScore: 800, title: '略有小成' },
      { level: 16, minScore: 900, title: '略有小成' },
      { level: 17, minScore: 1000, title: '略有小成' },
      { level: 18, minScore: 1200, title: '略有小成' },
      { level: 19, minScore: 1400, title: '略有小成' },
      { level: 20, minScore: 1600, title: '略有小成' },
      { level: 21, minScore: 1800, title: '渐入佳境' },
      { level: 22, minScore: 2000, title: '渐入佳境' },
      { level: 23, minScore: 2250, title: '渐入佳境' },
      { level: 24, minScore: 2500, title: '渐入佳境' },
      { level: 25, minScore: 2750, title: '渐入佳境' },
      { level: 26, minScore: 3000, title: '渐入佳境' },
      { level: 27, minScore: 3300, title: '出类拔萃' },
      { level: 28, minScore: 3600, title: '出类拔萃' },
      { level: 29, minScore: 4000, title: '出类拔萃' },
      { level: 30, minScore: 4500, title: '出类拔萃' },
      { level: 31, minScore: 5000, title: '出类拔萃' },
      { level: 32, minScore: 5500, title: '出类拔萃' },
      { level: 33, minScore: 6000, title: '自成一派' },
      { level: 34, minScore: 7000, title: '自成一派' },
      { level: 35, minScore: 8000, title: '自成一派' },
      { level: 36, minScore: 9000, title: '自成一派' },
      { level: 37, minScore: 10000, title: '自成一派' },
      { level: 38, minScore: 12000, title: '登峰造极' },
      { level: 39, minScore: 15000, title: '登峰造极' },
      { level: 40, minScore: 20000, title: '登峰造极' },
      { level: 41, minScore: 25000, title: '登峰造极' },
      { level: 42, minScore: 30000, title: '出神入化' },
      { level: 43, minScore: 35000, title: '出神入化' },
      { level: 44, minScore: 40000, title: '出神入化' },
      { level: 45, minScore: 50000, title: '出神入化' },
      { level: 46, minScore: 60000, title: '出神入化' },
      { level: 47, minScore: 70000, title: '空前绝后' },
      { level: 48, minScore: 80000, title: '空前绝后' },
      { level: 49, minScore: 90000, title: '空前绝后' },
      { level: 50, minScore: 100000, title: '空前绝后' },
      { level: 51, minScore: 120000, title: '空前绝后' },
      { level: 52, minScore: 160000, title: '空前绝后' },
      { level: 53, minScore: 200000, title: '空前绝后' },
      { level: 54, minScore: 240000, title: '空前绝后' },
      { level: 55, minScore: 280000, title: '空前绝后' },
      { level: 56, minScore: 320000, title: '空前绝后' },
      { level: 57, minScore: 400000, title: '空前绝后' },
      { level: 58, minScore: 480000, title: '空前绝后' },
      { level: 59, minScore: 560000, title: '空前绝后' },
      { level: 60, minScore: 800000, title: '空前绝后' }
    ],
    lobby: {
      perMinuteChatCount: 0,
      time: {
        chatIntervalTimeSecond: 5
      }
    },
    room: {
      banners: [
        {
          imgUrl: 'https://free.picui.cn/free/2025/11/04/6908e810591bf.jpg',
          description: '',
          url: '#'
        }
      ],
      feature: {
        kick: true,
        broadcast: true,
        invite: {
          idle: true,
          sameCity: false
        }
      },
      maxBroadcastCount: 0,
      perMinuteChatCount: 0,
      passwordMaxLengh: 4,
      time: {
        broadcastIntervalTimeSecond: 300,
        chatIntervalTimeSecond: 1,
        preStartTimeSecond: 30,
        maxPreStartTimeSecond: 60,
        invitationValidTimeSecond: 15,
        afkTimeSecond: 300
      },
      cycle: {
        count: 2,
        time: {
          roundStartWaitTimeSecond: 5,
          roundTimeSecond: 60,
          maxRoundTimeSecond: 120,
          roundPromptTimeSecond: [20, 40],
          roundBingoTimeSecond: 20,
          roundEndWaitTimeSecond: 5,
          cycleEndWaitTimeSecond: 12
        },
        scoreRule: {
          drawingPlayer: {
            bingo: 2,
            firstBingo: 3
          },
          player: {
            bingo: 1,
            firstBingo: 2
          }
        }
      }
    }
  }
}
