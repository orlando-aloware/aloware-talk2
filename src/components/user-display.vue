<template>
  <div class="user-display d-inline-flex align-items-center">
    <span class="ai-effect-gradient-text"
          v-if="isAiAgent"
          :class="{ 'deleted-user': isDeletedUser }">
      <sparkle-icon :width="iconSize"
                    :height="iconSize"
                    :color="iconColor"
      />
      {{ userName }}
    </span>
    <span v-else :class="{ 'deleted-user': isDeletedUser }">
      {{ userName }}
    </span>
  </div>
</template>

<script>
import SparkleIcon from 'components/icons/ai/sparkle-bold-icon.vue'
import * as User from 'src/constants/user'
import { userMixin } from 'src/plugins/mixins'
import { isDeleted, removeDeletedSuffix } from 'src/plugins/helpers/deleted-entities'

export default {
  name: 'UserDisplay',

  components: {
    SparkleIcon
  },

  mixins: [
    userMixin
  ],

  props: {
    userId: {
      type: [Number, String],
      required: false,
      default: null
    },
    user: {
      type: Object,
      default: null
    },
    iconSize: {
      type: [Number, String],
      default: 16
    },
    iconColor: {
      type: String,
      default: '#9333EA'
    },
    clickable: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    displayUser () {
      if (this.user) {
        return this.user
      }
      if (this.userId) {
        return this.getUser(this.userId)
      }
      return null
    },

    userName () {
      if (!this.displayUser) {
        return '-'
      }
      const name = this.getUserName(this.displayUser)
      // Clean up deleted suffix from user names
      return removeDeletedSuffix(name)
    },

    isDeletedUser () {
      return isDeleted(this.displayUser)
    },

    isAiAgent () {
      return this.displayUser && this.displayUser.type === User.TYPE_AI_AGENT
    }
  }
}
</script>

<style scoped>
.user-display {
  display: inline-flex;
  align-items: center;
}

.deleted-user {
  opacity: 0.6;
  font-style: italic;
}
</style>
