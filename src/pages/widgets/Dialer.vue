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
         v-if="criticalErrorHappened">
      <p><strong>Something went wrong</strong></p>
      <hr>
      <p>For some reason we couldn’t complete the call. Please refresh the page and try again.</p>
    </div>

    <div class="p-3"
         v-else-if="showAlertAgentOnCall">
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
      :isAlwaysAskModeEnabled="isAlwaysAskModeEnabled()"
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
import Webrtc from 'components/webrtc'
import * as storage from 'src/plugins/helpers/storage'
import * as UserOutboundCallingModes from 'src/constants/user-outbound-calling-modes'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import { timezoneCheckMixin, helperMixin, agentMixin, dispositionsMixin } from 'src/plugins/mixins'
import DialerListeners from 'components/dialer-listeners.vue'
import useContactApi from 'src/shared/composables/use-contact-api.composable'
import CallingExtensionsManager from 'src/utils/CallingExtensionsManager'

export default {
  name: 'Dialer',

  components: {
    Webrtc,
    DialerListeners
  },

  mixins: [ timezoneCheckMixin, helperMixin, agentMixin, dispositionsMixin ],

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
      // not always this can be switched to true before call
      // in HS Task view it's opening window automatically without sending event when
      // maybe it sends an event before our component is mounted
      extensionsVisibility: true,
      extensions: null,
      timeout: null,
      showAlertAgentOnCall: false,
      defaultCampaignInitialized: false,
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
          },
          onDialNumber: async (event) => {
            this.criticalErrorHappened = false
            this.defaultCampaignInitialized = false
            this.setHubspotDialNumber(event)

            // do not continue if we not logged-in
            if (!this.initialized) {
              return
            }

            await this.postDialNumber()
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
      showAlertCallFinished: false,
      criticalErrorHappened: false,
      authProfile: null,
      listeners: {
        userLoggedIn: null,
        agentStatusUpdated: null
      },
      // Adding the READY state to display a loading indicator during the Dialer's white screen loading phase.
      isLoadingDialerStatuses: ['GENERATING_TOKEN', 'TOKEN_GENERATED', 'READY']
    }
  },

  setup () {
    const { getLastUsedCallLineByContactId } = useContactApi()

    return {
      getLastUsedCallLineByContactId
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapState('auth', ['authenticated', 'profile']),
    ...mapState(['isWidget', 'dialer', 'hubspotDialNumber']),

    allowed () {
      return this.authProfile && this.initialized && this.defaultCampaignInitialized
    },

    isLoadingDialer () {
      return this.isLoadingDialerStatuses.includes(this.dialer?.currentStatus) &&
        !this.showAlertAgentOnCall &&
        !this.showAlertCallFinished &&
        !this.dialer?.parkedCall &&
        !this.criticalErrorHappened
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
  },

  async mounted () {
    try {
      // init of CallingExtensions has to be once and do not repeat when, for instance, login page was called
      // otherwise we lose connection with parent window
      // that's why a global class was added
      this.extensions = await CallingExtensionsManager.initialize(this.callSdkOptions)
    } catch (error) {
      // there may iframe issue like "Blocked a frame with origin" but we don't want to break the whole app, it is still usable
      console.log('Error during CallingExtensions init', error)
    }

    CallingExtensionsManager.subscribe(this.callSdkOptions.eventHandlers)

    this.extensionsInitialized = true
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
      'setHubspotDialNumber'
    ]),

    ...mapActions('cache', [
      'setCurrentCompany'
    ]),

    async postDialNumber () {
      while (this.dialer.currentStatus === 'GENERATING_TOKEN' || this.agentStatus === AgentStatus.AGENT_STATUS_ON_CALL) {
        await new Promise(resolve => setTimeout(resolve, 200)) // Check every 200ms
      }

      this.checkAndResetCallDisposition()
      await this.getContact()

      this.showAlertCallFinished = false

      await this.findDefaultOutboundCampaign()

      if (this.isAlwaysAskModeEnabled()) {
        this.handleDialNumber()
      }
    },

    async init () {
      if (this.apiKey) {
        storage.local.setItem('api_token', this.apiKey)
      }
      this.loading = true

      await this.check().then((res) => {
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

    checkAndResetCallDisposition () {
      if (!this.checkForceDisposition) {
        this.$VueEvent.fire('resetCall')
      }
    },

    setContactDetails (contact) {
      this.contactName = this.getContactName(contact)
      this.contactTimezone = contact.timezone
      this.companyName = contact.company_name
      this.contactId = contact.id
    },

    getContactEmitPayload () {
      return {
        currentNumber: this.hubspotDialNumber?.phoneNumber,
        contactName: this.contactName,
        companyName: this.companyName,
        contactId: this.contactId,
        contactTimezone: this.contactTimezone
      }
    },

    async getContact () {
      await this.$axios.post('/api/v1/integrations/hubspot/find-contact', {
        params: this.hubspotDialNumber
      }).then(res => {
        this.setContactDetails(res.data)
        this.$emit('change', this.$emit('change', this.getContactEmitPayload()))
      }).catch(err => {
        this.$handleErrors(err.response)
        this.criticalErrorHappened = true
        if (this.extensions) {
          this.extensions.callEnded()
        }
      })
    },

    async handleDialNumber () {
      console.log('Handle')
      console.log('CurrentStatus:', this.dialer?.currentStatus)
      if (this.checkAgentHasActiveCallInAnotherDevice()) {
        this.showAlertAgentOnCall = true
        return
      }

      // don't allow to make a call if there's a parked call
      if (this.dialer?.parkedCall) {
        return
      }

      this.showAlertAgentOnCall = false

      if (this.canHandleDialNumber()) {
        this.handleCall()
      } else if (!this.dialer?.isReady) {
        this.timeout = setTimeout(() => {
          this.handleDialNumber()
        }, 1000)
      }
    },

    handleUserLogin () {
      if (this.needsExtensions && this.extensionsInitialized) {
        this.extensions.userLoggedIn()
        // Change agent status if profile allows, no call is active, and no force disposition is required or missing to complete.
        if (this.profile && this.profile?.go_to_available_after_login && !this.dialer.call && !this.checkForceDisposition) {
          this.changeAgentStatus(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS, false, 1, 'Talk-InitAuth-3')
        }
      }

      // if empty then onDialNumber event was not called - skip calling,
      // if not empty then dialer was called, and we are here after login page so we must dial the number
      if (!this.hubspotDialNumber) {
        return
      }

      this.postDialNumber()
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

    handleCall () {
      this.loading = true
      const isCallInProgressOrWrapUp = ['CALL_CONNECTED', 'WRAP_UP', 'MAKING_CALL']

      // if there's a call in progress or in wrap up, we omit the call
      if (isCallInProgressOrWrapUp.includes(this.dialer?.currentStatus)) {
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
      if (this.shouldUseCompanyCampaignId()) {
        this.defaultOutboundCampaignId = this.currentCompany.default_outbound_campaign_id
      } else if (this.shouldUseProfileCampaignId()) {
        this.defaultOutboundCampaignId = this.authProfile.default_outbound_campaign_id
      } else { // if there's no a line by default, we remove the selected line
        this.defaultOutboundCampaignId = null
      }

      this.campaignId = this.defaultOutboundCampaignId

      // if the call is canceled, we close the widget in HS
      setTimeout(() => {
        this.extensions.callCompleted({
          hideWidget: true
        })
      }, 50)
    },

    handleAgentStatusUpdate (data) {
      if (
        this.currentCompany?.id === data.company_id &&
        this.profile?.id === data.user_id &&
        this.profile.agent_status !== data.agent_status
      ) {
        const agentStatus = data.agent_status
        this.setAgentStatus(agentStatus)

        if (!this.showAlertAgentOnCall && this.isFirstLoading && agentStatus === AgentStatus.AGENT_STATUS_ON_CALL && !this.isDialed) {
          this.showAlertCallFinished = false
        }

        // if we finished - don't need to handle dial number
        if (this.showAlertCallFinished) {
          return
        }

        if (agentStatus !== AgentStatus.AGENT_STATUS_ON_CALL && agentStatus !== AgentStatus.AGENT_STATUS_ON_WRAP_UP) {
          this.handleDialNumber()
        }
      }
    },

    makeCall () {
      if (this.callDisabled || this.campaignId === null) {
        return
      }

      this.$VueEvent.fire('makeCall', {
        currentNumber: this.$options.filters.fixPhone(this.hubspotDialNumber?.phoneNumber),
        outboundCampaignId: this.campaignId.toString(),
        contactName: this.contactName,
        companyName: this.companyName,
        contactId: this.contactId
      })
    },

    async findDefaultOutboundCampaign () {
      if (this.isAlwaysAskModeEnabled()) {
        await this.setTheLastUsedCallLine()
        this.defaultCampaignInitialized = true
        return
      }

      if (this.shouldUseCompanyCampaignId()) {
        this.defaultOutboundCampaignId = this.currentCompany.default_outbound_campaign_id
      } else if (this.shouldUseProfileCampaignId()) {
        this.defaultOutboundCampaignId = this.authProfile.default_outbound_campaign_id
      }

      if (this.defaultOutboundCampaignId) {
        this.setCampaignIdAndDialNumber()
      }

      this.defaultCampaignInitialized = true
    },

    isAlwaysAskModeEnabled () {
      if (!this.authProfile) return false

      const isCompanyAlwaysAsk = this.shouldUseCompanyCampaignId() && !this.currentCompany.default_outbound_campaign_id

      const isUserAlwaysAsk = this.authProfile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ALWAYS_ASK

      return isCompanyAlwaysAsk || isUserAlwaysAsk
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
      this.handleDialNumber()
    },

    canHandleDialNumber () {
      return this.needsExtensions &&
        this.extensionsInitialized &&
        this.extensionsVisibility &&
        this.initialized &&
        this.authProfile &&
        this.dialer?.isReady &&
        // if isAlwaysAskModeEnabled is true then dialing will be triggered from select campaign dialog component
        (this.campaignId !== null ? !this.isAlwaysAskModeEnabled() : false) &&
        (this.agentStatus === AgentStatus.AGENT_STATUS_ON_WRAP_UP ? !this.checkForceDisposition : true)
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
        !statuses.includes(this.dialer?.currentStatus)
    },

    endActiveCall () {
      this.showAlertAgentOnCall = false
      this.showAlertCallFinished = false
      this.isDialed = false

      if (this.dialer?.currentStatus === 'WRAP_UP') {
        this.$VueEvent.fire('endWrapUp')
      }

      if (this.dialer?.communication?.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW) {
        this.$VueEvent.fire('hangupCall')
      }

      this.$VueEvent.fire('resetCall')
      this.handleCallCompletedEvent(true)
    },

    async setTheLastUsedCallLine () {
      if (this.campaignId || !this.contactId) return
      try {
        const data = await this.getLastUsedCallLineByContactId(this.contactId)
        this.handleChangeCampaignEvent(data.campaign_id)
      } catch (error) {
        this.$handleErrors(error.response)
      }
    }
  },

  watch: {
    authenticated (newVal) {
      if (newVal && this.extensions) {
        this.extensions.initialized({
          isLoggedIn: newVal
        })
      }
    },
    extensionsVisibility () {
      if (this.extensionsVisibility) {
        this.showAlertAgentOnCall = this.authProfile && this.authProfile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL
      } else {
        this.showAlertCallFinished = false
        // if hidden, reset HubSpot dial number
        this.setHubspotDialNumber(null)
      }
    },

    'dialer.currentStatus' () {
      if (this.isLoadingDialer) {
        return
      }

      const isCallInProgress = ['CALL_CONNECTED', 'WRAP_UP', 'MAKING_CALL']
      if (isCallInProgress?.includes(this.dialer?.currentStatus) &&
        (this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL || (this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_WRAP_UP && !this.checkForceDisposition)) &&
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
