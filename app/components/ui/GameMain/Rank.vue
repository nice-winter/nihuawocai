<template>
  <div class="rank-container select-none">
    <!-- Tab 切换器 -->
    <div class="rank-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="rank-tab"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        <UIcon :name="tab.icon" class="size-4" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="rank-loading">
      <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-wood-400" />
      <span>加载中...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="rank-error">
      <UIcon name="i-lucide-alert-circle" class="size-8 text-game-red-400" />
      <span>{{ error }}</span>
      <button class="rank-retry-btn" @click="fetchCurrentRank">
        <UIcon name="i-lucide-refresh-cw" class="size-4" />
        重试
      </button>
    </div>

    <!-- 排行榜内容 -->
    <div v-else class="rank-content">
      <!-- 空状态 -->
      <div v-if="sortedRankList.length === 0" class="rank-empty">
        <UIcon name="i-lucide-trophy" class="size-12 text-wood-300" />
        <span>暂无排名数据</span>
      </div>

      <!-- 列表 -->
      <div v-else class="rank-list">
        <div
          v-for="(item, index) in sortedRankList"
          :key="item.player.id"
          class="rank-item"
          :class="{ 'is-top': index < 3 }"
        >
          <!-- 排名 -->
          <div class="rank-position">
            <UIcon v-if="index === 0" name="emojione:1st-place-medal" class="size-6" />
            <UIcon v-else-if="index === 1" name="emojione:2nd-place-medal" class="size-6" />
            <UIcon v-else-if="index === 2" name="emojione:3rd-place-medal" class="size-6" />
            <span v-else class="rank-number">{{ index + 1 }}</span>
          </div>

          <!-- 头像 -->
          <UiAvatar :player="item.player" class="rank-avatar size-10" />

          <!-- 信息 -->
          <div class="rank-info">
            <div class="rank-name">
              <UiGenderIcon :gender="item.player.gender" />
              <span class="truncate">{{ item.player.nickname }}</span>
            </div>
            <div class="rank-stats">
              <span class="stat-item">
                <UIcon name="custom:icon-flower" class="size-3" />
                <span>{{ item.flower }}</span>
              </span>
              <span class="stat-item">
                <UIcon name="custom:icon-egg" class="size-3" />
                <span>{{ item.egg }}</span>
              </span>
              <span class="stat-item">
                <UIcon name="custom:icon-slipper" class="size-3" />
                <span>{{ item.slipper }}</span>
              </span>
            </div>
          </div>

          <!-- 分数 -->
          <div class="rank-score">
            <span class="score-value">{{ getScoreByTab(item) }}</span>
            <span class="score-label">{{ currentTabSuffix }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RankItem } from '~/composables/useRankData'

interface RankProps {
  /** 外部传入的排行榜数据，不传则自动从 API 获取 */
  rankList?: RankItem[]
  /** 最大显示数量 */
  maxDisplay?: number
  /** 是否自动加载 */
  autoLoad?: boolean
}

const props = withDefaults(defineProps<RankProps>(), {
  rankList: undefined,
  maxDisplay: 50,
  autoLoad: true,
})

const { rankList: apiRankList, loading, error, fetchRank } = useRankData()

// 优先使用外部传入的数据，否则使用 API 的数据
const dataSource = computed(() => props.rankList ?? apiRankList.value)

// 限制显示数量
const displayList = computed(() => dataSource.value.slice(0, props.maxDisplay))

type TabKey = 'score' | 'flower' | 'popularity'

interface Tab {
  key: TabKey
  label: string
  icon: string
  suffix: string
  getter: (item: RankItem) => number
}

const tabs: Tab[] = [
  { key: 'score', label: '积分', icon: 'i-lucide-star', suffix: '分', getter: (item) => item.score },
  { key: 'flower', label: '鲜花', icon: 'custom:icon-flower', suffix: '朵', getter: (item) => item.flower },
  {
    key: 'popularity',
    label: '人气',
    icon: 'i-lucide-heart',
    suffix: '点',
    getter: (item) => item.flower + item.egg * 2 + item.slipper * 3,
  },
]

const activeTab = ref<TabKey>('score')

const currentTab = computed(() => tabs.find((tab) => tab.key === activeTab.value))
const currentTabSuffix = computed(() => currentTab.value?.suffix ?? '')

const getScoreByTab = (item: RankItem): number => {
  return currentTab.value?.getter(item) ?? 0
}

const sortedRankList = computed(() => {
  // 如果是外部传入的数据，需要在前端排序
  // 如果是 API 数据，已经是排序好的（但切换 tab 需要重新请求）
  const getter = currentTab.value?.getter ?? ((item) => item.score)
  return [...displayList.value].sort((a, b) => getter(b) - getter(a))
})

// 获取当前 tab 对应的排行榜数据
const fetchCurrentRank = () => {
  fetchRank(activeTab.value, props.maxDisplay)
}

// 切换 tab
const switchTab = (tab: TabKey) => {
  activeTab.value = tab
  // 如果没有外部传入数据，切换 tab 时重新请求
  if (!props.rankList) {
    fetchRank(tab, props.maxDisplay)
  }
}

// 自动加载
onMounted(() => {
  if (props.autoLoad && !props.rankList) {
    fetchCurrentRank()
  }
})
</script>

<style scoped>
.rank-container {
  background: linear-gradient(135deg, #f5e6d3 0%, #e8d5b7 100%);
  border-radius: 12px;
  box-shadow:
    0 4px 12px rgba(139, 90, 43, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  overflow: hidden;
  padding: 16px 0;
}

.rank-tabs {
  display: flex;
  background: linear-gradient(to bottom, #d4b896, #c4a882);
  border-bottom: 2px solid #b8956a;
  box-shadow: 0 2px 4px rgba(139, 90, 43, 0.2);
}

.rank-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 8px;
  font-family: var(--font-cuyuan);
  font-size: 14px;
  color: #8b6f47;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 3px;
    background: linear-gradient(90deg, #f0a040, #e88030);
    border-radius: 3px 3px 0 0;
    transition: width 0.3s ease;
  }

  &:hover {
    color: #6b4f27;
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    color: #5a3e1a;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
    font-weight: 600;

    &::after {
      width: 60%;
    }
  }
}

.rank-content {
  padding: 12px;
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(139, 90, 43, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(139, 90, 43, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(139, 90, 43, 0.5);
    }
  }
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.3));
  border-radius: 8px;
  border: 1px solid rgba(184, 149, 106, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.5));
  }

  &.is-top {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 180, 0, 0.1));
    border-color: rgba(240, 160, 64, 0.4);
  }

  &:nth-child(1) {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.25), rgba(255, 180, 0, 0.15));
    border-color: rgba(240, 160, 64, 0.6);
    box-shadow: 0 2px 8px rgba(240, 160, 64, 0.2);
  }

  &:nth-child(2) {
    background: linear-gradient(135deg, rgba(192, 192, 192, 0.2), rgba(169, 169, 169, 0.1));
    border-color: rgba(169, 169, 169, 0.4);
  }

  &:nth-child(3) {
    background: linear-gradient(135deg, rgba(205, 127, 50, 0.2), rgba(184, 115, 51, 0.1));
    border-color: rgba(184, 115, 51, 0.4);
  }
}

.rank-position {
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rank-number {
  font-family: var(--font-cuyuan);
  font-size: 18px;
  color: #8b6f47;
  font-weight: 600;
}

.rank-avatar {
  flex-shrink: 0;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.rank-info {
  flex: 1;
  min-width: 0;
}

.rank-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-cuyuan);
  font-size: 14px;
  color: #4a3520;
  margin-bottom: 4px;
}

.rank-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #8b6f47;
}

.rank-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  min-width: 60px;
}

.score-value {
  font-family: var(--font-cuyuan);
  font-size: 22px;
  font-weight: 700;
  color: #d4501e;
  line-height: 1;
  text-shadow: 0 1px 2px rgba(212, 80, 30, 0.2);
}

.score-label {
  font-size: 11px;
  color: #a07040;
  margin-top: 2px;
}

.rank-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
  font-family: var(--font-cuyuan);
  font-size: 14px;
  color: #a08060;
}

.rank-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  font-family: var(--font-cuyuan);
  font-size: 14px;
  color: #8b6f47;
}

.rank-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
  font-family: var(--font-cuyuan);
  font-size: 14px;
  color: #a08060;
}

.rank-retry-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  margin-top: 8px;
  background: linear-gradient(to bottom, #d4b896, #c4a882);
  border: 1px solid #b8956a;
  border-radius: 6px;
  color: #5a3e1a;
  font-family: var(--font-cuyuan);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(to bottom, #e0c4a2, #d0b48e);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(139, 90, 43, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
}

</style>
