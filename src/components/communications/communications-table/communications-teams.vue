<template>
  <div class="d-flex flex-column truncate-chip-labels"
       v-if="teams?.length">
    {{ firstTeam }}
    <span class="text-primary ml-1 cursor-pointer"
          v-if="restOfTeams.length"
          :id="`teams-more-${_uid}`"
    >
      + {{ restOfTeams.length }} more
    </span>
    <b-popover triggers="hover"
               :target="`teams-more-${_uid}`"
               v-if="restOfTeams.length">
      <span class="d-block mb-1"
            v-for="team in restOfTeams"
            :key="`team_${team}`"
      >
        <span class="small"> {{ team }} </span>
      </span>
    </b-popover>
  </div>
  <span v-else> - </span>
</template>
<script>
import { first } from 'lodash'

export default {
  name: 'CommunicationsTeams',

  props: {
    teams: {
      type: Array,
      default: () => ([]),
      required: true
    }
  },
  computed: {
    firstTeam () {
      return first(this.teams) || {}
    },
    restOfTeams () {
      return this.teams.slice(1)
    }
  }
}
</script>
