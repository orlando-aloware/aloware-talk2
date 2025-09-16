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

    <!-- Start Ready for Calls State -->
    <div class="p-3" v-if="displayState === DisplayState.READY_FOR_CALLS">
       <div class="status-header">
        <div class="d-flex align-items-center">
          <strong>{{ availabilityMessage }}</strong>
        </div>
        <div class="d-flex align-items-center">
          <q-select
            :value="agentStatus"
            :options="statusOptionsWithLogout"
            emit-value
            map-options
            :disable="shouldDisableStatusToggle"
            :loading="loadingAgentStatus"
            dense
            outlined
            style="min-width: 140px; width: 140px;"
            @input="handleAgentStatusChange"
          >
            <template v-slot:selected>
              <div class="row items-center no-wrap">
                <q-badge
                  :color="statusBadgeColor"
                  class="status-badge q-mr-sm"
                  size="sm"
                />
                <span>{{ statusLabel }}</span>
              </div>
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section avatar v-if="scope.opt.type !== 'logout'">
                  <q-badge
                    :color="scope.opt.color"
                    class="status-badge"
                    size="sm"
                  />
                </q-item-section>
                <q-item-section avatar v-else>
                  <logout-icon width="15" height="15" class="logout-icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label :class="scope.opt.type === 'logout' ? 'text-red-80' : ''">
                    {{ scope.opt.label }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </div>

      <hr class="section-divider">
      <p><strong>Outbound Calls:</strong> Click on any phone number in HubSpot to start dialing.</p>
      <p><strong>Inbound Calls:</strong> When you receive a call, it will automatically appear here for you to answer.</p>

      <hr>
      <!-- Start User Information Section -->
      <div v-if="authenticated && profile" class="user-info">
        <div class="logged-in-label">Logged in as</div>
        <div>
          <strong>{{ profile.first_name || profile.name }}</strong>
          <span v-if="profile.company_name">
            • {{ profile.company_name }}
          </span>
          <div v-if="profile.email">
            {{ profile.email }}
          </div>
        </div>
      </div>
      <!-- End User Information Section -->
    </div>
    <!-- End Ready for Calls State -->

    <!-- Start Critical Error State -->
    <div class="p-3" v-else-if="displayState === DisplayState.CRITICAL_ERROR_HAPPENED">
      <p><strong>Something went wrong</strong></p>
      <hr>
      <p>For some reason we couldn't complete the call. Please refresh the page and try again.</p>
    </div>
    <!-- End Critical Error State -->

    <!-- Start Agent On Call State -->
    <div
      v-else-if="displayState === DisplayState.SHOW_ALERT_AGENT_ON_CALL"
      class="p-3"
    >
      <p><strong>Call in Progress on Another Device</strong></p>
      <hr>
      <p>
        You're currently engaged in another call. Please complete your current conversation before
        initiating a new call.
      </p>
    </div>
    <!-- End Agent On Call State -->

    <!-- Start Webrtc -->
    <webrtc
      v-if="shouldShowWebrtc"
      v-show='displayState === DisplayState.HIDE && !isLoadingDialer'
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
import LogoutIcon from 'components/icons/logout-icon'
import { mapState, mapActions } from 'vuex'
import * as AgentStatus from 'src/constants/agent-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import { OUTBOUND_CALLING_MODE_ACCOUNT_ALWAYS_ASK, OUTBOUND_CALLING_MODE_ACCOUNT_DEFAULT } from 'src/constants/user-outbound-calling-modes'
import { local as localStorageHelper } from 'src/plugins/helpers/storage'
import { agentMixin, dispositionsMixin, helperMixin, timezoneCheckMixin, notificationMixin } from 'src/plugins/mixins'

const DisplayState = Object.freeze({
  HIDE: 1,
  SHOW_ALERT_AGENT_ON_CALL: 2,
  SHOW_ALERT_CALL_FINISHED: 3,
  READY_FOR_CALLS: 4,
  CRITICAL_ERROR_HAPPENED: 5
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
    DialerListeners,
    LogoutIcon
  },

  mixins: [agentMixin, dispositionsMixin, helperMixin, timezoneCheckMixin, notificationMixin],

  data () {
    return {
      // Constants
      DisplayState,

      campaignId: null,

      // Prevents duplicate dialing attempts
      isDialed: false,

      // Display state - controls which UI to show
      displayState: DisplayState.HIDE,

      // Loading and UI state
      isPreparingToCall: false,
      startDialing: false,
      small: false,

      // Agent status management
      loadingAgentStatus: false,
      isLoggingOut: false,

      // Campaign management
      defaultOutboundCampaignId: null,

      // HubSpot Calling Extensions SDK initialized
      callExtensionsInitialized: false,

      // Component initialization state
      initialized: false,
      isInitializing: true,

      // HubSpot portal ID received from SDK
      hubspotPortalId: null,

      // HubSpot widget visibility state
      isCallingWidgetVisible: true,

      // Contact details for calls
      contactDetails: {
        contactName: '',
        contactTimezone: '',
        companyName: '',
        contactId: null
      },

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

    // Determines if agent can receive calls, used to update the isAvailable property in callSdkOptions
    isAgentAvailable () {
      return this.profile && this.profile.agent_status === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS
    },

    // Determines if webrtc component should be shown (user authenticated and component ready)
    shouldShowWebrtc () {
      return this.profile && this.initialized
    },

    // Shows loading spinner during dialer initialization
    isLoadingDialer () {
      if (this.isPreparingToCall || !this.initialized) {
        return true
      }

      return DIALER_STATUSES.includes(this.dialer?.currentStatus) &&
        !this.dialer?.parkedCall &&
        this.displayState === DisplayState.HIDE
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
    },

    /**
     * Agent status getter/setter with automatic status change
     */
    agentStatus: {
      get () {
        return this.profile ? this.profile.agent_status : AgentStatus.AGENT_STATUS_OFFLINE
      },
      set (value) {
        this.changeAgentStatus(value, false, 1, 'HubSpot-StatusSelector')
      }
    },

    /**
     * Human-readable status label for display
     */
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

    /**
     * Color for status badge based on agent status
     */
    statusBadgeColor () {
      switch (this.agentStatus) {
        case AgentStatus.AGENT_STATUS_OFFLINE:
          return 'grey-6'
        case AgentStatus.AGENT_STATUS_ACCEPTING_CALLS:
          return 'green-6'
        case AgentStatus.AGENT_STATUS_ON_BREAK:
          return 'orange-6'
        case AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS:
        case AgentStatus.AGENT_STATUS_ON_CALL:
        case AgentStatus.AGENT_STATUS_ON_WRAP_UP:
        case AgentStatus.AGENT_STATUS_RINGING:
        case AgentStatus.AGENT_STATUS_AUTO_DIAL:
        case AgentStatus.AGENT_STATUS_SENTRY:
          return 'red-6'
        default:
          return 'grey-6'
      }
    },

    /**
     * Determines if status toggle should be disabled
     */
    shouldDisableStatusToggle () {
      const isForcedCallDisposition = this.currentCompany && this.currentCompany.force_call_disposition
      const isForcedContactDisposition = this.currentCompany && this.currentCompany.force_contact_disposition
      const isForcedDispositionOnWrapUp = (isForcedCallDisposition || isForcedContactDisposition) &&
        this.dialer.currentStatus === 'WRAP_UP'

      return this.loadingAgentStatus ||
        ['RECEIVED_CALL_INVITE', 'MAKING_CALL', 'CALL_CONNECTED'].includes(this.dialer.currentStatus) ||
        this.isAgentOnCall || isForcedDispositionOnWrapUp
    },

    /**
     * Available status options for the dropdown
     */
    statusOptions () {
      return [
        {
          label: 'Offline',
          value: AgentStatus.AGENT_STATUS_OFFLINE,
          color: 'grey-6'
        },
        {
          label: 'Available',
          value: AgentStatus.AGENT_STATUS_ACCEPTING_CALLS,
          color: 'green-6'
        },
        {
          label: 'Busy',
          value: AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS,
          color: 'red-6'
        },
        {
          label: 'On-break',
          value: AgentStatus.AGENT_STATUS_ON_BREAK,
          color: 'orange-6'
        }
      ]
    },

    /**
     * Status options including logout option
     */
    statusOptionsWithLogout () {
      return [
        ...this.statusOptions,
        {
          label: 'Logout',
          value: 'logout',
          type: 'logout'
        }
      ]
    },

    /**
     * Availability message for display
     */
    availabilityMessage () {
      switch (this.agentStatus) {
        case AgentStatus.AGENT_STATUS_OFFLINE:
          return 'Currently Offline'
        case AgentStatus.AGENT_STATUS_ACCEPTING_CALLS:
          return 'Ready for Calls'
        case AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS:
          return 'Not Accepting Calls'
        case AgentStatus.AGENT_STATUS_ON_BREAK:
          return 'On Break'
        case AgentStatus.AGENT_STATUS_ON_CALL:
          return 'Currently on Call'
        case AgentStatus.AGENT_STATUS_ON_WRAP_UP:
          return 'Wrapping Up Call'
        case AgentStatus.AGENT_STATUS_RINGING:
          return 'Incoming Call'
        case AgentStatus.AGENT_STATUS_AUTO_DIAL:
          return 'Auto Dialing'
        case AgentStatus.AGENT_STATUS_SENTRY:
          return 'Monitoring Calls'
        default:
          return 'Status Unknown'
      }
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
      if (this.callExtensionsInitialized) {
        this.extensions.userLoggedIn()
        // Change agent status if profile allows, no call is active, and no force disposition is required or missing to complete.
        if (this.profile && this.profile?.go_to_available_after_login && !this.dialer.call && !this.checkForceDisposition) {
          this.changeAgentStatus(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS, false, 1, 'Talk-InitAuth-3')
        }
      }

      /**
       * if empty then onDialNumber event was not called - skip calling,
       * if not empty then dialer was called, and we are here after login page so we must dial the number
       */
      // if not empty then dialer was called, and we are here after login page so we must dial the number
      if (!this.hubspotDialNumber) {
        this.displayState = DisplayState.READY_FOR_CALLS
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

        if (agentStatus === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS &&
          this.displayState === DisplayState.SHOW_ALERT_AGENT_ON_CALL &&
          !this.isDialed) {
          // For HubSpot widget, return to ready state instead of showing call finished
          this.displayState = DisplayState.READY_FOR_CALLS
        } else if (this.displayState !== DisplayState.SHOW_ALERT_AGENT_ON_CALL &&
          this.isInitializing &&
          agentStatus === AgentStatus.AGENT_STATUS_ON_CALL &&
          !this.isDialed) {
          this.displayState = DisplayState.HIDE
        }

        // if we finished - don't need to handle dial number
        if (this.displayState === DisplayState.SHOW_ALERT_CALL_FINISHED) {
          return
        }

        // Automatically close the widget when replying from another tab
        if (this.isDialed && !this.dialer.call && !this.dialer.communication && this.dialer.parkedCall && agentStatus === AgentStatus.AGENT_STATUS_ON_CALL) {
          this.isDialed = false
          this.onCancelCall()
          return
        }

        // close widget if finish button in wrap-up page was not clicked but dialing started from another place
        if (this.isDialed &&
          [AgentStatus.AGENT_STATUS_ACCEPTING_CALLS, AgentStatus.AGENT_STATUS_ON_CALL].includes(agentStatus) &&
          this.dialer?.currentStatus === 'WRAP_UP' &&
          previousStatus === AgentStatus.AGENT_STATUS_ON_WRAP_UP) {
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
      const skippedStatuses = ['MAKING_CALL', 'RECEIVED_CALL_INVITE', 'ANSWERING_CALL', 'CALL_CONNECTED']

      // some logic can send wrong status of call completed in a short time when call is just initiating
      if (skippedStatuses.includes(this.dialer?.currentStatus)) {
        return
      }

      if (this.extensions) {
        this.extensions.callEnded()

        if (!this.dialer.parkedCall) {
          // Return to ready state when call is completed
          this.displayState = DisplayState.READY_FOR_CALLS
          this.startDialing = false
        }

        if (!this.defaultOutboundCampaignId) {
          this.campaignId = null
        }
      }
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
     * Handles agent status change from the dropdown
     */
    handleAgentStatusChange (value) {
      if (value === 'logout') {
        return this.handleAgentLogout()
      }

      this.changeAgentStatus(value, false, 1, 'HubSpot-StatusSelector')
    },

    /**
     * Handles agent logout
     */
    async handleAgentLogout () {
      this.isLoggingOut = true

      try {
        // Notify HubSpot SDK that user is logging out
        if (this.extensions) {
          this.extensions.userLoggedOut()
        }

        // Use the standard logout action which will handle the API call and state clearing
        await this.logoutUser()

        // Reset dialer state
        this.displayState = DisplayState.HIDE
        this.startDialing = false
        this.isDialed = false
        this.setHubspotDialNumber(null)
        this.setDialerCommunication(null)
        this.setDialerContact(null)
        this.setDialerCurrentStatus('OFFLINE')

        // Reset extensions state
        this.isCallingWidgetVisible = false

        // Redirect to login page with current route as redirect parameter
        this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
      } catch (error) {
        console.error('Error during logout:', error)
        this.$generalNotification('Failed to log out. Please try again.', 'error', 5000, true)
      } finally {
        this.isLoggingOut = false
      }
    },

    /**
     * Handle inbound calls from Aloware and notify HubSpot
     */
    async handleIncomingCall (communication) {
      console.log('Inbound call received:', communication)

      if (!this.authenticated) {
        console.log('User not authenticated, skipping inbound call')
        return
      }

      if (!this.isAgentAvailable) {
        console.log('Agent not available, skipping inbound call')
        return
      }

      // For HubSpot inbound calls, we need to properly notify HubSpot
      if (this.extensions) {
        console.log('Extensions available, proceeding with HubSpot notification')
        const phoneNumber = this.$options.filters.fixPhone(communication.contact?.phone_number)

        try {
          // Notify HubSpot about the inbound call
          this.extensions.incomingCall({
            phoneNumber: phoneNumber,
            contactName: communication.contact?.name || 'Unknown Caller',
            contactId: communication.contact?.id?.toString(),
            callId: communication.id?.toString()
          })
          console.log('Successfully notified HubSpot about inbound call')
        } catch (error) {
          console.error('Error handling HubSpot notification:', error)
          // Continue with the call flow even if HubSpot notification fails
        }
      } else {
        console.log('No extensions available')
      }

      // Set up the dialer state for the main Aloware system to handle
      this.displayState = DisplayState.HIDE
      this.setDialerCommunication(communication)
      this.setDialerContact(communication.contact)
      this.setDialerCurrentStatus('RECEIVED_CALL_INVITE')

      console.log('Set dialer state for inbound call:', {
        communication: communication.id,
        contact: communication.contact?.name,
        status: 'RECEIVED_CALL_INVITE'
      })

      // Call processActionNotification to trigger the action notification system
      // This is what shows the accept/reject buttons
      this.processActionNotification(communication, 'call')

      console.log('Inbound call handling completed successfully')
    },

    /**
     * Ends any active call when HubSpot widget becomes hidden
     */
    endActiveCall () {
      this.displayState = DisplayState.HIDE
      this.isDialed = false

      if (this.dialer?.currentStatus === 'WRAP_UP' && !this.checkDialerForceDisposition) {
        this.$VueEvent.fire('endWrapUp')
      }

      if (this.dialer?.communication?.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW) {
        this.$VueEvent.fire('hangupCall')
      }

      if (!this.checkDialerForceDisposition) {
        this.$VueEvent.fire('resetCall')
      }

      this.handleCallCompletedEvent(true)
    },

    /**
     * Validates if there's an active call status that should prevent new calls
     */
    validateHasActiveCallStatus () {
      let status = false

      if (this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL ||
        (this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_WRAP_UP && this.checkForceDisposition)) {
        status = true
      }

      const statuses = [
        'MAKING_CALL',
        'CALL_CONNECTED',
        'HANGING_UP_CALL',
        'CALL_DISCONNECTED',
        'WRAP_UP',
        'ANSWERING_CALL'
      ]

      if (statuses.includes(this.dialer?.currentStatus)) {
        status = true
      }

      return status
    },

    /**
     * Resets agent status when needed
     */
    resetAgentStatus () {
      this.changeAgentStatus(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS, false, 1, 'Talk-ResetAgentStatus')
    },

    /**
     * Gets contact details from HubSpot API
     */
    async getContact () {
      const withLastUsedCallLine = this.isAlwaysAskModeEnabled()

      await this.$axios.post('/api/v1/integrations/hubspot/find-contact', {
        params: this.hubspotDialNumber,
        with_last_used_call_line: withLastUsedCallLine,
        with_last_call: true
      }).then(res => {
        const contact = res?.data?.contact
        this.contactDetails.contactName = this.getContactName(contact)
        this.contactDetails.contactTimezone = contact.timezone
        this.contactDetails.companyName = contact.company_name
        this.contactDetails.contactId = contact.id

        if (withLastUsedCallLine) {
          this.campaignId = res?.data?.last_used_call_line
        }
        const profile = {
          'last_call': res?.data?.last_call
        }
        this.setProfile(profile)
      }).catch(err => {
        this.$handleErrors(err.response)
        this.displayState = DisplayState.CRITICAL_ERROR_HAPPENED
        if (this.extensions) {
          this.extensions.callEnded()
        }

        throw err
      })
    }
  },
  watch: {
    /**
     * Updates the logged in status in HubSpot if it changes in Aloware
     * @param newVal
     */
    authenticated (newVal) {
      if (newVal && this.extensions) {
        console.log('Authentication completed - updating HubSpot with logged-in status')
        this.extensions.initialized({
          isLoggedIn: newVal,
          isAvailable: this.isAgentAvailable,
          sizeInfo: HUBSPOT_WIDGET_SIZE
        })
      }
    },
    /**
     * Updates the agent status in HubSpot if it changes in Aloware
     */
    'profile.agent_status' (newStatus) {
      this.callSdkOptions.isAvailable = this.isAgentAvailable

      if (this.callExtensionsInitialized && this.extensions) {
        if (newStatus === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS) {
          this.extensions.userAvailable()
        } else {
          this.extensions.userUnavailable()
        }
      }
    }
  },

  beforeDestroy () {
    // Clean up inbound call listener
    this.$VueEvent.stop('new_in_app_call', this.handleIncomingCall)
    console.log('Successfully removed new_in_app_call listener')
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
    this.isInitializing = false

    // Set up listener for inbound calls from Aloware
    console.log('Setting up listener for new_in_app_call events')
    this.$VueEvent.listen('new_in_app_call', this.handleIncomingCall)
    console.log('Successfully registered new_in_app_call listener')
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

/* Status Header */
.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.625em;
}

/* Section Divider */
.section-divider {
  margin-top: 0.625em;
}

/* User Info Section */
.user-info {
  margin-top: 1em;
}

/* Logged In Label */
.logged-in-label {
  font-size: 0.75em;
  color: #666;
}

.status-badge {
  border-radius: 50% !important;
  width: 8px !important;
  height: 8px !important;
  min-width: 8px !important;
  min-height: 8px !important;
  padding: 0 !important;
  display: inline-block !important;
}
</style>
