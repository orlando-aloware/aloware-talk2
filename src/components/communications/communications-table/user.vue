<template>
  <div class="ellipse"
       data-testid="user-row">
    <i class="fa-solid fa-users text-primary mr-1"
       :id="`teams-${_uid}`"
       v-if="row.teams?.length" />

    <b-popover triggers="hover"
               custom-class="talk-table__popover"
               :target="`teams-${_uid}`"
               v-if="row.teams?.length">
      <span class="d-block mb-1">
        <strong class="text-white">Teams of this user:</strong>
      </span>
      <span class="d-block mb-1"
            :key="`team_${team}`"
            v-for="team in row.teams">
        <span>
          {{ team }}
        </span>
      </span>
    </b-popover>

    <a href="#"
       :id="`comm-user-${_uid}`"
       v-if="row.user_id"
       :class="{ 'deleted': userName === 'Deleted User' }"
       @click.prevent="filter">
      <span v-if="getUser(row.user_id).type === User.TYPE_AI_AGENT"
        class="ai-effect-gradient-text">
        <sparkle-icon
          width="16"
          height="16"
          color="#9333EA"
        />
        {{ userName }}
      </span>
      <span v-else>
        {{ userName }}
      </span>
      <b-tooltip custom-class="talk-table__tooltip"
                 :target="`comm-user-${_uid}`">
        Click to filter by this user
      </b-tooltip>
    </a>
    <span v-else>
      -
    </span>
  </div>
</template>

<script>
import { userMixin } from 'src/plugins/mixins'
import * as User from 'src/constants/user'
import SparkleIcon from 'components/icons/ai/sparkle-bold-icon.vue'

export default {
  name: 'User',

  components: {
    SparkleIcon
  },

  mixins: [
    userMixin
  ],

  props: {
    row: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      User
    }
  },

  methods: {
    filter () {
      this.$emit('on-filter', {
        type: 'users',
        value: [this.row.user_id]
      })
    }
  },

  computed: {
    userName () {
      return this.getUserName(this.getUser(this.row.user_id))
    }
  }
}
</script>
