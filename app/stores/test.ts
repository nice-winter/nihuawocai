import type { Player } from '~/interfaces/player'
import type { RoomInfo } from '~/interfaces/room'

const roomList: RoomInfo[] = [
  {
    roomNumber: 0,
    players: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        avatar: 'https://free.picui.cn/free/2025/10/23/68fa1e1631516.jpg',
        nickname: '娉娉袅袅十三余',
        gender: 1,
        exinfo: { count: 2186, score: 164000, flowers: 87200 }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440001',
        avatar: 'https://example.com/avatar2.jpg',
        nickname: '豆蔻梢头二月初',
        gender: 0,
        exinfo: { count: 1240, score: 93000, flowers: 54300 }
      },
      null,
      null,
      null,
      null,
      {
        uuid: '550e8400-e29b-41d4-a716-446655440002',
        avatar: 'https://free.picui.cn/free/2025/10/26/68fd638d6ea7a.png',
        nickname: '佐々木淳平',
        gender: 0,
        exinfo: { count: 3120, score: 234000, flowers: 156800 }
      }
    ],
    onlookers: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440003',
        avatar: 'https://example.com/avatar4.jpg',
        nickname: '赵六',
        gender: 1,
        exinfo: { count: 893, score: 67000, flowers: 32100 }
      }
    ],
    playing: true,
    locked: true,
    owner: '550e8400-e29b-41d4-a716-446655440000',
    seats: [true, true, true, true, false, false, true]
  },
  {
    roomNumber: 1,
    players: [
      null,
      {
        uuid: '550e8400-e29b-41d4-a716-446655440004',
        avatar: 'https://example.com/avatar5.jpg',
        nickname: '小红',
        gender: 0,
        exinfo: { count: 4160, score: 312000, flowers: 208000 }
      },
      null,
      {
        uuid: '550e8400-e29b-41d4-a716-446655440005',
        avatar: 'https://example.com/avatar6.jpg',
        nickname: '小明',
        gender: 1,
        exinfo: { count: 2373, score: 178000, flowers: 118700 }
      },
      null,
      null,
      null
    ],
    onlookers: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440006',
        avatar: 'https://example.com/avatar7.jpg',
        nickname: '小刚',
        gender: 1,
        exinfo: { count: 600, score: 45000, flowers: 30000 }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440007',
        avatar: 'https://example.com/avatar8.jpg',
        nickname: '小美',
        gender: 0,
        exinfo: { count: 3560, score: 267000, flowers: 178000 }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440008',
        avatar: 'https://example.com/avatar9.jpg',
        nickname: '匿名用户',
        gender: 2,
        exinfo: { count: 1640, score: 123000, flowers: 82000 }
      }
    ],
    playing: false,
    locked: true,
    owner: '550e8400-e29b-41d4-a716-446655440005',
    seats: [true, true, true, true, true, true, false]
  },
  {
    roomNumber: 2,
    players: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440009',
        avatar: 'https://example.com/avatar10.jpg',
        nickname: '游戏高手',
        gender: 0,
        exinfo: { count: 7853, score: 589000, flowers: 392700 }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440010',
        avatar: 'https://example.com/avatar11.jpg',
        nickname: '幸运星',
        gender: 0,
        exinfo: { count: 3680, score: 276000, flowers: 184000 }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440011',
        avatar: 'https://example.com/avatar12.jpg',
        nickname: '技术宅',
        gender: 1,
        exinfo: { count: 5760, score: 432000, flowers: 288000 }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440012',
        avatar: 'https://example.com/avatar13.jpg',
        nickname: '开心果',
        gender: 0,
        exinfo: { count: 2640, score: 198000, flowers: 132000 }
      },
      null,
      null,
      null
    ],
    onlookers: [],
    playing: true,
    locked: false,
    owner: '550e8400-e29b-41d4-a716-446655440011',
    seats: [true, true, true, true, false, false, true]
  },
  {
    roomNumber: 3,
    players: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440013',
        avatar: 'https://example.com/avatar14.jpg',
        nickname: '老玩家',
        gender: 1,
        exinfo: { count: 10200, score: 765000, flowers: 510000 }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440014',
        avatar: 'https://example.com/avatar15.jpg',
        nickname: '新手小白',
        gender: 1,
        exinfo: { count: 307, score: 23000, flowers: 15300 }
      },
      null,
      {
        uuid: '550e8400-e29b-41d4-a716-446655440015',
        avatar: 'https://example.com/avatar16.jpg',
        nickname: '游戏达人',
        gender: 1,
        exinfo: { count: 8720, score: 654000, flowers: 436000 }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440016',
        avatar: 'https://example.com/avatar17.jpg',
        nickname: '快乐玩家',
        gender: 0,
        exinfo: { count: 4280, score: 321000, flowers: 214000 }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440017',
        avatar: 'https://example.com/avatar18.jpg',
        nickname: '竞技选手',
        gender: 1,
        exinfo: { count: 11680, score: 876000, flowers: 584000 }
      },
      null
    ],
    onlookers: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440018',
        avatar: 'https://example.com/avatar19.jpg',
        nickname: '旁观者1号',
        gender: 2,
        exinfo: { count: 720, score: 54000, flowers: 36000 }
      }
    ],
    playing: true,
    locked: true,
    owner: '550e8400-e29b-41d4-a716-446655440016',
    seats: [true, true, true, true, true, true, true]
  },
  {
    roomNumber: 4,
    players: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440019',
        avatar: 'https://example.com/avatar20.jpg',
        nickname: '独行侠',
        gender: 0,
        exinfo: { count: 5760, score: 432000, flowers: 288000 }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440020',
        avatar: 'https://example.com/avatar21.jpg',
        nickname: '团队之星',
        gender: 0,
        exinfo: { count: 3973, score: 298000, flowers: 198700 }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440021',
        avatar: 'https://example.com/avatar22.jpg',
        nickname: '策略大师',
        gender: 1,
        exinfo: { count: 7560, score: 567000, flowers: 378000 }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440022',
        avatar: 'https://example.com/avatar23.jpg',
        nickname: '速度之王',
        gender: 1,
        exinfo: { count: 6520, score: 489000, flowers: 326000 }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440023',
        avatar: 'https://example.com/avatar24.jpg',
        nickname: '幸运儿',
        gender: 0,
        exinfo: { count: 4600, score: 345000, flowers: 230000 }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440024',
        avatar: 'https://example.com/avatar25.jpg',
        nickname: '挑战者',
        gender: 1,
        exinfo: { count: 3120, score: 234000, flowers: 156000 }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440025',
        avatar: 'https://example.com/avatar26.jpg',
        nickname: '终结者',
        gender: 1,
        exinfo: { count: 9040, score: 678000, flowers: 452000 }
      }
    ],
    onlookers: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440026',
        avatar: 'https://example.com/avatar27.jpg',
        nickname: '学习委员',
        gender: 0,
        exinfo: { count: 2080, score: 156000, flowers: 104000 }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440027',
        avatar: 'https://example.com/avatar28.jpg',
        nickname: '观察员',
        gender: 2,
        exinfo: { count: 1187, score: 89000, flowers: 59300 }
      }
    ],
    playing: false,
    locked: false,
    owner: '550e8400-e29b-41d4-a716-446655440022',
    seats: [true, true, true, true, true, true, true]
  },
  {
    roomNumber: 5,
    players: [
      null,
      null,
      {
        uuid: '550e8400-e29b-41d4-a716-446655440028',
        avatar: 'https://example.com/avatar29.jpg',
        nickname: '最后一人',
        gender: 1,
        exinfo: { count: 1640, score: 123000, flowers: 82000 }
      },
      null,
      null,
      null,
      null
    ],
    onlookers: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440029',
        avatar: 'https://example.com/avatar30.jpg',
        nickname: '观众A',
        gender: 0,
        exinfo: { count: 600, score: 45000, flowers: 30000 }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440030',
        avatar: 'https://example.com/avatar31.jpg',
        nickname: '观众B',
        gender: 1,
        exinfo: { count: 893, score: 67000, flowers: 44700 }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440031',
        avatar: 'https://example.com/avatar32.jpg',
        nickname: '观众C',
        gender: 2,
        exinfo: { count: 1187, score: 89000, flowers: 59300 }
      }
    ],
    playing: false,
    locked: true,
    owner: '550e8400-e29b-41d4-a716-446655440028',
    seats: [false, false, true, false, false, false, false]
  }
]

const _roomList = roomList.map((i) => {
  return {
    ...i,
    players: i.players?.map((p) => {
      if (!p) return null
      return {
        ...p,
        avatar: p.avatar.includes('example.com')
          ? `https://testingbot.com/free-online-tools/random-avatar/64?u=${Math.random() * Date.now()}`
          : p.avatar
      }
    })
  }
})

export { _roomList as roomList }
