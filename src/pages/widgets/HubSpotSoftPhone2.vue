<template>
  <div class="widget-container">

    <!-- Start Loading Spinner -->
    <b-overlay
      class="h-100 w-100 position-absolute"
      bg-color='#15163f'
      opacity='1'
      :show="isLoadingDialer"
    >
      <template #overlay>
        <q-spinner-bars
          color="white"
          size="2em"
        />
      </template>
    </b-overlay>
    <!-- End Loading Spinner -->

    <!-- Start Dialer Listeners -->
    <dialer-listeners
      @user-logged-in="handleUserLogin"
      @agent-status-updated="handleAgentStatusUpdate"
    />
    <!-- End Dialer Listeners -->

    <!-- Start Default State (No call started) -->
    <div class="p-3" v-if="widgetMessage === WidgetMessage.SHOW_ALERT_CALL_NOT_STARTED">
      <div class="status-header">
        <div class="d-flex align-items-center">
          <strong>Ready for Calls</strong>
        </div>
        <div class="d-flex align-items-center">
          <p>Waiting for HubSpot to initiate a call...</p>
        </div>
      </div>
    </div>
    <!-- End Default State (No call started) -->

    <!-- Start Webrtc -->
    <webrtc
      v-if="isUserAuthenticated"
      v-show='widgetMessage === WidgetMessage.HIDE && !isLoadingDialer'
      :campaignId="campaignId"
      :class="[small ? 'small' : '']"
      :isAlwaysAskModeEnabled="isAlwaysAskModeEnabled"
      :init-broadcast='false'
      :start-dialing="startDialing"
      @callCompleted="handleCallCompletedEvent"
      @changeCampaignId="handleChangeCampaignEvent"
      @handleCall="handleCall"
    />
    <!-- End Webrtc -->
  </div>
</template>
<script>
import HubSpotCallingExtensionsClient from 'src/utils/HubSpotCallingExtensionsClient'
import Webrtc from 'components/webrtc'
import DialerListeners from 'components/dialer-listeners'
import { mapState, mapActions } from 'vuex'
import { AGENT_STATUS_ACCEPTING_CALLS, AGENT_STATUS_ON_CALL, AGENT_STATUS_ON_WRAP_UP } from 'src/constants/agent-status'
import { OUTBOUND_CALLING_MODE_ACCOUNT_ALWAYS_ASK, OUTBOUND_CALLING_MODE_ACCOUNT_DEFAULT } from 'src/constants/user-outbound-calling-modes'
import { local as localStorageHelper } from 'src/plugins/helpers/storage'
import { agentMixin, dispositionsMixin, helperMixin, timezoneCheckMixin, notificationMixin } from 'src/plugins/mixins'

const WidgetMessage = Object.freeze({
  HIDE: 1,
  SHOW_ALERT_AGENT_ON_CALL: 2,
  SHOW_ALERT_CALL_FINISHED: 3,
  SHOW_ALERT_CALL_NOT_STARTED: 4
})

const DIALER_STATUSES = ['GENERATING_TOKEN', 'TOKEN_GENERATED', 'READY', null]

const HUBSPOT_WIDGET_SIZE = {
  height: 522,
  width: 300
}

export default {
  name: 'HubSpotSoftPhone',

  components: {
    Webrtc,
    DialerListeners
  },

  mixins: [agentMixin, dispositionsMixin, helperMixin, timezoneCheckMixin, notificationMixin],

  data () {
    return {
      // Constants
      WidgetMessage,

      campaignId: null,

      // Prevents duplicate dialing attempts
      isDialed: false,

      // Widget message state - controls which UI to show
      widgetMessage: WidgetMessage.HIDE,

      // Loading and UI state
      isPreparingToCall: false,
      startDialing: false,
      small: false,

      // Campaign management
      defaultOutboundCampaignId: null,

      // HubSpot Calling Extensions SDK initialized
      callExtensionsInitialized: false,

      // Component initialization state
      initialized: false,

      // HubSpot portal ID received from SDK
      hubspotPortalId: null,

      // HubSpot widget visibility state
      isCallingWidgetVisible: true,

      // HubSpot Calling Extensions SDK configuration options
      callSdkOptions: {
        debugMode: true, // Whether to log various inbound/outbound messages to console
        eventHandlers: { // eventHandlers handle inbound messages
          onReady: (data) => {
            console.log('onReady event received:', data)

            // Reset dialer to clean state when HubSpot SDK is ready (timers, call data, call controls, etc.)
            this.$VueEvent.fire('resetCall')

            // Store the portal ID from HubSpot SDK
            this.hubspotPortalId = data.portalId
            console.log('Portal ID received from HubSpot SDK:', data.portalId)

            const payload = {
              // Whether a user is logged-in
              isLoggedIn: this.authenticated,
              // Whether the agent is available for calls
              isAvailable: this.isAgentAvailable,
              // Optionally send the desired widget size
              sizeInfo: HUBSPOT_WIDGET_SIZE
            }

            console.log('HubSpot payload:', {
              isLoggedIn: this.authenticated,
              isAvailable: this.isAgentAvailable,
              profile: this.profile,
              agentStatus: this.profile?.agent_status
            })

            // Signal to HubSpot that the widget is ready with given payload status and ready to receive events
            if (!this.extensions) return
            this.extensions.initialized(payload)
          },

          onDialNumber: async (data) => {
            console.log('Dial number event received from HubSpot:', data)
            this.setHubspotDialNumber(data.phoneNumber)

            if (!this.authenticated) {
              // User needs to login first, redirect to login page
              this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
              return
            }

            console.log('[HubSpot Widget] Proceeding with postDialNumber')
            await this.postDialNumber()
          },

          onIncomingCall: async (event) => {
            console.log('Incoming call received from HubSpot:', event)
            // This event is triggered when HubSpot receives a call
            // For now, we'll just log it - this would be used if calls came to HubSpot first
          },

          onVisibilityChanged: (data) => {
            console.log('onVisibilityChanged event received:', data)
            // Widget is visible if it's not hidden (minimized is OK for calling remote)
            // For calling remote: allow calls when minimized, end calls when hidden
            this.isCallingWidgetVisible = !data?.isHidden
            if (!this.isCallingWidgetVisible) {
              console.log('Widget is now hidden - ending active call')
              this.endActiveCall()
            }
          },

          onExternalCallIdNotPresent: (data) => {
            console.warn('External call ID not present:', data)
            // This is expected for some call flows, just log it
          },

          onInitiateCallIdFailed: (data) => {
            console.warn('Initiate call ID failed:', data)
            // Handle call initiation failure
          },

          onCallerIdMatchFailed: (data) => {
            console.warn('Caller ID match failed:', data)
            // Handle caller ID matching failure
          },

          onCreateEngagementFailed: (data) => {
            console.warn('Create engagement failed:', data)
            // Handle engagement creation failure
          }
        }
      }
    }
  },
  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapState('auth', ['authenticated', 'profile']),
    ...mapState(['dialer', 'hubspotDialNumber']),

    // Determines if agent can receive calls - prevents calls when agent is busy
    isAgentAvailable () {
      return this.profile && this.profile.agent_status === AGENT_STATUS_ACCEPTING_CALLS
    },

    // Ensures webrtc component only renders when user is authenticated and component is ready
    isUserAuthenticated () {
      return this.profile && this.initialized
    },

    // Shows loading spinner during dialer initialization
    isLoadingDialer () {
      if (this.isPreparingToCall || !this.initialized) {
        return true
      }

      return DIALER_STATUSES.includes(this.dialer?.currentStatus) &&
        !this.dialer?.parkedCall &&
        this.widgetMessage === WidgetMessage.HIDE
    },

    /**
     * Determines if user should be prompted for campaign selection before each call
     */
    isAlwaysAskModeEnabled () {
      if (!this.profile) {
        return false
      }

      const isCompanyAlwaysAsk = this.shouldUseCompanyCampaignId && !this.currentCompany.default_outbound_campaign_id
      const isUserAlwaysAsk = this.profile.outbound_calling_mode === OUTBOUND_CALLING_MODE_ACCOUNT_ALWAYS_ASK

      return isCompanyAlwaysAsk || isUserAlwaysAsk
    },

    /**
     * Determines if company campaign ID should be used for outbound calls
     */
    shouldUseCompanyCampaignId () {
      return this.currentCompany &&
        (this.currentCompany.force_outbound_line ||
          (this.profile?.outbound_calling_mode === OUTBOUND_CALLING_MODE_ACCOUNT_DEFAULT &&
            !this.profile.default_outbound_campaign_id))
    },

    /**
     * Determines if profile campaign ID should be used for outbound calls
     */
    shouldUseProfileCampaignId () {
      return this.profile && this.profile.default_outbound_campaign_id
    }
  },
  methods: {
    ...mapActions('auth', {
      logoutUser: 'logout',
      check: 'check',
      clear: 'clear',
      setAgentStatus: 'setAgentStatus',
      setProfile: 'setProfile'
    }),

    ...mapActions([
      'resetVuex',
      'setIsWidget',
      'setIsHubSpotWidget',
      'setHubspotDialNumber',
      'setDialerCommunication',
      'setDialerContact',
      'setDialerCurrentStatus'
    ]),

    ...mapActions('cache', [
      'setCurrentCompany'
    ]),

    /**
     * Authenticates user and sets up application state - required before any calling functionality
     */
    async initializeAuth () {
      if (this.apiKey) {
        localStorageHelper.setItem('api_token', this.apiKey)
      }

      try {
        const res = await this.check()
        localStorageHelper.setItem('company_id', res.data.user.company.id)
        this.setCurrentCompany(res.data.user.company)
        this.resetVuex(['all'])
        this.initialized = true
        this.handleUserLogin()
      } catch (err) {
        console.log('Error: api key is not valid', err)
        this.$handleErrors(err.response)
        if (this.$route.name !== 'Login') {
          this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
        }
      }
    },

    /**
     * Handles post-authentication logic - notifies HubSpot of login and initiates calls if needed
     */
    handleUserLogin () {
      if (this.extensionsInitialized) {
        this.extensions.userLoggedIn()
        // Change agent status if profile allows, no call is active, and no force disposition is required or missing to complete.
        if (this.profile && this.profile?.go_to_available_after_login && !this.dialer.call && !this.checkForceDisposition) {
          this.changeAgentStatus(AGENT_STATUS_ACCEPTING_CALLS, false, 1, 'Talk-InitAuth-3')
        }
      }

      /**
       * if empty then onDialNumber event was not called - skip calling,
       * if not empty then dialer was called, and we are here after login page so we must dial the number
       */
      // if not empty then dialer was called, and we are here after login page so we must dial the number
      if (!this.hubspotDialNumber) {
        this.widgetMessage = WidgetMessage.SHOW_ALERT_CALL_NOT_STARTED
        return
      }

      this.postDialNumber()
    },

    /**
     * Initiates the actual call process after authentication - placeholder for now
     */
    async postDialNumber () {
      this.$bvModal.hide('daytime-hours-confirmation')
      console.log('postDialNumber called')
    },

    /**
     * Handles agent status changes from global events - notifies HubSpot of availability changes
     */
    handleAgentStatusUpdate (data) {
      if (
        this.currentCompany?.id === data.company_id &&
        this.profile?.id === data.user_id &&
        this.profile.agent_status !== data.agent_status
      ) {
        const previousStatus = this.profile.agent_status
        const agentStatus = data.agent_status
        this.setAgentStatus(agentStatus)

        if (agentStatus === AGENT_STATUS_ACCEPTING_CALLS &&
          this.widgetMessage === WidgetMessage.SHOW_ALERT_AGENT_ON_CALL &&
          !this.isDialed) {
          // For HubSpot widget, return to ready state instead of showing call finished
          this.widgetMessage = WidgetMessage.SHOW_ALERT_CALL_NOT_STARTED
        } else if (this.widgetMessage !== WidgetMessage.SHOW_ALERT_AGENT_ON_CALL &&
          agentStatus === AGENT_STATUS_ON_CALL &&
          !this.isDialed) {
          this.widgetMessage = WidgetMessage.HIDE
        }

        // if we finished - don't need to handle dial number
        if (this.widgetMessage === WidgetMessage.SHOW_ALERT_CALL_FINISHED) {
          return
        }

        // Automatically close the widget when replying from another tab
        if (this.isDialed && !this.dialer.call && !this.dialer.communication && this.dialer.parkedCall && agentStatus === AGENT_STATUS_ON_CALL) {
          this.isDialed = false
          this.onCancelCall()
          return
        }

        // close widget if finish button in wrap-up page was not clicked but dialing started from another place
        if (this.isDialed &&
          [AGENT_STATUS_ACCEPTING_CALLS, AGENT_STATUS_ON_CALL].includes(agentStatus) &&
          this.dialer?.currentStatus === 'WRAP_UP' &&
          previousStatus === AGENT_STATUS_ON_WRAP_UP) {
          this.isDialed = false
          this.onCancelCall()
        }
      }
    },

    /**
     * Handles call cancellation
     */
    onCancelCall () {
      this.defineDefaultOutboundCampaignId()

      this.campaignId = this.defaultOutboundCampaignId

      // if the call is canceled, we close the widget in HS
      setTimeout(() => {
        if (this.extensions) {
          this.extensions.callCompleted({
            hideWidget: true
          })
        }
      }, 50)
    },

    /**
     * Defines the default outbound campaign ID
     */
    defineDefaultOutboundCampaignId () {
      if (this.shouldUseCompanyCampaignId) {
        this.defaultOutboundCampaignId = this.currentCompany.default_outbound_campaign_id
      } else if (this.shouldUseProfileCampaignId) {
        this.defaultOutboundCampaignId = this.profile.default_outbound_campaign_id
      } else { // if there's no a line by default, we remove the selected line
        this.defaultOutboundCampaignId = null
      }
    },

    /**
     * Handles call completion events from webrtc component
     */
    handleCallCompletedEvent (skipCallFinished = false) {
      console.log('Call completed event received:', skipCallFinished)
      // TODO: Implement call completion logic
    },

    /**
     * Handles campaign ID changes
     */
    handleChangeCampaignEvent (campaignId) {
      console.log('Campaign ID changed:', campaignId)
      this.campaignId = campaignId
    },

    /**
     * Handles call initiation
     */
    handleCall (callData) {
      console.log('Handle call event received:', callData)
      // TODO: Implement call handling logic
    },

    /**
     * Ends any active call when HubSpot widget becomes hidden
     */
    endActiveCall () {
      console.log('Ending active call due to widget visibility change')
      // TODO: Implement call ending logic
    }
  },
  watch: {
    authenticated (newVal) {
      if (newVal && this.extensions) {
        console.log('Authentication completed - updating HubSpot with logged-in status')
        this.extensions.initialized({
          isLoggedIn: newVal,
          isAvailable: this.isAgentAvailable,
          sizeInfo: HUBSPOT_WIDGET_SIZE
        })
      }
    }
  },
  async created () {
    this.setIsWidget(true)
    this.setIsHubSpotWidget(true)

    if (this.$route.query.small) {
      this.small = true
    }
  },
  async mounted () {
    let probableError = null

    try {
      this.extensions = await HubSpotCallingExtensionsClient.initialize(this.callSdkOptions)
    } catch (error) {
      // there may iframe issue like "Blocked a frame with origin" but we don't want to break the whole app, it is still usable
      console.log('Error during CallingExtensions init', error)
      probableError = error
    }

    if (!this.extensions) {
      window.Sentry.captureMessage('HubSpot SDK was not initiated', {
        level: 'warning',
        extra: {
          error: probableError
        }
      })
    }

    HubSpotCallingExtensionsClient.subscribe(this.callSdkOptions.eventHandlers)
    this.callExtensionsInitialized = true
    await this.initializeAuth()
  }
}
</script>
<style scoped>
html,
body {
  background: transparent !important;
  width: 300px;
  height: auto !important;
  min-height: auto !important;
  max-height: fit-content !important;
}

.widget-container {
  max-width: 350px;
  margin: 0 auto;
  height: auto !important;
  min-height: auto !important;
  max-height: fit-content !important;
}

/* Add border only for wide screens */
@media (min-width: 351px) {
  .widget-container {
    border: 1px solid #e0e0e0;
    border-radius: 0.75em;
    margin: 1.25em auto;
  }
}
</style>
