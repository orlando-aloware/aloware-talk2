<template>
  <div class="d-flex flex-column"
       data-testid="user-row">
    <router-link class="ellipse"
                 target='_blank'
                 :id="`comm-broadcast-${_uid}`"
                 :to="broadcastActivityParams"
                 v-if="canUseBroadcast && broadcast.id">
      <external-link-icon color="#1976D2"/>
      {{ broadcastName }}

      <b-tooltip custom-class="talk-table__tooltip"
                 :target="`comm-broadcast-${_uid}`">
        Click to see Broadcast activity's page
      </b-tooltip>
    </router-link>
    <span class="ellipse"
          v-else-if="broadcast.id">
      {{ broadcastName }}
    </span>
    <span v-else>
      -
    </span>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { broadcastsMixin } from 'src/plugins/mixins'
import ExternalLinkIcon from 'components/icons/external-link-icon.vue'

export default {
  name: 'Broadcast',

  components: {
    ExternalLinkIcon
  },

  mixins: [
    broadcastsMixin
  ],

  props: {
    value: {
      type: Number,
      required: false
    }
  },

  computed: {
    ...mapState(['broadcasts']),
    ...mapState('cache', ['currentCompany']),

    broadcast () {
      return this.broadcasts.find(broadcast => broadcast.id === this.value) || {}
    },

    broadcastName () {
      return this.broadcast.name || ''
    },

    broadcastActivityParams () {
      const broadcastIds = this.value ? [this.value] : []

      if (this.currentCompany?.enable_legacy_inbox) {
        return {
          name: 'Inbox Channel',
          params: {
            channel: 'all-communications'
          },
          query: {
            broadcastIds
          }
        }
      }

      return {
        path: '/communications/all',
        query: {
          to_date: 'null',
          from_date: 'null',
          date_range: 'All Time',
          broadcasts: broadcastIds.join(',')
        }
      }
    }
  }
}
</script>
