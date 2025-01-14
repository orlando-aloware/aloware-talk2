<template>
  <div class="d-flex flex-column"
       data-testid="user-row">
    <router-link class="ellipse"
                 target='_blank'
                 :to="broadcastActivityParams"
                 v-if="broadcast.id">
      {{ broadcast.name || '-' }}
      <q-tooltip>
        Click to see Broadcast activity's page
      </q-tooltip>
    </router-link>
    <span v-else>
      -
    </span>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Broadcast',

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
