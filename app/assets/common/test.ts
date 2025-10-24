import type { Player } from '~/interfaces/player'
import type { RoomListItemProps } from '~/interfaces/room'

const roomList: RoomListItemProps[] = [
  {
    roomNumber: 0,
    players: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        avatar: 'https://free.picui.cn/free/2025/10/23/68fa1e1631516.jpg',
        nickname: '娉娉袅袅十三余',
        gender: 1,
        exinfo: {
          count: 156
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440001',
        avatar: 'https://example.com/avatar2.jpg',
        nickname: '李四',
        gender: 1,
        exinfo: {
          count: 89
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440002',
        avatar: 'https://example.com/avatar3.jpg',
        nickname: '王五',
        gender: 1,
        exinfo: {
          count: 234
        }
      }
    ],
    onlookers: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440003',
        avatar: 'https://example.com/avatar4.jpg',
        nickname: '赵六',
        gender: 1,
        exinfo: {
          count: 67
        }
      }
    ],
    playing: true,
    locked: false
  },
  {
    roomNumber: 1,
    players: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440004',
        avatar: 'https://example.com/avatar5.jpg',
        nickname: '小红',
        gender: 0,
        exinfo: {
          count: 312
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440005',
        avatar: 'https://example.com/avatar6.jpg',
        nickname: '小明',
        gender: 1,
        exinfo: {
          count: 178
        }
      }
    ],
    onlookers: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440006',
        avatar: 'https://example.com/avatar7.jpg',
        nickname: '小刚',
        gender: 1,
        exinfo: {
          count: 45
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440007',
        avatar: 'https://example.com/avatar8.jpg',
        nickname: '小美',
        gender: 0,
        exinfo: {
          count: 267
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440008',
        avatar: 'https://example.com/avatar9.jpg',
        nickname: '匿名用户',
        gender: 2,
        exinfo: {
          count: 123
        }
      }
    ],
    playing: false,
    locked: true
  },
  {
    roomNumber: 2,
    players: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440009',
        avatar: 'https://example.com/avatar10.jpg',
        nickname: '游戏高手',
        gender: 0,
        exinfo: {
          count: 589
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440010',
        avatar: 'https://example.com/avatar11.jpg',
        nickname: '幸运星',
        gender: 0,
        exinfo: {
          count: 276
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440011',
        avatar: 'https://example.com/avatar12.jpg',
        nickname: '技术宅',
        gender: 1,
        exinfo: {
          count: 432
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440012',
        avatar: 'https://example.com/avatar13.jpg',
        nickname: '开心果',
        gender: 0,
        exinfo: {
          count: 198
        }
      }
    ],
    onlookers: [],
    playing: true,
    locked: false
  },
  {
    roomNumber: 3,
    players: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440013',
        avatar: 'https://example.com/avatar14.jpg',
        nickname: '老玩家',
        gender: 1,
        exinfo: {
          count: 765
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440014',
        avatar: 'https://example.com/avatar15.jpg',
        nickname: '新手小白',
        gender: 1,
        exinfo: {
          count: 23
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440015',
        avatar: 'https://example.com/avatar16.jpg',
        nickname: '游戏达人',
        gender: 1,
        exinfo: {
          count: 654
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440016',
        avatar: 'https://example.com/avatar17.jpg',
        nickname: '快乐玩家',
        gender: 0,
        exinfo: {
          count: 321
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440017',
        avatar: 'https://example.com/avatar18.jpg',
        nickname: '竞技选手',
        gender: 1,
        exinfo: {
          count: 876
        }
      }
    ],
    onlookers: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440018',
        avatar: 'https://example.com/avatar19.jpg',
        nickname: '旁观者1号',
        gender: 2,
        exinfo: {
          count: 54
        }
      }
    ],
    playing: true,
    locked: true
  },
  {
    roomNumber: 4,
    players: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440019',
        avatar: 'https://example.com/avatar20.jpg',
        nickname: '独行侠',
        gender: 0,
        exinfo: {
          count: 432
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440020',
        avatar: 'https://example.com/avatar21.jpg',
        nickname: '团队之星',
        gender: 0,
        exinfo: {
          count: 298
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440021',
        avatar: 'https://example.com/avatar22.jpg',
        nickname: '策略大师',
        gender: 1,
        exinfo: {
          count: 567
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440022',
        avatar: 'https://example.com/avatar23.jpg',
        nickname: '速度之王',
        gender: 1,
        exinfo: {
          count: 489
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440023',
        avatar: 'https://example.com/avatar24.jpg',
        nickname: '幸运儿',
        gender: 0,
        exinfo: {
          count: 345
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440024',
        avatar: 'https://example.com/avatar25.jpg',
        nickname: '挑战者',
        gender: 1,
        exinfo: {
          count: 234
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440025',
        avatar: 'https://example.com/avatar26.jpg',
        nickname: '终结者',
        gender: 1,
        exinfo: {
          count: 678
        }
      }
    ],
    onlookers: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440026',
        avatar: 'https://example.com/avatar27.jpg',
        nickname: '学习委员',
        gender: 0,
        exinfo: {
          count: 156
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440027',
        avatar: 'https://example.com/avatar28.jpg',
        nickname: '观察员',
        gender: 2,
        exinfo: {
          count: 89
        }
      }
    ],
    playing: false,
    locked: false
  },
  {
    roomNumber: 5,
    players: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440028',
        avatar: 'https://example.com/avatar29.jpg',
        nickname: '最后一人',
        gender: 1,
        exinfo: {
          count: 123
        }
      }
    ],
    onlookers: [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440029',
        avatar: 'https://example.com/avatar30.jpg',
        nickname: '观众A',
        gender: 0,
        exinfo: {
          count: 45
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440030',
        avatar: 'https://example.com/avatar31.jpg',
        nickname: '观众B',
        gender: 1,
        exinfo: {
          count: 67
        }
      },
      {
        uuid: '550e8400-e29b-41d4-a716-446655440031',
        avatar: 'https://example.com/avatar32.jpg',
        nickname: '观众C',
        gender: 2,
        exinfo: {
          count: 89
        }
      }
    ],
    playing: false,
    locked: true
  }
].map((i) => {
  return {
    ...i,
    players: i.players.map((p) => {
      return {
        ...p,
        avatar: p.avatar.includes('example.com')
          ? `https://testingbot.com/free-online-tools/random-avatar/64?u=${Math.random() * Date.now()}`
          : p.avatar
      }
    })
  }
})

export { roomList }
