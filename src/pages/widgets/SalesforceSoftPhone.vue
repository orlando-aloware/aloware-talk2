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
         v-if="widgetMessage === WIDGET_MSG_CRITICAL_ERROR_HAPPENED">
      <p><strong>Something went wrong</strong></p>
      <hr>
      <p>For some reason we couldn't complete the call. Please refresh the page and try again.</p>
    </div>

    <div class="p-3"
         v-else-if="widgetMessage === WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL">
      <p><strong>Call in Progress on Another Device</strong></p>
      <hr>
      <p>You're currently engaged in another call on Aloware Talk. Please complete your current conversation before initiating a new call.</p>
    </div>

    <div class="p-3"
         v-else-if="widgetMessage === WIDGET_MSG_SHOW_ALERT_CALL_FINISHED">
      <p><strong>Call Finished</strong></p>
      <hr>
      <p>Please minimize this window or click to a phone number to start dialing again.</p>
    </div>

    <div class="p-3"
         v-else-if="widgetMessage === WIDGET_MSG_SHOW_ALERT_CALL_NOT_STARTED">
      <p><strong>Phone number is not chosen</strong></p>
      <hr>
      <p>Please click to a phone number to start dialing.</p>
    </div>

    <webrtc
      :campaignId="campaignId"
      :class="[small ? 'small' : '']"
      :isAlwaysAskModeEnabled="isAlwaysAskModeEnabled()"
      :start-dialing="startDialing"
      v-show='widgetMessage === WIDGET_MSG_HIDE'
      v-if="allowed"
      @callCompleted="handleCallCompletedEvent"
      @changeCampaignId="handleChangeCampaignEvent"
      @handleCall="handleCall"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import * as AgentStatus from 'src/constants/agent-status'
import { AGENT_STATUS_ACCEPTING_CALLS, AGENT_STATUS_ON_CALL, AGENT_STATUS_ON_WRAP_UP } from 'src/constants/agent-status'
import Webrtc from 'components/webrtc'
import * as storage from 'src/plugins/helpers/storage'
import * as UserOutboundCallingModes from 'src/constants/user-outbound-calling-modes'
import {
  agentMixin,
  dispositionsMixin,
  helperMixin,
  notificationMixin,
  timezoneCheckMixin,
  visibilityMixin
} from 'src/plugins/mixins'
import DialerListeners from 'components/dialer-listeners.vue'
import useContactApi from 'src/shared/composables/use-contact-api.composable'
import { CURRENT_STATUS_COMPLETED_NEW } from 'src/constants/communication-current-status'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'

const WIDGET_MSG_HIDE = 1
const WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL = 2
const WIDGET_MSG_SHOW_ALERT_CALL_FINISHED = 3
const WIDGET_MSG_SHOW_ALERT_CALL_NOT_STARTED = 4
const WIDGET_MSG_CRITICAL_ERROR_HAPPENED = 5

export default {
  name: 'Dialer',

  components: {
    Webrtc,
    DialerListeners
  },

  mixins: [
    timezoneCheckMixin,
    helperMixin,
    agentMixin,
    dispositionsMixin,
    visibilityMixin,
    notificationMixin
  ],

  props: {
    apiKey: {
      required: false
    }
  },

  data () {
    return {
      WIDGET_MSG_HIDE,
      WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL,
      WIDGET_MSG_SHOW_ALERT_CALL_FINISHED,
      WIDGET_MSG_SHOW_ALERT_CALL_NOT_STARTED,
      WIDGET_MSG_CRITICAL_ERROR_HAPPENED,
      widgetMessage: WIDGET_MSG_SHOW_ALERT_CALL_NOT_STARTED,
      startDialing: false,
      isFirstLoading: true,
      loading: false,
      small: false,
      initialized: false,
      timeout: null,
      contactName: '',
      contactTimezone: '',
      companyName: '',
      contactId: '',
      campaignId: null,
      defaultOutboundCampaignId: null,
      authProfile: null,
      listeners: {
        userLoggedIn: null,
        agentStatusUpdated: null,
        newInAppCall: null
      },
      // Adding the READY state to display a loading indicator during the Dialer's white screen loading phase.
      isLoadingDialerStatuses: ['GENERATING_TOKEN', 'TOKEN_GENERATED', 'READY'],
      opencti_loaded: false,
      // original path is https://MyDomainName--PackageName.vf.force.com/support/api/63.0/interaction.js
      // documentation https://developer.salesforce.com/docs/atlas.en-us.api_cti.meta/api_cti/sforce_api_cti_connecting.htm
      opencti_script_path: '/integrations/salesforce_lightning_call_center_62_0.js'
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
    ...mapState(['dialer', 'salesforceDialNumber', 'ringGroups']),

    allowed () {
      return this.authProfile && this.initialized
    },

    isLoadingDialer () {
      return this.isLoadingDialerStatuses.includes(this.dialer?.currentStatus) &&
        this.widgetMessage === WIDGET_MSG_HIDE &&
        !this.dialer?.parkedCall
    }
  },

  created () {
    this.setIsWidget(true)
    this.setIsSalesforceWidget(true)

    if (this.$route.query.small) {
      this.small = true
    }

    this.listeners.newInAppCall = (communication) => {
      const ringGroup = this.ringGroups.find(ringGroup => ringGroup.id === communication.ring_group_id)
      const isFishingMode = ringGroup && ringGroup.should_queue && ringGroup.fishing_mode

      if (!isFishingMode && !this.checkCommunicationMatchesUserAccessibility(communication)) {
        return
      }

      const communicationType = communication.current_status2 === CURRENT_STATUS_COMPLETED_NEW &&
      communication.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW
        ? 'missed call'
        : 'call'

      // ignore call notifications if the call is not fishing mode and the user is in sleep mode
      if ((isFishingMode || communication.is_call_waiting) || !this.profile.sleep_mode) {
        this.processActionNotification(communication, communicationType)

        if (this.opencti_loaded) {
          this.widgetMessage = WIDGET_MSG_HIDE
          window.sforce.opencti.isSoftphonePanelVisible({
            callback: function (response) {
              if (response.success && !response.returnValue.visible) {
                window.sforce.opencti.setSoftphonePanelVisibility({
                  visible: true
                })
              }
            }
          })
        }
      }
    }
  },

  async mounted () {
    // we may come from login page with already defined phone number from the past
    if (this.salesforceDialNumber) {
      this.widgetMessage = WIDGET_MSG_HIDE
    }

    // use iframe origin domain if found
    if (this.$route?.query?.sfdcIframeOrigin) {
      this.opencti_script_path = this.$route.query.sfdcIframeOrigin + '/support/api/63.0/lightning/opencti_min.js'
    }

    await this.init()
    this.isFirstLoading = false

    this.loadOpenCtiScript()
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
      'setIsSalesforceWidget',
      'setSalesforceDialNumber',
      'setNotifications',
      'setShowIncomingCallNotification',
      'setShowPhone',
      'updateUserStatus'
    ]),

    ...mapActions('cache', [
      'setCurrentCompany'
    ]),

    async postDialNumber () {
      // Hide the Bootstrap Vue modal by its ID
      this.$bvModal.hide('daytime-hours-confirmation')
      this.startDialing = true

      do {
        await new Promise(resolve => setTimeout(resolve, 500)) // Check every 0.5sec
      } while (this.dialer.currentStatus === 'GENERATING_TOKEN' || this.agentStatus === AgentStatus.AGENT_STATUS_ON_CALL)

      try {
        await this.getContact()
      } catch (e) {
        return
      }

      this.checkAndResetCallDisposition()
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
          this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath, ...this.$route?.query } })
        }
      })
    },

    isAlwaysAskModeEnabled () {
      if (!this.authProfile) return false

      const isCompanyAlwaysAsk = this.shouldUseCompanyCampaignId() && !this.currentCompany.default_outbound_campaign_id

      const isUserAlwaysAsk = this.authProfile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ACCOUNT_ALWAYS_ASK

      return isCompanyAlwaysAsk || isUserAlwaysAsk
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

    async getContact () {
      // Return the Promise so that await getContact() actually waits for completion
      return this.$axios.post('/api/v1/integrations/salesforce/find-contact', {
        params: this.salesforceDialNumber
      }).then(res => {
        this.setContactDetails(res.data)
        return res.data
      }).catch(err => {
        this.$handleErrors(err.response)
        this.widgetMessage = WIDGET_MSG_CRITICAL_ERROR_HAPPENED
        throw err
      })
    },

    async handleDialNumber () {
      console.log('CurrentStatus:', this.dialer?.currentStatus)

      if (this.dialer?.currentStatus === 'WRAP_UP' && this.checkForceDisposition) {
        this.$VueEvent.fire('showPhone')
        this.disableClickToDial()
        return
      }

      if (this.checkAgentHasActiveCallInAnotherDevice()) {
        return
      }

      // don't allow to make a call if there's a parked call
      if (this.dialer?.parkedCall) {
        return
      }

      if (this.canHandleDialNumber()) {
        this.handleCall()
      } else if (!this.dialer?.isReady) {
        this.timeout = setTimeout(() => {
          this.handleDialNumber()
        }, 1000)
      }
    },

    enableClickToDial () {
      if (!this.opencti_loaded) {
        return
      }
      // Enable click-to-dial functionality
      window.sforce.opencti.enableClickToDial()
    },

    disableClickToDial () {
      if (!this.opencti_loaded) {
        return
      }
      // Enable click-to-dial functionality
      window.sforce.opencti.disableClickToDial()
    },

    handleUserLogin () {
      // Change agent status if profile allows, no call is active, and no force disposition is required or missing to complete.
      if (this.profile && this.profile?.go_to_available_after_login && !this.dialer.call && !this.checkForceDisposition) {
        this.changeAgentStatus(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS, false, 1, 'Talk-InitAuth-3')
      }

      this.$VueEvent.listen('new_in_app_call', this.listeners.newInAppCall)

      // Register listeners for call action buttons
      this.$VueEvent.listen('answerCall', () => {
        console.log('Answering incoming call in SalesforceSoftPhone')

        // Disable click-to-dial functionality
        this.disableClickToDial()
        this.$VueEvent.fire('showPhone')
      })

      this.$VueEvent.listen('rejectCall', () => {
        this.widgetMessage = WIDGET_MSG_SHOW_ALERT_CALL_FINISHED
        console.log('Rejecting incoming call in SalesforceSoftPhone')
      })

      this.predefinedCampaign()
    },

    handleCallCompletedEvent () {
      console.log('handleCallCompletedEvent',
        {
          'currentStatus': this.dialer?.currentStatus,
          'parkedCall': this.dialer?.parkedCall
        }
      )

      const skippedStatuses = ['MAKING_CALL', 'RECEIVED_CALL_INVITE', 'ANSWERING_CALL', 'CALL_CONNECTED']

      if (!this.dialer.parkedCall && !skippedStatuses.includes(this.dialer?.currentStatus)) {
        this.widgetMessage = WIDGET_MSG_SHOW_ALERT_CALL_FINISHED
        this.startDialing = false
        this.enableClickToDial()

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

      const params = {
        timezone: this.contactTimezone,
        name: this.contactName,
        calls_notifications_open_time: this.currentCompany.calls_notifications_open_time,
        calls_notifications_close_time: this.currentCompany.calls_notifications_close_time
      }

      this.checkContactTimezone(params, this.makeCall, this.cancelCall)
    },

    cancelCall () {
      // remove loading page if there is no ask about line
      if (!this.isAlwaysAskModeEnabled()) {
        this.handleCallCompletedEvent()
      }
    },

    handleAgentStatusUpdate (data) {
      if (
        this.currentCompany?.id === data.company_id &&
        this.profile?.id === data.user_id) {
        const agentStatus = data.agent_status

        if (['GENERATING_TOKEN', 'TOKEN_GENERATED', 'READY'].includes(this.dialer?.currentStatus) &&
          !this.dialer?.parkedCall) {
          if (agentStatus === AGENT_STATUS_ON_CALL) {
            this.widgetMessage = WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL
          } else if (agentStatus === AGENT_STATUS_ON_WRAP_UP &&
            !this.checkForceDisposition &&
            this.widgetMessage !== WIDGET_MSG_SHOW_ALERT_CALL_FINISHED) {
            this.widgetMessage = WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL
          } else if (agentStatus === AGENT_STATUS_ACCEPTING_CALLS &&
            this.widgetMessage !== WIDGET_MSG_SHOW_ALERT_CALL_FINISHED &&
            !this.startDialing) {
            this.widgetMessage = WIDGET_MSG_SHOW_ALERT_CALL_NOT_STARTED
          }
        }
      }
    },

    makeCall () {
      if (this.callDisabled || this.campaignId === null) {
        return
      }

      // Disable click-to-dial functionality
      this.disableClickToDial()

      this.$VueEvent.fire('makeCall', {
        currentNumber: this.$options.filters.fixPhone(this.salesforceDialNumber?.number),
        outboundCampaignId: this.campaignId.toString(),
        contactName: this.contactName,
        companyName: this.companyName,
        contactId: this.contactId
      })
    },

    predefinedCampaign () {
      if (this.shouldUseCompanyCampaignId()) {
        this.defaultOutboundCampaignId = this.currentCompany.default_outbound_campaign_id
      } else if (this.shouldUseProfileCampaignId()) {
        this.defaultOutboundCampaignId = this.authProfile.default_outbound_campaign_id
      }

      if (this.defaultOutboundCampaignId) {
        this.campaignId = this.defaultOutboundCampaignId
      }
    },

    async findDefaultOutboundCampaign () {
      if (this.isAlwaysAskModeEnabled()) {
        await this.setLastUsedCallLine()
        return
      }

      this.predefinedCampaign()

      if (this.defaultOutboundCampaignId) {
        this.setCampaignIdAndDialNumber()
      }
    },

    shouldUseCompanyCampaignId () {
      return this.currentCompany &&
        (this.currentCompany.force_outbound_line ||
          (this.authProfile?.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ACCOUNT_DEFAULT &&
            !this.authProfile.default_outbound_campaign_id))
    },

    shouldUseProfileCampaignId () {
      return this.authProfile &&
        this.authProfile.default_outbound_campaign_id &&
        this.authProfile?.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ACCOUNT_DEFAULT
    },

    setCampaignIdAndDialNumber () {
      this.campaignId = this.defaultOutboundCampaignId
      this.handleDialNumber()
    },

    canHandleDialNumber () {
      return this.initialized &&
        this.authProfile &&
        this.dialer?.isReady &&
        // if isAlwaysAskModeEnabled is true then dialing will be triggered from select campaign dialog component
        (this.campaignId !== null ? !this.isAlwaysAskModeEnabled() : false) &&
        (this.agentStatus === AgentStatus.AGENT_STATUS_ON_WRAP_UP ? !this.checkForceDisposition : true)
    },

    checkAgentHasActiveCallInAnotherDevice () {
      return this.widgetMessage === WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL
    },

    async setLastUsedCallLine () {
      if (this.campaignId || !this.contactId) return

      try {
        const data = await this.getLastUsedCallLineByContactId(this.contactId)
        this.handleChangeCampaignEvent(data.campaign_id)
      } catch (error) {
        this.$handleErrors(error.response)
      }
    },
    loadOpenCtiScript () {
      // Don't load the script if it's already been loaded
      if (this.opencti_loaded) {
        console.log('OpenCTI already loaded, skipping script load')
        return
      }

      // Check if the script is already loaded in the DOM
      if (document.querySelector(`script[src="${this.opencti_script_path}"]`)) {
        console.log('OpenCTI script already exists in DOM')

        // If script exists but window.sforce doesn't, remove the script to reload it
        if (!window.sforce || !window.sforce.opencti) {
          console.log('Script exists but window.sforce not found, reloading script')
          const existingScript = document.querySelector(`script[src="${this.opencti_script_path}"]`)
          existingScript.remove()
        } else {
          this.opencti_loaded = true
          this.initializeOpenCti()
          return
        }
      }

      console.log('Loading Salesforce OpenCTI script from:', this.opencti_script_path)
      const script = document.createElement('script')
      script.src = this.opencti_script_path
      script.async = true

      script.onload = () => {
        console.log('Salesforce OpenCTI script loaded successfully')
        this.opencti_loaded = true
        this.initializeOpenCti()
      }

      script.onerror = (error) => {
        console.error('Failed to load Salesforce OpenCTI script:', error)
        this.widgetMessage = WIDGET_MSG_CRITICAL_ERROR_HAPPENED
      }

      document.head.appendChild(script)
    },

    initializeOpenCti () {
      if (typeof window.sforce === 'undefined' || !window.sforce.opencti) {
        console.error('Salesforce OpenCTI API (window.sforce.opencti) is not available')
        this.widgetMessage = WIDGET_MSG_CRITICAL_ERROR_HAPPENED
        return
      }

      this.enableClickToDial()

      // Set up click-to-dial event listener
      const clickToDialListener = (payload) => {
        console.log('Click-to-dial event received with number:', payload)
        window.sforce.opencti.setSoftphonePanelVisibility({
          visible: true
        })

        if (payload.number) {
          // Set the phone number to call
          this.setSalesforceDialNumber(payload)

          if (!this.initialized || this.checkAgentHasActiveCallInAnotherDevice()) {
            return
          }

          this.widgetMessage = WIDGET_MSG_HIDE

          // Handle the dial action if we're logged in and ready
          if (this.initialized && this.authProfile) {
            this.postDialNumber()
          }
        }
      }

      // Register the click-to-dial listener
      window.sforce.opencti.onClickToDial({
        listener: clickToDialListener
      })

      // if salesforceDialNumber is not empty then we are here after login page so we can dial the number
      if (this.initialized && this.authProfile && this.salesforceDialNumber) {
        this.widgetMessage = WIDGET_MSG_HIDE
        this.postDialNumber()
      }
    }
  },

  watch: {
    'dialer.currentStatus' () {
      if (!this.startDialing) {
        if (this.isLoadingDialer) {
          if (this.dialer?.currentStatus === 'READY') {
            this.widgetMessage = WIDGET_MSG_SHOW_ALERT_CALL_NOT_STARTED
          }
        } else {
          if (this.dialer?.currentStatus === 'WRAP_UP' &&
            this.checkForceDisposition) {
            this.disableClickToDial()
            this.$VueEvent.fire('showPhone')
            this.widgetMessage = WIDGET_MSG_HIDE
          }
        }
      }
    },
    'dialer.parkedCall' () {
      // switch message when parked call was finished by client
      if (this.dialer?.parkedCall === undefined &&
        this.dialer?.currentStatus === 'READY' &&
        this.widgetMessage === WIDGET_MSG_HIDE) {
        this.widgetMessage = WIDGET_MSG_SHOW_ALERT_CALL_FINISHED
      }
    }
  },

  beforeDestroy () {
    // Clean up event listeners
    if (this.listeners.newInAppCall) {
      this.$VueEvent.stop('new_in_app_call', this.listeners.newInAppCall)
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
