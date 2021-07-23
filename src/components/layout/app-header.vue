<template>
  <q-toolbar class="page-header pl-3 pr-3">
    <div class="d-flex h-100 align-items-center">
      <h1>{{ $route.name }}</h1>
    </div>
    <div class="ml-auto d-none d-lg-block h-100">
      <div class="d-flex h-100 align-items-center">
        <q-item>
          <q-item-section>
            <q-item-label class="text-regular _500">{{ user.profile.first_name }}</q-item-label>
          </q-item-section>
          <q-item-section class="profile-menu"
                          avatar>
            <q-btn-dropdown :ripple="false"
                            :disabled="loadingAgentStatus || ['RECEIVED_CALL_INVITE', 'CALL_CONNECTED'].includes(dialer.currentStatus)"
                            :menu-offset="[4, 16]"
                            class="tab-dropdown"
                            ref="menu"
                            auto-close
                            flat>
              <template v-slot:label>
                <q-avatar size="34px"
                          v-if="user.profile"
                          :style="avatarStyle(user.profile.name)">
                  {{ user.profile.name | fixName | initials }}
                  <q-badge :color="color(user.profile.agent_status)"
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
                             class="rounded-badge q-mr-sm">
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
                             class="rounded-badge q-mr-sm">
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
                             class="rounded-badge q-mr-sm">
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
                             class="rounded-badge q-mr-sm">
                    </q-badge>
                    On-break
                  </div>
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
                 flat>
            <q-menu :offset="[0, 10]"
                    anchor="bottom end"
                    self="top right"
                    @before-show="showDialer"
                    @before-hide="hideDialer">
              <div class="row no-wrap q-pa-md width-290">
                <div class="col no-padding max-width-266">
                  <line-selector v-model="campaignId"></line-selector>

                  <div class="tab-links d-inline-flex w-100">
                    <b-link href="#"
                            :class="{ active : mode === 'call' }"
                            @click="setMode('call')">
                      Call
                    </b-link>
                    <b-link href="#"
                            :class="{ active : mode === 'text' }"
                            @click="setMode('text')">
                      Text
                    </b-link>
                  </div>
                  <div class="d-inline-flex align-items-end justify-content-between dialer w-100 pb-2">
                    <b-form-group :label="label"
                                  :invalid-feedback="invalidPhoneNumber"
                                  :state="validPhoneNumber"
                                  class="mt-2 mb-0">
                      <contact-phone-number-search v-model="phoneNumber"
                                                   @change="changePhoneNumber">
                      </contact-phone-number-search>
                    </b-form-group>
                    <q-btn :ripple="true"
                           :disable="!validPhoneNumber"
                           v-show="mode == 'call'"
                           icon="img:app-icons/dialer/call_btn_small.svg"
                           size="36px"
                           class="icon-btn auto-size height-36"
                           align="right"
                           padding="none"
                           rounded
                           flat>
                    </q-btn>
                    <q-btn :ripple="true"
                           :disable="!validPhoneNumber"
                           v-show="mode == 'text'"
                           icon="img:app-icons/dialer/text_btn_small.svg"
                           size="36px"
                           class="icon-btn auto-size height-36"
                           align="right"
                           padding="none"
                           rounded
                           flat>
                    </q-btn>
                  </div>
                </div>
              </div>
            </q-menu>
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
import LineSelector from 'components/dialer/line-selector'
import * as UserOutboundCallingModes from 'src/constants/user-outbound-calling-modes'
import ContactPhoneNumberSearch from 'components/dialer/contact-phone-number-search'

export default {
  name: 'app-header',
  components: { ContactPhoneNumberSearch, LineSelector },
  mixins: [aclMixin, avatarMixin, agentMixin],

  data () {
    return {
      dialerIcon: 'img:app-icons/header/dialer_gray.svg',
      dialerStatus: false,
      label: 'Call a number',
      mode: 'call',
      defaultOutboundCampaignId: null,
      campaignId: null,
      phoneNumber: '',
      AgentStatus
    }
  },

  computed: {
    ...mapState(['currentCompany', 'dialer', 'campaigns']),
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

    validPhoneNumber () {
      return this.$options.filters.fixPhone(this.phoneNumber) !== false
    },

    invalidPhoneNumber () {
      return 'Please enter a valid phone number'
    },

    personalPhoneNumber () {
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

    showDialer () {
      // find default outbound campaign
      this.findDefaultOutboundCampaign()

      this.dialerStatus = true
      this.dialerIcon = 'img:app-icons/header/dialer_active.svg'
      this.$emit('showDialer')
    },

    hideDialer () {
      this.phoneNumber = ''

      this.dialerStatus = false
      this.dialerIcon = 'img:app-icons/header/dialer_gray.svg'
      this.$emit('hideDialer')
    },

    changeStatus (status) {
      this.changeAgentStatus(status)
      this.$refs.menu.hide()
    },

    changePhoneNumber (phoneNumber) {
      this.phoneNumber = phoneNumber
    },

    findDefaultOutboundCampaign () {
      this.campaignId = null
      this.defaultOutboundCampaignId = null

      // force outbound line on all users
      if (this.currentCompany && this.currentCompany.default_outbound_campaign_id && this.currentCompany.force_outbound_line) {
        this.defaultOutboundCampaignId = this.currentCompany.default_outbound_campaign_id
        this.campaignId = this.defaultOutboundCampaignId
        return
      }

      // outbound line is set to use account default and account has a default
      if (this.currentCompany && this.currentCompany.default_outbound_campaign_id && this.user.profile && this.user.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT && !this.user.profile.default_outbound_campaign_id) {
        this.defaultOutboundCampaignId = this.currentCompany.default_outbound_campaign_id
        this.campaignId = this.defaultOutboundCampaignId
        return
      }

      // user has a default outbound line
      if (this.user.profile && this.user.profile.default_outbound_campaign_id && this.user.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT) {
        this.defaultOutboundCampaignId = this.user.profile.default_outbound_campaign_id
        this.campaignId = this.defaultOutboundCampaignId
        return
      }

      // user has to choose outbound line every time
      if (this.user.profile && this.user.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ALWAYS_ASK) {
        this.defaultOutboundCampaignId = null
        this.campaignId = null
      }
    },

    setMode (mode) {
      this.mode = mode
      switch (mode) {
        case 'call':
          this.label = 'Call a number'
          break
        case 'text':
          this.label = 'Text a number'
          break
      }
    }
  }
}
</script>
