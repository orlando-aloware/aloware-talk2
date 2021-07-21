<template>
  <q-toolbar class="page-header pl-4 pr-4">
    <div class="d-flex h-100 align-items-center">
      <h1>{{ $route.name }}</h1>
    </div>
    <div class="ml-auto d-none d-lg-block h-100">
      <div class="d-flex h-100 align-items-center">
        <q-item>
          <q-item-section>
            <q-item-label class="text-regular _500">{{ user.profile.first_name }}</q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-btn-dropdown class="tab-dropdown"
                            menu-self="top right"
                            ref="menu"
                            :ripple="false"
                            :disabled="loadingAgentStatus || ['RECEIVED_CALL_INVITE', 'CALL_CONNECTED'].includes(dialer.currentStatus)"
                            auto-close
                            flat>
              <template v-slot:label>
                <q-avatar size="34px"
                          v-if="user.profile"
                          class="has-text-light"
                          :style="avatarStyle(user.profile.name)">
                  {{ user.profile.name | fixName | initials }}
                  <q-badge :color="color"
                           class="availability-status"
                           floating>
                  </q-badge>
                </q-avatar>
              </template>

              <q-list class="tab-dropdown-list no-select">
                <q-item @click="changeStatus(AgentStatus.AGENT_STATUS_OFFLINE)"
                        :class="[agentStatus === AgentStatus.AGENT_STATUS_OFFLINE ? 'has-text-link has-text-weight-medium' : '']"
                        clickable>
                  <q-item-section>Offline</q-item-section>
                </q-item>

                <q-item @click="changeStatus(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS)"
                        :class="[agentStatus === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS ? 'has-text-link has-text-weight-medium' : '']"
                        clickable>
                  <q-item-section>Available</q-item-section>
                </q-item>

                <q-item @click="changeStatus(AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS)"
                        :class="[agentStatus === AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS ? 'has-text-link has-text-weight-medium' : '']"
                        clickable>
                  <q-item-section>Busy</q-item-section>
                </q-item>

                <q-item @click="changeStatus(AgentStatus.AGENT_STATUS_ON_BREAK)"
                        :class="[agentStatus === AgentStatus.AGENT_STATUS_ON_BREAK ? 'has-text-link has-text-weight-medium' : '']"
                        clickable>
                  <q-item-section>On-break</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-item-section>
        </q-item>

        <q-separator class="height-28 ml-3 mr-3 margin-auto position-relative"
                     vertical>
        </q-separator>

        <q-item>
          <q-btn :ripple="false"
                 :icon="dialerIcon"
                 size="40px"
                 padding="none"
                 align="center"
                 flat
                 @click="toggleDialer">
          </q-btn>
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
import * as AgentStatus from '../../constants/agent-status'
import { aclMixin, agentMixin, avatarMixin } from 'src/plugins/mixins'

export default {
  name: 'app-header',

  mixins: [aclMixin, avatarMixin, agentMixin],

  data () {
    return {
      dialerIcon: 'img:app-icons/header/dialer_gray.svg',
      dialerStatus: false,
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
    },

    toggleDialer () {
      this.dialerStatus = !this.dialerStatus
      this.dialerIcon = this.dialerStatus ? 'img:app-icons/header/dialer_active.svg' : 'img:app-icons/header/dialer_gray.svg'
      this.$emit('toggleDialer')
    },

    changeStatus (status) {
      this.changeAgentStatus(status)
      this.$refs.menu.hide()
    }
  }
}
</script>
