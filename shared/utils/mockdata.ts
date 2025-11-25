import type { Player } from '~~/shared/types/player'
import type { RoomInfo } from '~~/shared/types/room'

const roomList: RoomInfo[] = [
  {
    roomNumber: 0,
    players: [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        avatar_url: 'https://free.picui.cn/free/2025/10/23/68fa1e1631516.jpg',
        nickname: '娉娉袅袅十三余',
        gender: 1,
        stats: {
          total_games: 2186,
          score: 164000,
          flower_count: 87200,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: true,
          description: '游戏达人'
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        avatar_url: 'https://example.com/avatar2.jpg',
        nickname: '豆蔻梢头二月初',
        gender: 0,
        stats: {
          total_games: 1240,
          score: 93000,
          flower_count: 54300,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      null,
      null,
      null,
      null,
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        avatar_url: 'https://free.picui.cn/free/2025/10/26/68fd638d6ea7a.png',
        nickname: '佐々木淳平',
        gender: 0,
        stats: {
          total_games: 3120,
          score: 234000,
          flower_count: 156800,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: true,
          description: '日本知名影视演员'
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      }
    ],
    onlookers: [
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        avatar_url: 'https://example.com/avatar4.jpg',
        nickname: '赵六',
        gender: 1,
        stats: {
          total_games: 893,
          score: 67000,
          flower_count: 32100,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
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
        id: '550e8400-e29b-41d4-a716-446655440004',
        avatar_url: 'https://example.com/avatar5.jpg',
        nickname: '小红',
        gender: 0,
        stats: {
          total_games: 4160,
          score: 312000,
          flower_count: 208000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      null,
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        avatar_url: 'https://example.com/avatar6.jpg',
        nickname: '小明',
        gender: 1,
        stats: {
          total_games: 2373,
          score: 178000,
          flower_count: 118700,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      null,
      null,
      null
    ],
    onlookers: [
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        avatar_url: 'https://example.com/avatar7.jpg',
        nickname: '小刚',
        gender: 1,
        stats: {
          total_games: 600,
          score: 45000,
          flower_count: 30000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440007',
        avatar_url: 'https://example.com/avatar8.jpg',
        nickname: '小美',
        gender: 0,
        stats: {
          total_games: 3560,
          score: 267000,
          flower_count: 178000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440008',
        avatar_url: 'https://example.com/avatar9.jpg',
        nickname: '匿名用户',
        gender: 2,
        stats: {
          total_games: 1640,
          score: 123000,
          flower_count: 82000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
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
        id: '550e8400-e29b-41d4-a716-446655440009',
        avatar_url: 'https://example.com/avatar10.jpg',
        nickname: '游戏高手',
        gender: 0,
        stats: {
          total_games: 7853,
          score: 589000,
          flower_count: 392700,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: true,
          description: '游戏达人'
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        avatar_url: 'https://example.com/avatar11.jpg',
        nickname: '幸运星',
        gender: 0,
        stats: {
          total_games: 3680,
          score: 276000,
          flower_count: 184000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440011',
        avatar_url: 'https://example.com/avatar12.jpg',
        nickname: '技术宅',
        gender: 0,
        stats: {
          total_games: 5760,
          score: 432000,
          flower_count: 288000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440012',
        avatar_url: 'https://example.com/avatar13.jpg',
        nickname: '开心果',
        gender: 0,
        stats: {
          total_games: 2640,
          score: 198000,
          flower_count: 132000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
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
        id: '550e8400-e29b-41d4-a716-446655440013',
        avatar_url: 'https://example.com/avatar14.jpg',
        nickname: '老玩家',
        gender: 1,
        stats: {
          total_games: 10200,
          score: 765000,
          flower_count: 510000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440014',
        avatar_url: 'https://example.com/avatar15.jpg',
        nickname: '新手小白',
        gender: 1,
        stats: {
          total_games: 307,
          score: 23000,
          flower_count: 15300,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      null,
      {
        id: '550e8400-e29b-41d4-a716-446655440015',
        avatar_url: 'https://example.com/avatar16.jpg',
        nickname: '游戏达人',
        gender: 1,
        stats: {
          total_games: 8720,
          score: 654000,
          flower_count: 436000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440016',
        avatar_url: 'https://example.com/avatar17.jpg',
        nickname: '快乐玩家',
        gender: 0,
        stats: {
          total_games: 4280,
          score: 321000,
          flower_count: 214000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440017',
        avatar_url: 'https://example.com/avatar18.jpg',
        nickname: '竞技选手',
        gender: 1,
        stats: {
          total_games: 11680,
          score: 876000,
          flower_count: 584000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      null
    ],
    onlookers: [
      {
        id: '550e8400-e29b-41d4-a716-446655440018',
        avatar_url: 'https://example.com/avatar19.jpg',
        nickname: '旁观者1号',
        gender: 2,
        stats: {
          total_games: 720,
          score: 54000,
          flower_count: 36000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
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
        id: '550e8400-e29b-41d4-a716-446655440019',
        avatar_url: 'https://example.com/avatar20.jpg',
        nickname: '独行侠',
        gender: 0,
        stats: {
          total_games: 5760,
          score: 432000,
          flower_count: 288000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440020',
        avatar_url: 'https://example.com/avatar21.jpg',
        nickname: '团队之星',
        gender: 0,
        stats: {
          total_games: 3973,
          score: 298000,
          flower_count: 198700,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440021',
        avatar_url: 'https://example.com/avatar22.jpg',
        nickname: '策略大师',
        gender: 1,
        stats: {
          total_games: 7560,
          score: 567000,
          flower_count: 378000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440022',
        avatar_url: 'https://example.com/avatar23.jpg',
        nickname: '速度之王',
        gender: 1,
        stats: {
          total_games: 6520,
          score: 489000,
          flower_count: 326000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440023',
        avatar_url: 'https://example.com/avatar24.jpg',
        nickname: '幸运儿',
        gender: 0,
        stats: {
          total_games: 4600,
          score: 345000,
          flower_count: 230000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440024',
        avatar_url: 'https://example.com/avatar25.jpg',
        nickname: '挑战者',
        gender: 1,
        stats: {
          total_games: 3120,
          score: 234000,
          flower_count: 156000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440025',
        avatar_url: 'https://example.com/avatar26.jpg',
        nickname: '终结者',
        gender: 1,
        stats: {
          total_games: 9040,
          score: 678000,
          flower_count: 452000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      }
    ],
    onlookers: [
      {
        id: '550e8400-e29b-41d4-a716-446655440026',
        avatar_url: 'https://example.com/avatar27.jpg',
        nickname: '学习委员',
        gender: 0,
        stats: {
          total_games: 2080,
          score: 156000,
          flower_count: 104000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440027',
        avatar_url: 'https://example.com/avatar28.jpg',
        nickname: '观察员',
        gender: 2,
        stats: {
          total_games: 1187,
          score: 89000,
          flower_count: 59300,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
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
        id: '550e8400-e29b-41d4-a716-446655440028',
        avatar_url: 'https://example.com/avatar29.jpg',
        nickname: '最后一人',
        gender: 1,
        stats: {
          total_games: 1640,
          score: 123000,
          flower_count: 82000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      null,
      null,
      null,
      null
    ],
    onlookers: [
      {
        id: '550e8400-e29b-41d4-a716-446655440029',
        avatar_url: 'https://example.com/avatar30.jpg',
        nickname: '观众A',
        gender: 0,
        stats: {
          total_games: 600,
          score: 45000,
          flower_count: 30000,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440030',
        avatar_url: 'https://example.com/avatar31.jpg',
        nickname: '观众B',
        gender: 1,
        stats: {
          total_games: 893,
          score: 67000,
          flower_count: 44700,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: true,
          description: '资深游戏评论员'
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440031',
        avatar_url: 'https://example.com/avatar32.jpg',
        nickname: '观众C',
        gender: 2,
        stats: {
          total_games: 1187,
          score: 89000,
          flower_count: 59300,
          egg_count: 0,
          slipper_count: 0
        },
        verification: {
          verified: false,
          description: ''
        },
        auth_provider: 'github',
        email: '',
        created_at: 0,
        last_login_at: 0
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
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c1',
    avatar_url: 'https://example.com/avatar1.jpg',
    nickname: '清风徐来',
    gender: 1,
    stats: {
      total_games: 2456,
      score: 184200,
      flower_count: 92300,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: true,
      description: '国风插画师'
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b811-9dad-11d1-80b4-00c04fd430c2',
    avatar_url: 'https://example.com/avatar2.jpg',
    nickname: '明月几时有',
    gender: 0,
    stats: {
      total_games: 3120,
      score: 234000,
      flower_count: 117000,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: false,
      description: ''
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b812-9dad-11d1-80b4-00c04fd430c3',
    avatar_url: 'https://example.com/avatar3.jpg',
    nickname: '星河滚烫',
    gender: 1,
    stats: {
      total_games: 1789,
      score: 134175,
      flower_count: 67100,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: false,
      description: ''
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b813-9dad-11d1-80b4-00c04fd430c4',
    avatar_url: 'https://example.com/avatar4.jpg',
    nickname: '人间理想',
    gender: 0,
    stats: {
      total_games: 4321,
      score: 324075,
      flower_count: 162200,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: false,
      description: ''
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b814-9dad-11d1-80b4-00c04fd430c5',
    avatar_url: 'https://example.com/avatar5.jpg',
    nickname: '山河故人',
    gender: 1,
    stats: {
      total_games: 2987,
      score: 224025,
      flower_count: 112100,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: false,
      description: ''
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b815-9dad-11d1-80b4-00c04fd430c6',
    avatar_url: 'https://example.com/avatar6.jpg',
    nickname: '云深不知处',
    gender: 2,
    stats: {
      total_games: 1567,
      score: 117525,
      flower_count: 58800,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: false,
      description: ''
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b816-9dad-11d1-80b4-00c04fd430c7',
    avatar_url: 'https://example.com/avatar7.jpg',
    nickname: '花间一壶酒',
    gender: 0,
    stats: {
      total_games: 3890,
      score: 291750,
      flower_count: 146000,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: false,
      description: ''
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b817-9dad-11d1-80b4-00c04fd430c8',
    avatar_url: 'https://example.com/avatar8.jpg',
    nickname: '独酌无相亲',
    gender: 1,
    stats: {
      total_games: 2234,
      score: 167550,
      flower_count: 83800,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: false,
      description: ''
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b818-9dad-11d1-80b4-00c04fd430c9',
    avatar_url: 'https://example.com/avatar9.jpg',
    nickname: '举杯邀明月',
    gender: 0,
    stats: {
      total_games: 3456,
      score: 259200,
      flower_count: 129700,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: true,
      description: '诗画双绝'
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b819-9dad-11d1-80b4-00c04fd430ca',
    avatar_url: 'https://example.com/avatar10.jpg',
    nickname: '对影成三人',
    gender: 1,
    stats: {
      total_games: 2789,
      score: 209175,
      flower_count: 104600,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: false,
      description: ''
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b81a-9dad-11d1-80b4-00c04fd430cb',
    avatar_url: 'https://example.com/avatar11.jpg',
    nickname: '月既不解饮',
    gender: 2,
    stats: {
      total_games: 1987,
      score: 149025,
      flower_count: 74500,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: true,
      description: '抽象艺术先锋'
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b81b-9dad-11d1-80b4-00c04fd430cc',
    avatar_url: 'https://example.com/avatar12.jpg',
    nickname: '影徒随我身',
    gender: 0,
    stats: {
      total_games: 4123,
      score: 309225,
      flower_count: 154700,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: false,
      description: ''
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b81c-9dad-11d1-80b4-00c04fd430cd',
    avatar_url: 'https://example.com/avatar13.jpg',
    nickname: '暂伴月将影',
    gender: 1,
    stats: {
      total_games: 2678,
      score: 200850,
      flower_count: 100500,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: true,
      description: '光影效果专家'
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b81d-9dad-11d1-80b4-00c04fd430ce',
    avatar_url: 'https://example.com/avatar14.jpg',
    nickname: '行乐须及春',
    gender: 0,
    stats: {
      total_games: 3345,
      score: 250875,
      flower_count: 125500,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: false,
      description: ''
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b81e-9dad-11d1-80b4-00c04fd430cf',
    avatar_url: 'https://example.com/avatar15.jpg',
    nickname: '我歌月徘徊',
    gender: 1,
    stats: {
      total_games: 2890,
      score: 216750,
      flower_count: 108400,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: true,
      description: '音乐主题画家'
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b81f-9dad-11d1-80b4-00c04fd430d0',
    avatar_url: 'https://example.com/avatar16.jpg',
    nickname: '我舞影零乱',
    gender: 0,
    stats: {
      total_games: 3765,
      score: 282375,
      flower_count: 141200,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: false,
      description: ''
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b820-9dad-11d1-80b4-00c04fd430d1',
    avatar_url: 'https://example.com/avatar17.jpg',
    nickname: '醒时同交欢',
    gender: 1,
    stats: {
      total_games: 2134,
      score: 160050,
      flower_count: 80000,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: true,
      description: '社交艺术达人'
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b821-9dad-11d1-80b4-00c04fd430d2',
    avatar_url: 'https://example.com/avatar18.jpg',
    nickname: '醉后各分散',
    gender: 2,
    stats: {
      total_games: 1876,
      score: 140700,
      flower_count: 70300,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: false,
      description: ''
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b822-9dad-11d1-80b4-00c04fd430d3',
    avatar_url: 'https://example.com/avatar19.jpg',
    nickname: '永结无情游',
    gender: 0,
    stats: {
      total_games: 3987,
      score: 299025,
      flower_count: 149600,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: true,
      description: '独立游戏开发者'
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b823-9dad-11d1-80b4-00c04fd430d4',
    avatar_url: 'https://example.com/avatar20.jpg',
    nickname: '相期邈云汉',
    gender: 1,
    stats: {
      total_games: 2567,
      score: 192525,
      flower_count: 96200,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: false,
      description: ''
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b824-9dad-11d1-80b4-00c04fd430d5',
    avatar_url: 'https://example.com/avatar21.jpg',
    nickname: '青山绿水间',
    gender: 0,
    stats: {
      total_games: 3210,
      score: 240750,
      flower_count: 120400,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: true,
      description: '环保主题艺术家'
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b825-9dad-11d1-80b4-00c04fd430d6',
    avatar_url: 'https://example.com/avatar22.jpg',
    nickname: '白鹭上青天',
    gender: 1,
    stats: {
      total_games: 2345,
      score: 175875,
      flower_count: 87900,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: false,
      description: ''
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b826-9dad-11d1-80b4-00c04fd430d7',
    avatar_url: 'https://example.com/avatar23.jpg',
    nickname: '窗含西岭雪',
    gender: 0,
    stats: {
      total_games: 2876,
      score: 215700,
      flower_count: 107900,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: true,
      description: '雪景画专家'
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b827-9dad-11d1-80b4-00c04fd430d8',
    avatar_url: 'https://example.com/avatar24.jpg',
    nickname: '门泊东吴船',
    gender: 1,
    stats: {
      total_games: 3543,
      score: 265725,
      flower_count: 132900,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: false,
      description: ''
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  },
  {
    id: '6ba7b828-9dad-11d1-80b4-00c04fd430d9',
    avatar_url: 'https://example.com/avatar25.jpg',
    nickname: '春风又绿江南岸',
    gender: 2,
    stats: {
      total_games: 2987,
      score: 224025,
      flower_count: 112100,
      egg_count: 0,
      slipper_count: 0
    },
    verification: {
      verified: true,
      description: '江南水乡画家'
    },
    auth_provider: 'github',
    email: '',
    created_at: 0,
    last_login_at: 0
  }
]

const _roomList = roomList.map((i) => {
  return {
    ...i,
    players: i.players?.map((p) => {
      if (!p) return null
      return {
        ...p,
        avatar_url: p.avatar_url.includes('example.com')
          ? `https://testingbot.com/free-online-tools/random-avatar/64?u=${Math.random() * Date.now()}`
          : p.avatar_url
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
    avatar_url: p.avatar_url.includes('example.com')
      ? p.gender >= 1
        ? api.female
        : api.male
      : p.avatar_url
  }
})

const ranks = [
  {
    score: 32,
    flower: 28,
    egg: 15,
    slipper: 8,
    player: {
      id: '6ba7b822-9dad-11d1-80b4-00c04fd430d3',
      avatar_url: 'https://api.bducds.com/api/pic/?pic=girl',
      nickname: '永结无情游',
      gender: 0,
      stats: { total_games: 3987, score: 299025, flower_count: 149600 },
      verification: {
        verified: true,
        description: '独立游戏开发者'
      },
      auth_provider: 'github',
      email: ''
    }
  },
  {
    score: 18,
    flower: 22,
    egg: 9,
    slipper: 12,
    player: {
      id: '6ba7b823-9dad-11d1-80b4-00c04fd430d4',
      avatar_url: 'https://api.bducds.com/api/pic/?pic=girl',
      nickname: '相期邈云汉',
      gender: 1,
      stats: { total_games: 2567, score: 192525, flower_count: 96200 },
      verification: {
        verified: false,
        description: ''
      },
      auth_provider: 'github',
      email: ''
    }
  },
  {
    score: 27,
    flower: 19,
    egg: 14,
    slipper: 6,
    player: {
      id: '6ba7b824-9dad-11d1-80b4-00c04fd430d5',
      avatar_url: 'https://api.bducds.com/api/pic/?pic=girl',
      nickname: '青山绿水间',
      gender: 0,
      stats: { total_games: 3210, score: 240750, flower_count: 120400 },
      verification: {
        verified: true,
        description: '环保主题艺术家'
      },
      auth_provider: 'github',
      email: ''
    }
  },
  {
    score: 12,
    flower: 8,
    egg: 21,
    slipper: 17,
    player: {
      id: '6ba7b825-9dad-11d1-80b4-00c04fd430d6',
      avatar_url: 'https://api.bducds.com/api/pic/?pic=girl',
      nickname: '白鹭上青天',
      gender: 1,
      stats: { total_games: 2345, score: 175875, flower_count: 87900 },
      verification: {
        verified: false,
        description: ''
      },
      auth_provider: 'github',
      email: ''
    }
  },
  {
    score: 38,
    flower: 35,
    egg: 7,
    slipper: 4,
    player: {
      id: '6ba7b826-9dad-11d1-80b4-00c04fd430d7',
      avatar_url: 'https://api.bducds.com/api/pic/?pic=girl',
      nickname: '窗含西岭雪',
      gender: 0,
      stats: { total_games: 2876, score: 215700, flower_count: 107900 },
      verification: {
        verified: true,
        description: '雪景画专家'
      },
      auth_provider: 'github',
      email: ''
    }
  },
  {
    score: 5,
    flower: 11,
    egg: 18,
    slipper: 23,
    player: {
      id: '6ba7b827-9dad-11d1-80b4-00c04fd430d8',
      avatar_url: 'https://api.bducds.com/api/pic/?pic=girl',
      nickname: '门泊东吴船',
      gender: 1,
      stats: { total_games: 3543, score: 265725, flower_count: 132900 },
      verification: {
        verified: false,
        description: ''
      },
      auth_provider: 'github',
      email: ''
    }
  },
  {
    score: 25,
    flower: 30,
    egg: 12,
    slipper: 9,
    player: {
      id: '6ba7b828-9dad-11d1-80b4-00c04fd430d9',
      avatar_url: 'https://api.bducds.com/api/pic/?pic=girl',
      nickname: '春风又绿江南岸',
      gender: 2,
      stats: { total_games: 2987, score: 224025, flower_count: 112100 },
      verification: {
        verified: true,
        description: '江南水乡画家'
      },
      auth_provider: 'github',
      email: ''
    }
  }
]

const mockdata = {
  roomList: _roomList,
  players: _players,
  ranks
}

export { mockdata }
