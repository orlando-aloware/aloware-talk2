<template>
  <q-item v-if="profile" class="menu-avatar-wrapper">
    <q-item-section class="profile-menu"
                    avatar>
      <q-btn-dropdown :ripple="false"
                      :disabled="loadingAgentStatus || ['RECEIVED_CALL_INVITE', 'MAKING_CALL', 'CALL_CONNECTED'].includes(dialer.currentStatus)"
                      :menu-offset="[4, 16]"
                      content-class="tab-avatar-menu"
                      class="tab-dropdown"
                      ref="menu"
                      flat>
        <template v-slot:label>
          <q-item-section class="contact-info-wrapper">
            <q-item-label class="text-regular _600 user-full-name">{{ profile.full_name }}
              <half-moon-icon v-if="profile.sleep_mode"
                              color="#9B51E0"
                              class="focus-mode-icon"
                              width="12"
                              height="12">
              </half-moon-icon>
            </q-item-label>
            <q-item-label class="text-regular _500 user-company-name text-right">{{ profile.company_name }}</q-item-label>
          </q-item-section>
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
                  dense
                  clickable>
            <div class="d-flex align-items-center justify-content-between w-100">
              <div>
                <q-badge :color="color(AgentStatus.AGENT_STATUS_OFFLINE)"
                         class="rounded-badge bordered q-mr-sm ">
                </q-badge>
                <span class="user-status-name">Offline</span>
              </div>
              <div v-if="agentStatus === AgentStatus.AGENT_STATUS_OFFLINE">
                <i class="fa fa-check fs-12" :class="[agentStatus === AgentStatus.AGENT_STATUS_OFFLINE ? 'text-primary' : '']"></i>
              </div>
            </div>
          </q-item>

          <q-item @click="changeStatus(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS)"
                  dense
                  clickable>
            <div class="d-flex align-items-center justify-content-between w-100">
              <div>set
                <q-badge :color="color(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS)"
                         class="rounded-badge bordered q-mr-sm mt-1 ">
                </q-badge>
                <span class="user-status-name">Available</span>
              </div>
              <div v-if="agentStatus === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS">
                <i class="fa fa-check fs-12" :class="[agentStatus === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS ? 'text-primary' : '']"></i>
              </div>
            </div>
          </q-item>

          <q-item @click="changeStatus(AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS)"
                  dense
                  clickable>
            <div class="d-flex align-items-center justify-content-between w-100">
              <div>
                <q-badge :color="color(AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS)"
                         class="rounded-badge bordered q-mr-sm ">
                </q-badge>
                <span class="user-status-name">Busy</span>
              </div>
              <div v-if="agentStatus === AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS">
                <i class="fa fa-check fs-12" :class="[agentStatus === AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS ? 'text-primary' : '']"></i>
              </div>
            </div>
          </q-item>

          <q-item @click="changeStatus(AgentStatus.AGENT_STATUS_ON_BREAK)"
                  dense
                  clickable>
            <div class="d-flex align-items-center justify-content-between w-100">
              <div>
                <q-badge :color="color(AgentStatus.AGENT_STATUS_ON_BREAK)"
                         class="rounded-badge bordered q-mr-sm ">
                </q-badge>
                <span class="user-status-name">On-break</span>
              </div>
              <div v-if="agentStatus === AgentStatus.AGENT_STATUS_ON_BREAK">
                <i class="fa fa-check fs-12" :class="[agentStatus === AgentStatus.AGENT_STATUS_ON_BREAK ? 'text-primary' : '']"></i>
              </div>
            </div>
          </q-item>

          <q-separator class="mt-1 mb-1"></q-separator>
          <q-item dense
                  clickable
                  @click="toggleSleepMode">
            <q-item-section>
              <div>
                <half-moon-icon :color="!profile.sleep_mode ? '#9B51E0' : '#040404'"
                                class="focus-mode-icon"
                                width="12"
                                height="12">
                </half-moon-icon>
                <span>Turn Notifications</span>
                <span class="user-notification-status _800"> {{ profile.sleep_mode ? 'Off' : 'Off' }}</span>
              </div>
            </q-item-section>
          </q-item>
          <q-item @click="logoutAction"
                  dense
                  clickable>
            <q-item-section>
              <div class="text-red-80">
                <logout-icon width="15"
                             height="15"
                             class="logout-icon" />
                <span>Logout</span>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </q-item-section>
  </q-item>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import { aclMixin, agentMixin, avatarMixin } from 'src/plugins/mixins'
import * as AgentStatus from 'src/constants/agent-status'
import LogoutIcon from 'components/icons/logout-icon'
import HalfMoonIcon from 'components/icons/half-moon-icon'
import talk2Api from 'src/plugins/api/api'

export default {
  name: 'profile',
  components: { HalfMoonIcon, LogoutIcon },
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
    ...mapActions('auth', ['logout', 'setProfile']),
    ...mapActions('stats', ['resetStatVuex']),
    ...mapActions(['resetVuex']),
    changeStatus (status) {
      this.changeAgentStatus(status)
    },

    hideMenu () {
      if (this.$refs && this.$refs.menu) {
        this.$refs.menu.hide()
      }
    },

    toggleSleepMode () {
      talk2Api.V1.profile.store({ sleep_mode: !this.profile.sleep_mode }).then(response => {
        this.setProfile({ ...this.profile, sleep_mode: response.data.sleep_mode })
      })
      this.hideMenu()
    },

    logoutAction () {
      try {
        this.hideMenu()
        const response = this.logout()
        response.then(() => {
          this.response = response?.data
          this.resetVuex()
          this.resetStatVuex()
          this.$router.push({ name: 'Login' })
        })
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>
