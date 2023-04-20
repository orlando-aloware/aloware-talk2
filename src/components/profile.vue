<template>
  <q-item v-if="profile"
          class="menu-avatar-wrapper">
    <q-item-section class="profile-menu"
                    avatar>
      <q-btn-dropdown content-class="tab-avatar-menu"
                      class="tab-dropdown"
                      ref="menu"
                      flat
                      :ripple="false"
                      :disabled="isProfileDropdownDisabled"
                      :menu-offset="[4, 16]">
        <template v-slot:label>
          <q-item-section class="contact-info-wrapper"
                          v-if="!hideProfileInfo">
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
          <q-avatar v-if="profile"
                    size="34px"
                    :style="avatarStyle(profile.name)">
            <div class="avatar-initials">
              {{ profile.name | fixName | initials }}
            </div>
            <q-badge :color="color(profile.agent_status)"
                     class="availability-status"
                     floating>
            </q-badge>
          </q-avatar>
        </template>

        <q-list class="tab-dropdown-list no-select">
          <q-item dense
                  clickable
                  v-close-popup
                  :class="[agentStatus === AgentStatus.AGENT_STATUS_OFFLINE ? 'cursor-inherit' : '']"
                  @click="changeStatus(AgentStatus.AGENT_STATUS_OFFLINE)">
            <div class="d-flex align-items-center justify-content-between w-100">
              <div>
                <q-badge :color="color(AgentStatus.AGENT_STATUS_OFFLINE)"
                         class="rounded-badge bordered q-mr-sm ">
                </q-badge>
                <span class="user-status-name">Offline</span>
              </div>
              <div v-if="agentStatus === AgentStatus.AGENT_STATUS_OFFLINE">
                <i class="fa fa-check fs-12"
                   :class="[agentStatus === AgentStatus.AGENT_STATUS_OFFLINE ? 'text-primary' : '']"></i>
              </div>
            </div>
          </q-item>

          <q-item dense
                  clickable
                  v-close-popup
                  :class="[agentStatus === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS ? 'cursor-inherit' : '']"
                  @click="changeStatus(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS)">
            <div class="d-flex align-items-center justify-content-between w-100">
              <div>
                <q-badge :color="color(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS)"
                         class="rounded-badge bordered q-mr-sm mt-1 ">
                </q-badge>
                <span class="user-status-name">Available</span>
              </div>
              <div v-if="agentStatus === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS">
                <i class="fa fa-check fs-12"
                   :class="[agentStatus === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS ? 'text-primary' : '']"></i>
              </div>
            </div>
          </q-item>

          <q-item dense
                  clickable
                  v-close-popup
                  :disable="profile.company.force_users_always_available && !hasRole('Company Admin')"
                  :class="[agentStatus === AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS ? 'cursor-inherit' : '']"
                  @click="changeStatus(AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS)">
            <div class="d-flex align-items-center justify-content-between w-100">
              <div>
                <q-badge :color="color(AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS)"
                         class="rounded-badge bordered q-mr-sm ">
                </q-badge>
                <span class="user-status-name">Busy</span>
              </div>
              <div v-if="agentStatus === AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS">
                <i class="fa fa-check fs-12"
                   :class="[agentStatus === AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS ? 'text-primary' : '']"></i>
              </div>
            </div>
            <q-tooltip v-if="profile.company.force_users_always_available && !hasRole('Company Admin')"
                       anchor="top middle"
                       self="center middle">
              <q-badge color="teal"
                       class="disabled-user-status">
                Forced at Account Level
              </q-badge>
            </q-tooltip>
          </q-item>

          <q-item dense
                  clickable
                  v-close-popup
                  :class="[agentStatus === AgentStatus.AGENT_STATUS_ON_BREAK ? 'cursor-inherit' : '']"
                  :disable="profile.company.force_users_always_available && !hasRole('Company Admin')"
                  @click="changeStatus(AgentStatus.AGENT_STATUS_ON_BREAK)">
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
            <q-tooltip v-if="profile.company.force_users_always_available && !hasRole('Company Admin')"
                       anchor="top middle"
                       self="center middle">
              <q-badge color="teal"
                       class="disabled-user-status">
                Forced at Account Level
              </q-badge>
            </q-tooltip>
          </q-item>

          <q-separator class="mt-1 mb-1"></q-separator>
          <q-item dense
                  clickable
                  @click="toggleSleepMode">
            <q-item-section>
              <q-skeleton type="rect"
                          v-if="togglingSleepMode" />
              <div v-else>
                <half-moon-icon :color="!profile.sleep_mode ? '#9B51E0' : '#040404'"
                                class="focus-mode-icon"
                                width="12"
                                height="12">
                </half-moon-icon>
                <span>Turn Notifications</span>
                <span class="user-notification-status _800"> {{ profile.sleep_mode ? 'On' : 'Off' }}</span>
              </div>
            </q-item-section>
          </q-item>
          <q-item dense
                  clickable
                  v-close-popup
                  @click="logoutAction">
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

  props: {
    hideProfileInfo: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      AgentStatus,
      togglingSleepMode: false
    }
  },

  computed: {
    ...mapState(['dialer', 'campaigns']),

    ...mapState('cache', ['currentCompany']),

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

    isAgentOnCall () {
      return this.agentStatus === AgentStatus.AGENT_STATUS_ON_CALL
    },

    personalPhoneNumber () {
      const found = this.campaigns.find(campaign => campaign.id === this.profile.campaign_id)

      if (found && found.incoming_numbers.length) {
        return found.incoming_numbers[0].phone_number
      }

      return ''
    },

    isProfileDropdownDisabled () {
      const isForcedCallDisposition = this.currentCompany && this.currentCompany.force_call_disposition
      const isForcedContactDisposition = this.currentCompany && this.currentCompany.force_contact_disposition
      const isForcedDispositionOnWrapUp = (isForcedCallDisposition || isForcedContactDisposition) &&
        this.dialer.currentStatus === 'WRAP_UP'

      return this.loadingAgentStatus ||
        ['RECEIVED_CALL_INVITE', 'MAKING_CALL', 'CALL_CONNECTED'].includes(this.dialer.currentStatus) ||
        this.isAgentOnCall || isForcedDispositionOnWrapUp
    }
  },

  methods: {
    ...mapActions('auth', ['logout', 'setProfile']),

    ...mapActions(['resetVuex']),

    changeStatus (status) {
      if (this.agentStatus === status) {
        return
      }

      this.changeAgentStatus(status)
    },

    hideMenu () {
      if (this.$refs && this.$refs.menu) {
        this.$refs.menu.hide()
      }
    },

    toggleSleepMode () {
      this.togglingSleepMode = true

      talk2Api.V1.profile.store({ sleep_mode: !this.profile.sleep_mode }).then(response => {
        this.setProfile({ ...this.profile, sleep_mode: response.data.sleep_mode })
        this.togglingSleepMode = false
      }).catch((err) => {
        this.togglingSleepMode = false
        this.$handleErrors(err.response)
      })
    },

    logoutAction () {
      try {
        this.hideMenu()
        this.logout()
          .then(() => {
            this.resetVuex(['all'])
            this.$router.push({ name: 'Login' })
          })
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>
