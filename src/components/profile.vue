<template>
  <q-item v-if="profile"
          data-testid="profile-item"
          class="menu-avatar-wrapper">
    <q-item-section class="profile-menu"
                    data-testid="profile-item-section"
                    avatar>
      <q-btn-dropdown content-class="tab-avatar-menu"
                      class="tab-dropdown"
                      ref="menu"
                      flat
                      data-testid="profile-dropdown"
                      :ripple="false"
                      :disabled="isProfileDropdownDisabled"
                      :menu-offset="[4, 16]">
        <template v-slot:label>
          <q-item-section class="contact-info-wrapper"
                          data-testid="contact-info-wrapper-template"
                          v-if="!hideProfileInfo">
            <q-item-label class="text-regular _600 user-full-name">{{ profile.full_name }}
              <half-moon-icon color="#9B51E0"
                              class="focus-mode-icon"
                              width="12"
                              height="12"
                              data-testid="contact-info-moon-icon-template"
                              v-if="profile.sleep_mode">
              </half-moon-icon>
            </q-item-label>
            <q-item-label class="text-regular _500 user-company-name text-right"
                          data-testid="contact-info-company-name-label-template">
                          {{ profile.company_name }}
            </q-item-label>
          </q-item-section>
          <q-avatar v-if="profile"
                    size="34px"
                    data-testid="profile-name-vatar"
                    :style="avatarStyle(profile?.name)">
            <div class="avatar-initials">
              {{ profile?.name | fixName | initials }}
            </div>
            <q-badge :color="color(profile.agent_status)"
                     class="availability-status"
                     data-testid="profile-availability-status-badge"
                     floating>
            </q-badge>
          </q-avatar>
        </template>

        <q-list class="tab-dropdown-list no-select">
          <q-item class="contact-info-wrapper"
                  dense
                  data-testid="contact-info-wrapper-item"
                  v-if="hideProfileInfo">
            <div class="d-flex flex-column">
              <span class="text-regular _600 user-full-name w-100">{{ profile.full_name }}
                <half-moon-icon color="#9B51E0"
                                class="focus-mode-icon"
                                width="12"
                                height="12"
                                data-testid="contact-info-focus-moon-icon"
                                v-if="profile.sleep_mode">
                </half-moon-icon>
              </span>
              <span class="text-xs user-company-name w-100"
                    data-testid="contact-info-company-name-span">
                    {{ profile.company_name }}
              </span>
            </div>
          </q-item>

          <q-separator class="mt-3 mb-1"
                       data-testid="profile-separator-1"
                       v-if="hideProfileInfo"/>

          <q-item dense
                  v-if="profile.campaign_id && campaigns.length">
            <div class="d-flex flex-column">
              <span>
                {{ userPersonalLine?.name }}
              </span>
              <span class="text-grey-90 text-sm">
                Number: {{ userPersonalLine?.incoming_number | fixPhone('NATIONAL', true, false, true) }}
              </span>
            </div>
          </q-item>

          <q-separator class="mt-3 mb-1"
                       data-testid="profile-separator-2"
                       v-if="profile.campaign_id && campaigns.length"/>

          <q-item dense
                  clickable
                  v-close-popup
                  :class="[agentStatus === AgentStatus.AGENT_STATUS_OFFLINE ? 'cursor-inherit' : '']"
                  data-testid="profile-offline-time"
                  @click="changeStatus(AgentStatus.AGENT_STATUS_OFFLINE)">
            <div class="d-flex align-items-center justify-content-between w-100">
              <div>
                <q-badge :color="color(AgentStatus.AGENT_STATUS_OFFLINE)"
                         data-testid="profile-status-badge"
                         class="rounded-badge bordered q-mr-sm ">
                </q-badge>
                <span class="user-status-name">Offline</span>
              </div>
              <div v-if="agentStatus === AgentStatus.AGENT_STATUS_OFFLINE">
                <i class="fa fa-check fs-12"
                   data-testid="profile-offline-check"
                   :class="[agentStatus === AgentStatus.AGENT_STATUS_OFFLINE ? 'text-primary' : '']"></i>
              </div>
            </div>
          </q-item>

          <q-item dense
                  clickable
                  v-close-popup
                  :class="[agentStatus === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS ? 'cursor-inherit' : '']"
                  data-testid="profile-available-calls"
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
                   data-testid="profile-available-check"
                   :class="[agentStatus === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS ? 'text-primary' : '']"></i>
              </div>
            </div>
          </q-item>

          <q-item dense
                  clickable
                  v-close-popup
                  :disable="profile.company.force_users_always_available && !hasRole('Company Admin')"
                  :class="[agentStatus === AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS ? 'cursor-inherit' : '']"
                  data-testid="profile-busy-calls"
                  @click="changeStatus(AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS)">
            <div class="d-flex align-items-center justify-content-between w-100">
              <div>
                <q-badge :color="color(AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS)"
                         data-testid="profile-busy-badge"
                         class="rounded-badge bordered q-mr-sm ">
                </q-badge>
                <span class="user-status-name">Busy</span>
              </div>
              <div v-if="agentStatus === AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS">
                <i class="fa fa-check fs-12"
                   data-testid="profile-busy-check"
                   :class="[agentStatus === AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS ? 'text-primary' : '']"></i>
              </div>
            </div>
            <q-tooltip v-if="profile.company.force_users_always_available && !hasRole('Company Admin')"
                       anchor="top middle"
                       data-testid="profile-busy-tooltip"
                       self="center middle">
              <q-badge color="teal"
                       data-testid="profile-account-level-badge"
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
                  data-testid="profile-on-break"
                  @click="changeStatus(AgentStatus.AGENT_STATUS_ON_BREAK)">
            <div class="d-flex align-items-center justify-content-between w-100">
              <div>
                <q-badge :color="color(AgentStatus.AGENT_STATUS_ON_BREAK)"
                         data-testid="profile-break-badge"
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
                       data-testid="profile-force-at-account-tooltip"
                       self="center middle">
              <q-badge color="teal"
                       data-testid="profile-force-at-account-badge"
                       class="disabled-user-status">
                Forced at Account Level
              </q-badge>
            </q-tooltip>
          </q-item>

          <q-separator class="mt-1 mb-1" data-testid="profile-separator-3"></q-separator>
          <q-item dense
                  clickable
                  data-testid="profile-turn-notifications-item"
                  @click="toggleSleepMode">
            <q-item-section>
              <q-skeleton type="rect"
                          data-testid="profile-turn-notifications-skeleton"
                          v-if="togglingSleepMode" />
              <div v-else>
                <half-moon-icon :color="!profile.sleep_mode ? '#9B51E0' : '#040404'"
                                class="focus-mode-icon"
                                width="12"
                                data-testid="profile-turn-notifications-icon"
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
                  data-testid="profile-logout-item"
                  @click="proceedToLogout">
            <q-item-section>
              <div class="text-red-80">
                <logout-icon width="15"
                             height="15"
                             data-testid="profile-logout-icon"
                             class="logout-icon" />
                <span>
                  {{ logoutLabel }}
                </span>
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
import VueCookies from 'vue-cookies'

export default {
  name: 'profile',

  components: {
    HalfMoonIcon,
    LogoutIcon
  },

  mixins: [
    aclMixin,
    avatarMixin,
    agentMixin
  ],

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
    },

    userPersonalLine () {
      return this.profile.campaign_id ? this.campaigns.find(campaign => campaign.id === this.profile.campaign_id) : null
    }
  },

  methods: {
    ...mapActions('auth', ['setProfile']),

    changeStatus (status) {
      if (this.agentStatus === status) {
        return
      }

      this.changeAgentStatus(status, false, 1, 'Talk-ChangeStatus')
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

    proceedToLogout () {
      this.$cookies = VueCookies
      const parsedCookieName = `simpsocial-migration-${this.profile.id}`
      this.$cookies.set(parsedCookieName, null, 3650)
      this.logoutAction()
    }
  }
}
</script>
