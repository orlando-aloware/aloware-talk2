<template>
  <q-item v-if="profile">
    <q-item-section>
      <q-item-label class="text-regular _500">{{ profile.first_name }}</q-item-label>
    </q-item-section>
    <q-item-section class="profile-menu"
                    avatar>
      <q-btn-dropdown :ripple="false"
                      :disabled="loadingAgentStatus || ['RECEIVED_CALL_INVITE', 'MAKING_CALL', 'CALL_CONNECTED'].includes(dialer.currentStatus)"
                      :menu-offset="[4, 16]"
                      class="tab-dropdown"
                      ref="menu"
                      auto-close
                      flat>
        <template v-slot:label>
          <q-avatar size="34px"
                    v-if="profile"
                    :style="avatarStyle(profile.name)">
            {{ profile.name | fixName | initials }}
            <q-badge :color="color(profile.agent_status)"
                     class="availability-status"
                     floating>
            </q-badge>
          </q-avatar>
        </template>

        <q-list class="tab-dropdown-list no-select">
          <q-item @click="changeStatus(AgentStatus.AGENT_STATUS_OFFLINE)"
                  :class="[agentStatus === AgentStatus.AGENT_STATUS_OFFLINE ? 'text-primary _500' : '']"
                  dense
                  clickable>
            <div class="d-flex align-items-center">
              <q-badge :color="color(AgentStatus.AGENT_STATUS_OFFLINE)"
                       class="rounded-badge bordered q-mr-sm">
              </q-badge>
              Offline
            </div>
          </q-item>

          <q-item @click="changeStatus(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS)"
                  :class="[agentStatus === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS ? 'text-primary _500' : '']"
                  dense
                  clickable>
            <div class="d-flex align-items-center">
              <q-badge :color="color(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS)"
                       class="rounded-badge bordered q-mr-sm">
              </q-badge>
              Available
            </div>
          </q-item>

          <q-item @click="changeStatus(AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS)"
                  :class="[agentStatus === AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS ? 'text-primary _500' : '']"
                  dense
                  clickable>
            <div class="d-flex align-items-center">
              <q-badge :color="color(AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS)"
                       class="rounded-badge bordered q-mr-sm">
              </q-badge>
              Busy
            </div>
          </q-item>

          <q-item @click="changeStatus(AgentStatus.AGENT_STATUS_ON_BREAK)"
                  :class="[agentStatus === AgentStatus.AGENT_STATUS_ON_BREAK ? 'text-primary _500' : '']"
                  dense
                  clickable>
            <div class="d-flex align-items-center">
              <q-badge :color="color(AgentStatus.AGENT_STATUS_ON_BREAK)"
                       class="rounded-badge bordered q-mr-sm">
              </q-badge>
              On-break
            </div>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </q-item-section>
  </q-item>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { aclMixin, agentMixin, avatarMixin } from 'src/plugins/mixins'
import * as AgentStatus from 'src/constants/agent-status'

export default {
  name: 'profile',

  mixins: [aclMixin, avatarMixin, agentMixin],

  data () {
    return {
      AgentStatus
    }
  },

  computed: {
    ...mapState(['dialer', 'campaigns']),
    ...mapGetters('auth', ['profile']),

    statusLabel () {
      switch (this.agentStatus) {
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

    personalPhoneNumber () {
      let found = this.campaigns.find(campaign => campaign.id === this.profile.campaign_id)
      if (found && found.incoming_numbers.length) {
        return found.incoming_numbers[0].phone_number
      }
      return ''
    }
  },

  methods: {
    changeStatus (status) {
      this.changeAgentStatus(status)
      this.$refs.menu.hide()
    }
  }
}
</script>
