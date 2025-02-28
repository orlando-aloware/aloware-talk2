<template>
  <div class="user-display d-inline-flex align-items-center">
    <span v-if="isAiAgent" class="ai-effect-gradient-text">
      <sparkle-icon
        :width="iconSize"
        :height="iconSize"
        :color="iconColor"
      />
      {{ userName }}
    </span>
    <span v-else>
      {{ userName }}
    </span>
  </div>
</template>

<script>
import SparkleIcon from 'components/icons/ai/sparkle-bold-icon.vue'
import * as User from 'src/constants/user'
import { userMixin } from 'src/plugins/mixins'

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
      required: true
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
    user () {
      return this.getUser(this.userId)
    },

    userName () {
      return this.getUserName(this.user)
    },

    isAiAgent () {
      return this.user && this.user.type === User.TYPE_AI_AGENT
    }
  }
}
</script>

<style scoped>
.user-display {
  display: inline-flex;
  align-items: center;
}
</style>
