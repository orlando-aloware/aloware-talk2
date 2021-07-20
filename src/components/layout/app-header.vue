<template>
  <q-toolbar class="page-header">
    <div class="d-flex h-100 align-items-center">
      <div class="page-title font-weight-bold">
        {{ $route.name }}
      </div>
    </div>
    <div class="ml-auto d-none d-lg-block">
      <div class="d-flex h-100 align-items-center">

      </div>
    </div>
    <div class="ml-auto d-block d-sm-none">
      <div class="d-flex h-100 align-items-center">

      </div>
    </div>
  </q-toolbar>
</template>

<script>
import * as AgentStatus from '../../constants/agent-status'
import { avatarMixin } from '../../boot/mixins'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'app-header',
  mixins: [
    avatarMixin
  ],
  data () {
    return {
      pageIcons: {
        inbox: 'app-icons/menu/inbox_green.svg',
        contacts: 'app-icons/menu/contacts_green.svg',
        powerdialer: 'app-icons/menu/powerdialer_green.svg',
        dashboard: 'app-icons/menu/dashboard_green.svg',
        account: 'app-icons/menu/account_green.svg',
        settings: 'app-icons/menu/settings_green.svg'
      },
      pageIcon: null,
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

  created () {
    this.updatePageIcon()
  },

  methods: {
    updatePageIcon () {
      if (this.$route.name) {
        let pageIndex = this.$route.name.toLowerCase().replace(' ', '')
        this.pageIcon = this.pageIcons[pageIndex]
      }
    },

    toggleSidebar () {
      this.$emit('toggleSidebar')
    }
  },

  watch: {
    '$route.name': function () {
      this.updatePageIcon()
    }
  }
}
</script>
