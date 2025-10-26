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

const players: Player[] = [
  {
    uuid: '6ba7b810-9dad-11d1-80b4-00c04fd430c1',
    avatar: 'https://example.com/avatar1.jpg',
    nickname: '清风徐来',
    gender: 1,
    exinfo: { count: 2456, score: 184200, flowers: 92300 }
  },
  {
    uuid: '6ba7b811-9dad-11d1-80b4-00c04fd430c2',
    avatar: 'https://example.com/avatar2.jpg',
    nickname: '明月几时有',
    gender: 0,
    exinfo: { count: 3120, score: 234000, flowers: 117000 }
  },
  {
    uuid: '6ba7b812-9dad-11d1-80b4-00c04fd430c3',
    avatar: 'https://example.com/avatar3.jpg',
    nickname: '星河滚烫',
    gender: 1,
    exinfo: { count: 1789, score: 134175, flowers: 67100 }
  },
  {
    uuid: '6ba7b813-9dad-11d1-80b4-00c04fd430c4',
    avatar: 'https://example.com/avatar4.jpg',
    nickname: '人间理想',
    gender: 0,
    exinfo: { count: 4321, score: 324075, flowers: 162200 }
  },
  {
    uuid: '6ba7b814-9dad-11d1-80b4-00c04fd430c5',
    avatar: 'https://example.com/avatar5.jpg',
    nickname: '山河故人',
    gender: 1,
    exinfo: { count: 2987, score: 224025, flowers: 112100 }
  },
  {
    uuid: '6ba7b815-9dad-11d1-80b4-00c04fd430c6',
    avatar: 'https://example.com/avatar6.jpg',
    nickname: '云深不知处',
    gender: 2,
    exinfo: { count: 1567, score: 117525, flowers: 58800 }
  },
  {
    uuid: '6ba7b816-9dad-11d1-80b4-00c04fd430c7',
    avatar: 'https://example.com/avatar7.jpg',
    nickname: '花间一壶酒',
    gender: 0,
    exinfo: { count: 3890, score: 291750, flowers: 146000 }
  },
  {
    uuid: '6ba7b817-9dad-11d1-80b4-00c04fd430c8',
    avatar: 'https://example.com/avatar8.jpg',
    nickname: '独酌无相亲',
    gender: 1,
    exinfo: { count: 2234, score: 167550, flowers: 83800 }
  },
  {
    uuid: '6ba7b818-9dad-11d1-80b4-00c04fd430c9',
    avatar: 'https://example.com/avatar9.jpg',
    nickname: '举杯邀明月',
    gender: 0,
    exinfo: { count: 3456, score: 259200, flowers: 129700 }
  },
  {
    uuid: '6ba7b819-9dad-11d1-80b4-00c04fd430ca',
    avatar: 'https://example.com/avatar10.jpg',
    nickname: '对影成三人',
    gender: 1,
    exinfo: { count: 2789, score: 209175, flowers: 104600 }
  },
  {
    uuid: '6ba7b81a-9dad-11d1-80b4-00c04fd430cb',
    avatar: 'https://example.com/avatar11.jpg',
    nickname: '月既不解饮',
    gender: 2,
    exinfo: { count: 1987, score: 149025, flowers: 74500 }
  },
  {
    uuid: '6ba7b81b-9dad-11d1-80b4-00c04fd430cc',
    avatar: 'https://example.com/avatar12.jpg',
    nickname: '影徒随我身',
    gender: 0,
    exinfo: { count: 4123, score: 309225, flowers: 154700 }
  },
  {
    uuid: '6ba7b81c-9dad-11d1-80b4-00c04fd430cd',
    avatar: 'https://example.com/avatar13.jpg',
    nickname: '暂伴月将影',
    gender: 1,
    exinfo: { count: 2678, score: 200850, flowers: 100500 }
  },
  {
    uuid: '6ba7b81d-9dad-11d1-80b4-00c04fd430ce',
    avatar: 'https://example.com/avatar14.jpg',
    nickname: '行乐须及春',
    gender: 0,
    exinfo: { count: 3345, score: 250875, flowers: 125500 }
  },
  {
    uuid: '6ba7b81e-9dad-11d1-80b4-00c04fd430cf',
    avatar: 'https://example.com/avatar15.jpg',
    nickname: '我歌月徘徊',
    gender: 1,
    exinfo: { count: 2890, score: 216750, flowers: 108400 }
  },
  {
    uuid: '6ba7b81f-9dad-11d1-80b4-00c04fd430d0',
    avatar: 'https://example.com/avatar16.jpg',
    nickname: '我舞影零乱',
    gender: 0,
    exinfo: { count: 3765, score: 282375, flowers: 141200 }
  },
  {
    uuid: '6ba7b820-9dad-11d1-80b4-00c04fd430d1',
    avatar: 'https://example.com/avatar17.jpg',
    nickname: '醒时同交欢',
    gender: 1,
    exinfo: { count: 2134, score: 160050, flowers: 80000 }
  },
  {
    uuid: '6ba7b821-9dad-11d1-80b4-00c04fd430d2',
    avatar: 'https://example.com/avatar18.jpg',
    nickname: '醉后各分散',
    gender: 2,
    exinfo: { count: 1876, score: 140700, flowers: 70300 }
  },
  {
    uuid: '6ba7b822-9dad-11d1-80b4-00c04fd430d3',
    avatar: 'https://example.com/avatar19.jpg',
    nickname: '永结无情游',
    gender: 0,
    exinfo: { count: 3987, score: 299025, flowers: 149600 }
  },
  {
    uuid: '6ba7b823-9dad-11d1-80b4-00c04fd430d4',
    avatar: 'https://example.com/avatar20.jpg',
    nickname: '相期邈云汉',
    gender: 1,
    exinfo: { count: 2567, score: 192525, flowers: 96200 }
  },
  {
    uuid: '6ba7b824-9dad-11d1-80b4-00c04fd430d5',
    avatar: 'https://example.com/avatar21.jpg',
    nickname: '青山绿水间',
    gender: 0,
    exinfo: { count: 3210, score: 240750, flowers: 120400 }
  },
  {
    uuid: '6ba7b825-9dad-11d1-80b4-00c04fd430d6',
    avatar: 'https://example.com/avatar22.jpg',
    nickname: '白鹭上青天',
    gender: 1,
    exinfo: { count: 2345, score: 175875, flowers: 87900 }
  },
  {
    uuid: '6ba7b826-9dad-11d1-80b4-00c04fd430d7',
    avatar: 'https://example.com/avatar23.jpg',
    nickname: '窗含西岭雪',
    gender: 0,
    exinfo: { count: 2876, score: 215700, flowers: 107900 }
  },
  {
    uuid: '6ba7b827-9dad-11d1-80b4-00c04fd430d8',
    avatar: 'https://example.com/avatar24.jpg',
    nickname: '门泊东吴船',
    gender: 1,
    exinfo: { count: 3543, score: 265725, flowers: 132900 }
  },
  {
    uuid: '6ba7b828-9dad-11d1-80b4-00c04fd430d9',
    avatar: 'https://example.com/avatar25.jpg',
    nickname: '春风又绿江南岸',
    gender: 2,
    exinfo: { count: 2987, score: 224025, flowers: 112100 }
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

const _players = players.map((p) => {
  const api = {
    female: `https://api.bducds.com/api/pic/?pic=girl`,
    male: `https://testingbot.com/free-online-tools/random-avatar/64?u=${Math.random() * Date.now()}`
  }
  return {
    ...p,
    avatar: p.avatar.includes('example.com') ? (p.gender >= 1 ? api.female : api.male) : p.avatar
  }
})

export { _roomList as roomList, _players as players }
