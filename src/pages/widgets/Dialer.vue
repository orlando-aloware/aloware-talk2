<template>
  <div>
    <b-overlay class="h-100 w-100 position-absolute"
               :show="isLoadingDialer">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="2em" />
      </template>
    </b-overlay>

    <dialer-listeners @user-logged-in="handleUserLogin"
                      @agent-status-updated="handleAgentStatusUpdate"/>
    <div class="p-3"
         v-if="showAlertAgentOnCall">
      <p><strong>Call in Progress on Another Device</strong></p>
      <hr>
      <p>You're currently engaged in another call on Aloware Talk. Please complete your current conversation before initiating a new call.</p>
    </div>

    <div class="p-3"
         v-else-if="showAlertCallFinished && dialer && !dialer.parkedCall">
      <p><strong>Call Finished</strong></p>
      <hr>
      <p>Please close this window or click the back button to continue.</p>
    </div>

    <webrtc
      :carrierName="authProfile.carrier_name"
      :isWidget="true"
      :campaignId="campaignId"
      :class="[small ? 'small' : '']"
      v-else-if="allowed"
      @callConnected="handleCallConnectedEvent"
      @callCompleted="handleCallCompletedEvent"
      @changeCampaignId="handleChangeCampaignEvent"
      @handleCall="handleCall"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import * as AgentStatus from 'src/constants/agent-status'
import CallingExtensions from '@hubspot/calling-extensions-sdk'
import Webrtc from 'components/webrtc'
import * as storage from 'src/plugins/helpers/storage'
import * as UserOutboundCallingModes from 'src/constants/user-outbound-calling-modes'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import { timezoneCheckMixin, helperMixin } from 'src/plugins/mixins'
import DialerListeners from 'components/dialer-listeners.vue'

export default {
  name: 'Dialer',

  components: {
    Webrtc,
    DialerListeners
  },

  mixins: [ timezoneCheckMixin, helperMixin ],

  props: {
    apiKey: {
      required: false
    }
  },

  data () {
    return {
      isFirstLoading: true,
      isDialed: false,
      loading: false,
      small: false,
      initialized: false,
      needsExtensions: false,
      extensionsInitialized: false,
      extensionsVisibility: false,
      extensions: null,
      timeout: null,
      showAlertAgentOnCall: false,
      callSdkOptions: {
        // Whether to log various inbound/outbound messages to console
        debugMode: true,
        // eventHandlers handle inbound messages
        eventHandlers: {
          onReady: () => {
            this.$VueEvent.fire('resetCall')

            const payload = {
              // Whether a user is logged-in
              isLoggedIn: this.authenticated,
              // Optionally send the desired widget size
              sizeInfo: {
                height: 522,
                width: 300
              }
            }
            this.extensions.initialized(payload)
            this.extensionsInitialized = true
          },
          onDialNumber: (event) => {
            const shouldForceContactDisposition = this.currentCompany.force_contact_disposition &&
              !this.profile.last_call?.contact?.disposition_status_id
            const shouldForceCallDisposition = this.currentCompany.force_call_disposition &&
              !this.profile.last_call?.call_disposition_id

            if (!shouldForceContactDisposition && !shouldForceCallDisposition) {
              this.$VueEvent.fire('resetCall')
            }

            this.showAlertCallFinished = false

            if (event.phone_number) {
              this.findDefaultOutboundCampaign()
              this.setHubspotPhoneNumber(event.phone_number)
              if (this.timeout) {
                clearTimeout(this.timeout)
              }
              this.handleDialNumber(event.phone_number)
            }
          },
          onVisibilityChanged: (data) => {
            this.extensionsVisibility = !data?.isHidden

            if (!this.extensionsVisibility) {
              this.endActiveCall()
            }
          }
        }
      },
      contactName: '',
      contactTimezone: '',
      companyName: '',
      contactId: '',
      campaignId: null,
      defaultOutboundCampaignId: null,
      previousOutboundCallingMode: null,
      showAlertCallFinished: false,
      authProfile: null,
      listeners: {
        userLoggedIn: null,
        agentStatusUpdated: null
      },
      isLoadingDialerStatuses: ['GENERATING_TOKEN', 'TOKEN_GENERATED']
    }
  },
  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapState('auth', ['authenticated', 'profile']),
    ...mapState(['isWidget', 'dialer', 'hubspotPhoneNumber', 'isRedirectedToHubspotWidget']),

    allowed () {
      return this.authProfile && this.initialized
    },

    isLoadingDialer () {
      return this.isLoadingDialerStatuses.includes(this.dialer?.currentStatus)
    }
  },

  created () {
    this.setIsWidget(true)

    if (this.$route.query.small) {
      this.small = true
    }

    this.needsExtensions = this.$route.name === 'Hubspot Call Extension'

    if (!this.needsExtensions) {
      this.extensionsVisibility = true
    }

    if (!this.extensions) {
      this.extensions = new CallingExtensions(this.callSdkOptions)
    }
  },

  async mounted () {
    await this.init()
    this.isFirstLoading = false
  },

  methods: {
    ...mapActions('auth', {
      logoutUser: 'logout',
      check: 'check',
      clear: 'clear',
      setAgentStatus: 'setAgentStatus'
    }),

    ...mapActions([
      'resetVuex',
      'setIsWidget',
      'setHubspotPhoneNumber'
    ]),

    ...mapActions('cache', [
      'setCurrentCompany'
    ]),

    init () {
      if (this.apiKey) {
        storage.local.setItem('api_token', this.apiKey)
      }
      this.loading = true
      this.check().then((res) => {
        storage.local.setItem('company_id', res.data.user.company.id)
        this.setCurrentCompany(res.data.user.company)
        this.resetVuex(['all'])
        this.authProfile = res.data?.user
        this.loading = false
        this.initialized = true
        this.handleUserLogin()
      }).catch((err) => {
        console.log('Error: api key is not valid', err)
        this.$handleErrors(err.response)
        this.loading = false
        if (this.$route.name !== 'Login') {
          this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
        }
      })
    },

    setContactDetails (contact) {
      this.contactName = this.getContactName(contact)
      this.contactTimezone = contact.timezone
      this.companyName = contact.company_name
      this.contactId = contact.contact_id
    },

    getContactEmitPayload () {
      return {
        currentNumber: this.hubspotPhoneNumber,
        contactName: this.contactName,
        companyName: this.companyName,
        contactId: this.contactId,
        contactTimezone: this.contactTimezone
      }
    },

    async searchContact (phoneNumber) {
      if (!phoneNumber) {
        return null
      }

      const url = '/api/v2/contacts/quick-search'
      const response = await this.$axios.get(url, {
        params: {
          search: phoneNumber
        }
      })

      return response.data.data.length > 0 ? response.data.data[0] : null
    },

    async handleDialNumber (phoneNumber) {
      if (this.checkAgentHasActiveCallInAnotherDevice()) {
        this.showAlertAgentOnCall = true
        return
      }

      this.showAlertAgentOnCall = false

      if (!this.hubspotPhoneNumber && phoneNumber) {
        this.setHubspotPhoneNumber(phoneNumber)
      }

      if (this.canHandleDialNumber()) {
        const contact = await this.searchContact(this.hubspotPhoneNumber)

        if (contact) {
          this.setContactDetails(contact)
          this.$emit('change', this.$emit('change', this.getContactEmitPayload()))
          this.handleCall()
        }
      } else if (!this.dialer?.isReady) {
        this.timeout = setTimeout(() => {
          this.handleDialNumber(this.hubspotPhoneNumber)
        }, 1000)
      }
    },

    handleUserLogin () {
      if (this.needsExtensions && this.extensionsInitialized) {
        this.extensions.userLoggedIn()
      }

      if (this.defaultOutboundCampaignId) {
        this.campaignId = this.defaultOutboundCampaignId
        this.handleDialNumber(this.hubspotPhoneNumber)
      }
    },

    handleCallConnectedEvent () {
      if (this.needsExtensions && this.extensionsInitialized) {
        this.extensions.callAnswered()
      }
    },

    handleCallCompletedEvent (skipCallFinished = false) {
      if (this.extensions) {
        this.extensions.callEnded()
        this.showAlertCallFinished = !this.dialer.parkedCall && !skipCallFinished
        if (!this.defaultOutboundCampaignId) {
          this.campaignId = null
        }
      }
    },

    handleChangeCampaignEvent (campaignId) {
      this.campaignId = campaignId
    },

    handleCall (shouldHandleDialNumber) {
      const isCallInProgressOrWrapUp = ['CALL_CONNECTED', 'WRAP_UP', 'MAKING_CALL']

      // if there's a call in progress or in wrap up, we omit the call
      if (isCallInProgressOrWrapUp.includes(this.dialer.currentStatus)) {
        return
      }

      // if shouldHandleDialNumber is true, then handleDialNumber will set the contact name and timezone
      // to proceed to execute checkContactTimezone and makeCall
      if (shouldHandleDialNumber) {
        this.handleDialNumber(this.hubspotPhoneNumber)
        return
      }

      const contactData = {
        timezone: this.contactTimezone,
        name: this.contactName
      }

      this.checkContactTimezone(contactData, this.makeCall, this.onCancelCall)
      this.isDialed = true
    },

    onCancelCall () {
      this.campaignId = null
    },

    handleAgentStatusUpdate (data) {
      const agentStatus = data.agent_status
      this.setAgentStatus(agentStatus)

      if (!this.showAlertAgentOnCall && this.isFirstLoading && agentStatus === AgentStatus.AGENT_STATUS_ON_CALL && !this.isDialed) {
        this.showAlertAgentOnCall = true
        this.showAlertCallFinished = false
      }

      if (agentStatus === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS && this.showAlertAgentOnCall) {
        this.showAlertAgentOnCall = false
        this.handleDialNumber(this.hubspotPhoneNumber)
      }
    },

    makeCall () {
      if (this.callDisabled || this.campaignId === null) {
        return
      }

      this.$VueEvent.fire('makeCall', {
        currentNumber: this.$options.filters.fixPhone(this.hubspotPhoneNumber),
        outboundCampaignId: this.campaignId.toString(),
        contactName: this.contactName,
        companyName: this.companyName,
        contactId: this.contactId
      })
    },

    findDefaultOutboundCampaign () {
      if (this.isAlwaysAskModeEnabled()) {
        return
      }

      this.updatePreviousOutboundCallingMode()

      if (this.shouldUseCompanyCampaignId()) {
        this.defaultOutboundCampaignId = this.currentCompany.default_outbound_campaign_id
      } else if (this.shouldUseProfileCampaignId()) {
        this.defaultOutboundCampaignId = this.authProfile.default_outbound_campaign_id
      }

      if (this.defaultOutboundCampaignId) {
        this.setCampaignIdAndDialNumber()
      }
    },

    isAlwaysAskModeEnabled () {
      return this.previousOutboundCallingMode &&
        this.authProfile &&
        this.previousOutboundCallingMode === this.authProfile.outbound_calling_mode &&
        this.previousOutboundCallingMode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ALWAYS_ASK
    },

    updatePreviousOutboundCallingMode () {
      this.previousOutboundCallingMode = this.authProfile?.outbound_calling_mode
    },

    shouldUseCompanyCampaignId () {
      return this.currentCompany &&
        (this.currentCompany.force_outbound_line ||
          (this.authProfile?.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT &&
            !this.authProfile.default_outbound_campaign_id))
    },

    shouldUseProfileCampaignId () {
      return this.authProfile &&
        this.authProfile.default_outbound_campaign_id &&
        this.authProfile?.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT
    },

    setCampaignIdAndDialNumber () {
      this.campaignId = this.defaultOutboundCampaignId
      this.handleDialNumber(this.hubspotPhoneNumber)
    },

    canHandleDialNumber () {
      if (this.isRedirectedToHubspotWidget && this.defaultOutboundCampaignId) {
        return this.needsExtensions &&
          this.initialized &&
          this.authProfile &&
          this.dialer?.isReady &&
          this.campaignId !== null
      }

      return this.needsExtensions &&
        this.extensionsInitialized &&
        this.extensionsVisibility &&
        this.initialized &&
        this.authProfile &&
        this.dialer?.isReady &&
        this.campaignId !== null
    },

    checkAgentHasActiveCallInAnotherDevice () {
      const statuses = [
        'MAKING_CALL',
        'CALL_CONNECTED',
        'HANGING_UP_CALL',
        'CALL_DISCONNECTED',
        'WRAP_UP'
      ]

      return this.dialer &&
        this.profile &&
        this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL &&
        !statuses.includes(this.dialer.currentStatus)
    },

    endActiveCall () {
      this.showAlertAgentOnCall = false
      this.showAlertCallFinished = false
      this.isDialed = false

      if (this.dialer.currentStatus === 'WRAP_UP') {
        this.$VueEvent.fire('endWrapUp')
      }

      if (this.dialer?.communication?.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW) {
        this.$VueEvent.fire('hangupCall')
      }

      this.$VueEvent.fire('resetCall')
      this.handleCallCompletedEvent(true)
    }
  },

  watch: {
    extensionsVisibility () {
      if (this.extensionsVisibility) {
        this.showAlertAgentOnCall = this.authProfile && this.authProfile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL
      } else {
        this.showAlertCallFinished = false
      }
    },

    authProfile () {
      this.findDefaultOutboundCampaign()
    },

    'dialer.currentStatus' () {
      if (this.isLoadingDialer) {
        return
      }

      const shouldForceContactDisposition = this.currentCompany.force_contact_disposition &&
        !this.profile.last_call?.contact?.disposition_status_id
      const shouldForceCallDisposition = this.currentCompany.force_call_disposition &&
        !this.profile.last_call?.call_disposition_id

      const isCallInProgress = ['CALL_CONNECTED', 'WRAP_UP', 'MAKING_CALL']
      if (isCallInProgress?.includes(this.dialer?.currentStatus) &&
        (this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL || (this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_WRAP_UP && !(shouldForceContactDisposition || shouldForceCallDisposition))) &&
        !this.isDialed) {
        this.showAlertAgentOnCall = true
        this.showAlertCallFinished = false
      }
    }
  }
}
</script>

<style scoped>
html, body {
  background: transparent !important;
  width: 300px;
  height: 522px;
}
</style>
