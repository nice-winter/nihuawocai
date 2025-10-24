<template>
  <div class="room-list__item">
    <div class="wrapper select-none">
      <div class="base-info">
        <UAvatar class="avatar author-avatar" :src="players[0]?.avatar" />
        <UTooltip text="非公开房间" :delay-duration="100" :content="{ side: 'right' }" arrow>
          <UIcon
            v-show="locked"
            name="ph:lock-simple-fill"
            class="size-4"
            style="position: absolute; left: 4.5rem; top: 0; color: #f4b12d"
          />
        </UTooltip>
        <UiGameMainRoomNumber :room-number="roomNumber || 0" style="float: right" />
        <span class="author-nickname">
          <UIcon
            :name="players[0]?.gender ? `ph:gender-female-bold` : `ph:gender-male-bold`"
            class="size-4"
            style="vertical-align: text-bottom"
            :style="{
              color: players[0]?.gender ? `#ff7cb2` : `rgb(94 191 255)`
            }"
          />
          {{ players[0]?.nickname }}
        </span>
      </div>
      <div class="players">
        <template v-for="i in 6" :key="players[i]?.uuid">
          <UAvatar
            v-if="players[i] && players[i].avatar"
            class="avatar players-avatar"
            :src="players[i].avatar"
          />
          <span
            v-else
            style="display: inline-block; width: 46px; height: 46px; background-color: #ddc9a9"
          />
        </template>
      </div>
      <div class="actions">
        <UiButton v-show="!playing" size="xl" color="red" :disabled="players.length >= 7">
          加ㅤ入
        </UiButton>

        <UiButton v-show="playing" size="xl" color="playing" :disabled="onlookers.length >= 5">
          旁观ㅤ{{ onlookers.length }}/5
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Player } from '~/interfaces/player'
import type { RoomListItemProps } from '~/interfaces/room'

const {
  roomNumber = undefined,
  players = [],
  onlookers = [],
  playing = false,
  locked = false
} = defineProps<RoomListItemProps>()
</script>

<style scoped>
.room-list__item {
  padding: 0.785rem;
  width: 50%;
}

.wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;

  & > .base-info {
    position: relative;

    span.author-avatar {
      width: 64px;
      height: 64px;
    }

    span.author-nickname {
      position: absolute;
      right: 0;
      bottom: 0;
      font-size: 14px;
      line-height: 14px;
    }
  }

  & > .players {
    display: flex;
    justify-content: space-between;

    .avatar {
      width: 46px;
      height: 46px;
    }
  }

  & > .actions {
    padding-left: 1.5px;
  }
}
</style>
