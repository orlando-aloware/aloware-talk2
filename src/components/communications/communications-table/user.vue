<template>
  <div class="ellipse"
       data-testid="user-row">
    <i class="fa-solid fa-users text-primary mr-1"
       :id="`teams-${_uid}`"
       v-if="row?.teams.length" />

    <b-popover triggers="hover"
               :target="`teams-${_uid}`"
               v-if="row?.teams.length">
      <span class="d-block mb-1 small">
        <strong>Teams of this user:</strong>
      </span>
      <span class="d-block mb-1"
            v-for="team in row.teams"
            :key="`team_${team}`">
        <span class="small">
          {{ team }}
        </span>
      </span>
    </b-popover>

    <span v-if="isAgent && value">
      {{ getUserName(getUser(value)) }}
    </span>
    <a target='_blank'
       :href="getUserURL(value)"
       v-else-if="value">
      {{ getUserName(getUser(value)) }}

      <q-tooltip>
        Click to go to user's page
      </q-tooltip>
    </a>
    <span v-else>
      -
    </span>
  </div>
</template>

<script>
import { userMixin, aclMixin, classicMixin } from 'src/plugins/mixins'

export default {
  name: 'User',

  mixins: [
    userMixin,
    aclMixin,
    classicMixin
  ],

  props: {
    value: {
      type: Number,
      required: false
    },

    row: {
      type: Object,
      required: true
    }
  }
}
</script>
