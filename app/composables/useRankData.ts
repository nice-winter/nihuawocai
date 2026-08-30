export interface RankItem {
  score: number
  flower: number
  egg: number
  slipper: number
  player: {
    id: string
    nickname: string
    gender: number
    avatar_url: string
    verification: {
      verified: boolean
      description: string
    }
  }
}

interface RankApiResponse {
  id: string
  nickname: string
  gender: number
  avatar_url: string
  score: number
  flower_count: number
  egg_count: number
  slipper_count: number
  total_games: number
}

export const useRankData = () => {
  const rankList = ref<RankItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 从 API 获取全服排行榜
  const fetchRank = async (sortBy: 'score' | 'flower' | 'popularity' = 'score', limit = 50) => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<RankApiResponse[]>('/api/rank', {
        query: { sortBy, limit },
      })

      if (Array.isArray(data)) {
        rankList.value = data.map((item) => ({
          score: item.score ?? 0,
          flower: item.flower_count ?? 0,
          egg: item.egg_count ?? 0,
          slipper: item.slipper_count ?? 0,
          player: {
            id: item.id ?? '',
            nickname: item.nickname ?? '未知玩家',
            gender: item.gender ?? 0,
            avatar_url: item.avatar_url ?? '',
            // UiAvatar 需要的字段
            verification: {
              verified: false,
              description: '',
            },
          },
        }))
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取排行榜失败'
      rankList.value = []
      console.error('获取排行榜失败:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    rankList,
    loading,
    error,
    fetchRank,
  }
}
