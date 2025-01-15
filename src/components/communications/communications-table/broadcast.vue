<template>
  <div class="d-flex flex-column"
       data-testid="user-row">
    <router-link class="ellipse"
                 target='_blank'
                 :to="broadcastActivityParams"
                 v-if="canUseBroadcast && broadcast.id">
      {{ broadcast.name || '-' }}
      <q-tooltip>
        Click to see Broadcast activity's page
      </q-tooltip>
    </router-link>
    <span v-else-if="broadcast.id">
      {{ broadcast.name || '-' }}
    </span>
    <span v-else>
      -
    </span>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { broadcastsMixin } from 'src/plugins/mixins'

export default {
  name: 'Broadcast',

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

    broadcast () {
      return this.broadcasts.find(broadcast => broadcast.id === this.value) || {}
    },

    broadcastActivityParams () {
      return {
        name: 'Inbox Channel',
        params: {
          channel: 'all-communications'
        },
        query: {
          broadcastIds: this.value
        }
      }
    }
  }
}
</script>
