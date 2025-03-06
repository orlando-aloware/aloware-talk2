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
      <user-display :user-id="row.user_id" />
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
import UserDisplay from 'src/components/user-display.vue'

export default {
  name: 'User',

  components: {
    UserDisplay
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
