<template>
  <div class="d-flex flex-column"
       data-testid="user-row">
    <router-link class="ellipse"
                 target='_blank'
                 :to="broadcastActivityParams"
                 v-if="isBroadcastAllowed && broadcast.id">
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
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'Broadcast',

  mixins: [
    aclMixin
  ],

  props: {
    value: {
      type: Number,
      required: false
    }
  },

  computed: {
    ...mapState(['broadcasts']),

    ...mapState('auth', [
      'profile'
    ]),

    broadcast () {
      return this.broadcasts.find(broadcast => broadcast.id === this.value) || {}
    },

    isBroadcastAllowed () {
      const isCompanyEnabled = this.profile.bulk_rvm_enabled || this.profile.bulk_sms_enabled
      const isUserEnabled = this.hasPermissionTo('create broadcast message') || this.hasPermissionTo('create broadcast rvm')

      return !this.isAgent && isUserEnabled && isCompanyEnabled
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
