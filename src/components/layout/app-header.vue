<template>
  <q-toolbar class="page-header pl-4 pr-4">
    <div class="d-flex h-100 align-items-center">
      <h1>{{ $route.name }}</h1>
    </div>
    <div class="ml-auto d-none d-lg-block">
      <div class="d-flex h-100 align-items-center">
        <q-item>
          <q-item-section>
            <q-item-label class="text-regular _500">{{ user.profile.name }}</q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <avatar :name="user.profile.name"
                    width="34"
                    height="34">
            </avatar>
          </q-item-section>
        </q-item>
      </div>
    </div>
    <div class="ml-auto d-block d-sm-none">
      <div class="d-flex h-100 align-items-center">

      </div>
    </div>
  </q-toolbar>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Avatar from 'components/avatar.vue'
import * as AgentStatus from '../../constants/agent-status'

export default {
  name: 'app-header',

  components: {
    Avatar
  },

  data () {
    return {
      AgentStatus
    }
  },

  computed: {
    ...mapState(['dialer', 'campaigns']),
    ...mapGetters('auth', ['user']),

    statusLabel () {
      switch (this.user.profile.agent_status) {
        case AgentStatus.AGENT_STATUS_OFFLINE:
          return 'Offline'
        case AgentStatus.AGENT_STATUS_ACCEPTING_CALLS:
          return 'Available'
        case AgentStatus.AGENT_STATUS_ON_BREAK:
          return 'On-break'
        case AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS:
        case AgentStatus.AGENT_STATUS_ON_CALL:
        case AgentStatus.AGENT_STATUS_ON_WRAP_UP:
        case AgentStatus.AGENT_STATUS_RINGING:
        case AgentStatus.AGENT_STATUS_AUTO_DIAL:
        case AgentStatus.AGENT_STATUS_SENTRY:
          return 'Busy'
        default:
          return 'Offline'
      }
    },

    phoneNumber () {
      let found = this.campaigns.find(campaign => campaign.id === this.user.profile.campaign_id)
      if (found && found.incoming_numbers.length) {
        return found.incoming_numbers[0].phone_number
      }
      return ''
    }
  },

  methods: {
    toggleSidebar () {
      this.$emit('toggleSidebar')
    }
  }
}
</script>
