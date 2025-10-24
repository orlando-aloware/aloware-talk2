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

    <!-- Start HubSpot Integration Disabled State -->
    <div class="p-3" v-if="displayState === DisplayState.HUBSPOT_INTEGRATION_DISABLED">
      <p><strong>HubSpot Integration Disabled</strong></p>
      <hr>
      <p>Please enable the HubSpot integration in the settings page to use this widget.</p>
      <q-btn
        color="primary"
        label="Reload Widget"
        class="full-width q-mt-md"
        @click="reloadWidget"
      />
    </div>
    <!-- End HubSpot Integration Disabled State -->

    <!-- Start Ready for Calls State -->
    <div class="p-3" v-else-if="displayState === DisplayState.READY_FOR_CALLS">
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

    <!-- Start Incoming Call UI (REMOTE mode only) -->
    <calling-remote-incoming-call
      v-if="displayState === DisplayState.INCOMING_CALL && incomingCallData"
      :contact-name="incomingCallData.contact?.name || 'Unknown Caller'"
      :phone-number="incomingCallData.contact?.phone_number"
      :company-name="incomingCallData.contact?.company_name"
      :is-call-connected="dialer?.currentStatus === DialerStatus.CALL_CONNECTED"
      @accept="handleAcceptCall"
      @decline="handleDeclineCall"
    />
    <!-- End Incoming Call UI -->

    <!-- Start Active Call UI (REMOTE mode only) -->
    <calling-remote-active-call
      v-else-if="displayState === DisplayState.CALLING_REMOTE_ACTIVE_CALL && activeCallData"
      :contact-name="activeCallData.contact?.name || 'Unknown Contact'"
      :phone-number="activeCallData.contact?.phone_number"
      :company-name="activeCallData.contact?.company_name"
    />
    <!-- End Active Call UI -->

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
import { hubspotCallingExtensionsClient as HubSpotCallingExtensionsClient, ComponentMode } from 'src/utils/HubSpotCallingExtensionsClient'
import Webrtc from 'components/webrtc'
import DialerListeners from 'components/dialer-listeners'
import LogoutIcon from 'components/icons/logout-icon'
import CallingRemoteIncomingCall from './components/CallingRemoteIncomingCall'
import CallingRemoteActiveCall from './components/CallingRemoteActiveCall'
import { mapState, mapActions } from 'vuex'
import * as AgentStatus from 'src/constants/agent-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import { DialerStatus } from 'src/constants/dialer-status'
import { OUTBOUND_CALLING_MODE_ACCOUNT_ALWAYS_ASK, OUTBOUND_CALLING_MODE_ACCOUNT_DEFAULT } from 'src/constants/user-outbound-calling-modes'
import { BroadcastMessageTypes } from 'src/constants/hubspot-softphone-broadcast'
import { local as localStorageHelper } from 'src/plugins/helpers/storage'
import { agentMixin, dispositionsMixin, helperMixin, timezoneCheckMixin, notificationMixin } from 'src/plugins/mixins'
import HubSpotWidgetService from 'src/services/integrations/hubspot/HubSpotWidgetService'
import HubSpotBroadcastManager from 'src/services/integrations/hubspot/HubSpotBroadcastManager'
import { DisplayState } from 'src/constants/hubspot-widget-display-states'

// Dialer statuses where we should display a loading indicator while the dialer component initializes
const DIALER_INITIALIZATION_STATUSES = [DialerStatus.GENERATING_TOKEN, DialerStatus.TOKEN_GENERATED, DialerStatus.READY, null]

const HUBSPOT_WIDGET_SIZE = {
  height: 522,
  width: 300
}

export default {
  name: 'HubSpotSoftPhone',

  components: {
    Webrtc,
    DialerListeners,
    LogoutIcon,
    CallingRemoteIncomingCall,
    CallingRemoteActiveCall
  },

  mixins: [agentMixin, dispositionsMixin, helperMixin, timezoneCheckMixin, notificationMixin],

  props: {
    apiKey: {
      required: false
    }
  },

  data () {
    return {
      // Service instances
      widgetService: null,
      broadcastManager: null,

      // Constants
      DisplayState,
      DialerStatus,
      BroadcastMessageTypes,

      campaignId: null,

      // Dialer states
      isDialed: false,
      dialerRetryTimeout: null,

      // Display state - controls which UI to show
      displayState: DisplayState.HIDE,

      // Loading and UI state
      isPreparingOutboundCall: false,
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

      // HubSpot portal ID received from SDK
      hubspotPortalId: null,

      // HubSpot widget visibility state
      isCallingWidgetVisible: true,

      // Inbound call state for REMOTE mode
      incomingCallData: null,

      // Active call state for REMOTE mode
      activeCallData: null,

      // HubSpot Calling Extensions SDK instance
      extensions: null,

      // Component mode of the widget (REMOTE and WINDOW)
      componentMode: ComponentMode.UNKNOWN,

      // Contact details for calls
      contactDetails: {
        contactName: '',
        contactTimezone: '',
        companyName: '',
        contactId: null
      },

      // HubSpot Calling Extensions SDK configuration options
      callSdkOptions: {
        debugMode: true, // Whether to log various inbound/outbound messages to the console
        eventHandlers: {
          onReady: (data) => {
            // Reset dialer to clean state when HubSpot SDK is ready (timers, call data, call controls, etc.)
            this.$VueEvent.fire('resetCall')

            this.componentMode = data.iframeLocation
            this.hubspotPortalId = data.portalId

            // Re-initialize BroadcastManager with the correct componentMode
            if (this.broadcastManager) {
              this.broadcastManager.initialize(this.componentMode, this.handleBroadcastMessage)
            }

            const payload = {
              isLoggedIn: this.authenticated,
              isAvailable: this.isAgentAvailable,
              sizeInfo: HUBSPOT_WIDGET_SIZE
            }

            // Signal to HubSpot that the widget is ready with the given payload status and ready to receive events
            if (!this.extensions) return
            this.extensions.initialized(payload)
          },

          onDialNumber: async (data) => {
            // Outbound calls should only be handled in Window mode
            if (this.componentMode === ComponentMode.REMOTE) {
              return
            }

            this.setHubspotDialNumber(data)

            if (!this.authenticated) {
              // User needs to log in first, redirect to the login page
              await this.$router.push({ name: 'Login', query: { redirect: '/widgets/hubspot-call-extension' } })
              return
            }

            // Ignore outbound calls if HubSpot integration is disabled
            if (!this.isHubspotIntegrationEnabled) {
              console.log('[HubSpot Widget] Ignoring outbound call - integration is disabled')
              return
            }
            
            // Check for active, parked calls, or ringing
            const hasActiveOrParkedCall =
              this.isDialed ||
              this.profile?.agent_status === AgentStatus.AGENT_STATUS_ON_CALL ||
              this.dialer?.currentStatus === DialerStatus.CALL_CONNECTED ||
              this.dialer?.currentStatus === DialerStatus.RECEIVED_CALL_INVITE ||
              this.dialer?.parkedCall
            
            if (hasActiveOrParkedCall) {
              console.log('[HubSpot Widget] Call in progress, ignoring outbound call')
              this.$generalNotification('You are already engaged in a call', 'warning', 2500, true)
              return
            }

            await this.postDialNumber()
          },

          onVisibilityChanged: (data) => {
            this.isCallingWidgetVisible = !data?.isHidden
            if (!this.isCallingWidgetVisible) {
              console.log('Widget is now hidden - ending active call')
              this.endActiveCall()
            }
          },
          
          onCreateEngagementFailed: () => {
            // We don't use this event, but we define it to silence the warnings in the console
          },

          onCallerIdMatchFailed: () => {
            // We don't use this event, but we define it to silence the warnings in the console
          },
        }
      }
    }
  },
  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapState('auth', ['authenticated', 'profile']),
    ...mapState(['dialer', 'hubspotDialNumber']),

    /**
     * Checks if HubSpot integration is enabled for the current company
     */
    isHubspotIntegrationEnabled () {
      return this.currentCompany && this.currentCompany.hubspot_integration_enabled
    },

    // Determines if an agent can receive calls used to update the isAvailable property in callSdkOptions
    isAgentAvailable () {
      return this.profile && this.profile.agent_status === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS
    },

    // Determines if webrtc component should be shown (user authenticated and component ready)
    shouldShowWebrtc () {
      const shouldShow = this.profile && this.initialized && this.componentMode === ComponentMode.WINDOW // TODO: ComponentMode maybe not needed?
      console.log('[HubSpot Widget] shouldShowWebrtc check:', {
        profile: !!this.profile,
        initialized: this.initialized,
        componentMode: this.componentMode,
        shouldShow: shouldShow
      })
      return shouldShow
    },

    // Shows loading spinner during dialer initialization
    isLoadingDialer () {
      // Don't show loading if HubSpot integration is disabled
      if (this.displayState === DisplayState.HUBSPOT_INTEGRATION_DISABLED) {
        return false
      }

      if (this.isPreparingOutboundCall || !this.initialized) {
        return true
      }

      // Don't show loading if the agent is in wrap-up - show the wrap-up UI instead
      // Check both agent status and dialer status to catch wrap-up during initialization
      if ((this.profile?.agent_status === AgentStatus.AGENT_STATUS_ON_WRAP_UP && this.checkForceDisposition) ||
          this.dialer?.currentStatus === DialerStatus.WRAP_UP) {
        return false
      }

      return DIALER_INITIALIZATION_STATUSES.includes(this.dialer?.currentStatus) &&
        !this.dialer?.parkedCall &&
        this.displayState === DisplayState.HIDE
    },

    /**
     * Determines if the user should be prompted for campaign selection before each call
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
     * Agent status for display
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
        this.dialer.currentStatus === DialerStatus.WRAP_UP

      return this.loadingAgentStatus ||
        [DialerStatus.RECEIVED_CALL_INVITE, DialerStatus.MAKING_CALL, DialerStatus.CALL_CONNECTED].includes(this.dialer.currentStatus) ||
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
     * Handles incoming broadcast messages from the other component instance (REMOTE <-> WINDOW)
     *
     * @param {MessageEvent} event - Broadcast message event containing type and payload
     */
    handleBroadcastMessage (event) {
      const { type, payload } = event.data

      switch (type) {
        case BroadcastMessageTypes.INCOMING_CALL_STARTED:
          // Show a custom incoming call UI in REMOTE mode
          if (this.componentMode === ComponentMode.REMOTE) {
            // If we're already in an active call, ignore this broadcast
            if (this.displayState === DisplayState.CALLING_REMOTE_ACTIVE_CALL) {
              return
            }

            this.showIncomingCallUI(payload)
          }
          break

        case BroadcastMessageTypes.ACCEPT_INBOUND_CALL:
          // Answer the call in WINDOW mode
          if (this.componentMode === ComponentMode.WINDOW) {
            this.$VueEvent.fire('answerCall')
          }
          break

        case BroadcastMessageTypes.CALL_CONNECTED:
          // Show active call UI in REMOTE mode
          if (this.componentMode === ComponentMode.REMOTE) {
            this.showActiveCallUI(payload)
          }

          break

        case BroadcastMessageTypes.CALL_ENDED:
          // Hide the active call UI and return to the ready state in REMOTE mode
          if (this.componentMode === ComponentMode.REMOTE) {
            this.hideActiveCallUI()
          }
          break

        case BroadcastMessageTypes.CALL_CANCELLED:
          // Hide the incoming call UI in REMOTE mode
          if (this.componentMode === ComponentMode.REMOTE) {
            this.hideIncomingCallUI()
          } else if (this.componentMode === ComponentMode.WINDOW) {
            // Decline the call in WINDOW mode
            this.$VueEvent.fire('rejectCall')
          }
          break

        case BroadcastMessageTypes.REQUEST_CURRENT_STATE:
          // In WINDOW mode, send the current call state to Remote
          if (this.componentMode !== ComponentMode.REMOTE) {
            console.log('[WINDOW] Received state request from Remote, sending current state')
            this.sendCurrentState(payload.requestId)
          }
          break

        case BroadcastMessageTypes.CURRENT_STATE_RESPONSE:
          // In REMOTE mode, receive and apply the current call state from Window
          if (this.componentMode !== ComponentMode.WINDOW) {
            console.log('[REMOTE] Received current state from Window:', payload)
            this.applyCurrentState(payload)
          }
          break

        case BroadcastMessageTypes.USER_LOGGED_IN:
          // Another instance logged in successfully, reload page to ensure clean state
          if (!this.authenticated) {
            console.log('[HubSpot Widget] Other instance logged in, reloading page...')
            window.location.reload()
          } else {
            console.log('[HubSpot Widget] Other instance logged in, but already authenticated - ignoring')
          }
          break

        case BroadcastMessageTypes.WIDGET_RELOAD_REQUESTED:
          // Another instance requested widget reload, reload this instance too
          console.log('[HubSpot Widget] Reload requested from other instance, reloading page...')
          window.location.reload()
          break

        default:
          console.log('[HubSpot Widget] Unhandled broadcast message type:', type)
      }
    },
    
    /**
     * Sends the current call state to REMOTE in response to REQUEST_CURRENT_STATE
     *
     * @param {string} requestId - Request ID from Remote
     */
    sendCurrentState (requestId) {
        this.broadcastManager?.sendCurrentState({
          requestId,
          profile: this.profile,
          dialer: this.dialer,
          incomingCallData: this.incomingCallData,
          activeCallData: this.activeCallData
        })
    },

    /**
     * Applies current state received (Used by REMOTE)
     *
     * @param {object} payload - State payload from Window
     */
    applyCurrentState (payload) {
      const { hasActiveCall, callType, communication, contact } = payload

      if (!hasActiveCall) {
        this.displayState = DisplayState.READY_FOR_CALLS
        return
      }

      if (callType === 'incoming' && communication && contact) {
        this.showIncomingCallUI({ communication, contact })
      } else if (callType === 'active' && communication && contact) {
        this.showActiveCallUI({ communication, contact })
      } else {
        console.log('[HubSpot Widget] Invalid state received - showing ready state')
        this.displayState = DisplayState.READY_FOR_CALLS
      }
    },

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
          await this.$router.push({ name: 'Login', query: { redirect: '/widgets/hubspot-call-extension' } })
        }
      }
    },

    /**
     * Handles post-authentication logic
     */
    handleUserLogin () {
      // Check if HubSpot integration is enabled first
      if (!this.isHubspotIntegrationEnabled) {
        this.displayState = DisplayState.HUBSPOT_INTEGRATION_DISABLED
        return
      }
      
      if (this.callExtensionsInitialized) {
        this.extensions.userLoggedIn()
        // Change agent status if profile allows, no call is active, and no force disposition is required or missing to complete.
        if (this.profile && this.profile?.go_to_available_after_login && !this.dialer.call && !this.checkForceDisposition) {
          this.changeAgentStatus(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS, false, 1, 'Talk-InitAuth-3')
        }
      }
      
      /**
       * if empty, then onDialNumber event was not called - skip calling,
       * if not empty, then dialer was called, so we must dial the number
       */
      if (!this.hubspotDialNumber) {
        // Check for incoming/active calls in REMOTE mode after page refresh
        if (this.componentMode === ComponentMode.REMOTE) {
          // For RINGING status, request the current state from Window
          if (this.profile?.agent_status === AgentStatus.AGENT_STATUS_RINGING) {
            console.log('[REMOTE] Agent is ringing - requesting current state from Window')
            this.displayState = DisplayState.READY_FOR_CALLS
            this.broadcastManager?.requestCurrentState(`remote-${Date.now()}`)
          } else if (this.profile?.agent_status === AgentStatus.AGENT_STATUS_ON_CALL ||
            this.dialer?.currentStatus === DialerStatus.MAKING_CALL ||
            this.dialer?.currentStatus === DialerStatus.CALL_CONNECTED) {
            // Show active call UI when the agent is on call OR actively dialing/connected
            this.validateHasActiveCallStatus()
          }
        }
        
        // Don't change displayState if the agent is ringing, in wrap-up, showing incoming call, or showing active call UI
        // Also check dialer status for outbound calls that are in progress
        const shouldNotChangeToReady =
          this.profile?.agent_status === AgentStatus.AGENT_STATUS_RINGING ||
          this.profile?.agent_status === AgentStatus.AGENT_STATUS_ON_CALL ||
          (this.profile?.agent_status === AgentStatus.AGENT_STATUS_ON_WRAP_UP && this.checkForceDisposition) ||
          this.dialer?.currentStatus === DialerStatus.MAKING_CALL ||
          this.dialer?.currentStatus === DialerStatus.CALL_CONNECTED ||
          this.displayState === DisplayState.CALLING_REMOTE_ACTIVE_CALL ||
          this.displayState === DisplayState.INCOMING_CALL
        
        if (!shouldNotChangeToReady) {
          this.displayState = DisplayState.READY_FOR_CALLS
        }
        
        return
      }
      
      this.postDialNumber()
    },

    /**
     * Initiates the actual call process
     */
    async postDialNumber () {
      if (!this.isHubspotIntegrationEnabled) {
        console.log('[HubSpot Widget] postDialNumber blocked - integration is disabled')
        return
      }

      this.isPreparingOutboundCall = true

      try {
        this.displayState = DisplayState.HIDE

        const result = await this.widgetService.initiateOutboundCall({
          dialer: this.dialer,
          profile: this.profile,
          hubspotDialNumber: this.hubspotDialNumber,
          isAlwaysAskModeEnabled: this.isAlwaysAskModeEnabled,
          campaignId: this.campaignId,
          shouldUseCompanyCampaignId: this.shouldUseCompanyCampaignId,
          shouldUseProfileCampaignId: this.shouldUseProfileCampaignId,
          currentCompany: this.currentCompany
        })

        if (!result.success) {
          this.displayState = result.displayState || DisplayState.CRITICAL_ERROR_HAPPENED

          // If there's an active call, stop here
          if (result.hasActiveCall) {
            return
          }

          return
        }

        this.displayState = result.displayState
        if (result.campaignId) {
          this.campaignId = result.campaignId
        }
        
        if (result.contactDetails) {
          this.contactDetails = { ...this.contactDetails, ...result.contactDetails }
        }

        // Update profile if last call was fetched
        if (result.lastCall) {
          this.setProfile({ last_call: result.lastCall })
        }
      } catch (error) {
        console.error('Error during postDialNumber:', error)
        this.displayState = DisplayState.CRITICAL_ERROR_HAPPENED
        return
      } finally {
        this.isPreparingOutboundCall = false
      }

      await this.handleDialNumber()
    },

    async handleDialNumber () {
      const result = this.widgetService.executeDialFlow({
        dialer: this.dialer,
        profile: this.profile,
        isCallingWidgetVisible: this.isCallingWidgetVisible,
        campaignId: this.campaignId,
        isAlwaysAskModeEnabled: this.isAlwaysAskModeEnabled,
        checkForceDisposition: this.checkForceDisposition,
        callExtensionsInitialized: this.callExtensionsInitialized,
        initialized: this.initialized
      })

      switch (result.action) {
        case 'skip':
          // Active call or any other reason to skip
          console.log('Skipping dial:', result.reason)
          break

        case 'show_alert':
          // Show alert and update the display state
          this.displayState = result.displayState
          console.log('Showing alert:', result.reason)
          break

        case 'make_call':
          // All conditions met, proceed with call
          this.displayState = result.displayState
          this.startDialing = true
          this.handleCall()
          break

        case 'retry':
          // Dialer is not ready, retry after delay
          console.log('Dialer not ready, setting retry timeout')
          this.dialerRetryTimeout = setTimeout(() => {
            this.handleDialNumber()
          }, result.retryDelay)
          break

        case 'show_dialer':
          // Conditions not met, show dialer UI
          this.displayState = DisplayState.HIDE
          this.startDialing = true
          console.log('Conditions not met, showing dialer UI:', result.reason)
          break

        default:
          console.warn('Unknown action from executeDialFlow:', result.action)
      }
    },

    /**
     * Handle agent status transitions and update the display state accordingly - notifies HubSpot of availability changes
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

        // Agent became available after wrap-up - return to ready state
        if (agentStatus === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS && previousStatus === AgentStatus.AGENT_STATUS_ON_WRAP_UP) {
          // Clear active call data and transition to the ready state
          this.activeCallData = null
          this.displayState = DisplayState.READY_FOR_CALLS
          if (this.dialer?.currentStatus === DialerStatus.WRAP_UP) this.$VueEvent.fire('resetCall') // Reset dialer status if it's still in wrap-up
        } else if (agentStatus === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS && this.displayState === DisplayState.SHOW_ALERT_AGENT_ON_CALL && !this.isDialed) {
          // Agent became available while showing "on call" alert - return to ready state
          this.displayState = DisplayState.READY_FOR_CALLS
        } else if (agentStatus === AgentStatus.AGENT_STATUS_ON_WRAP_UP && this.checkForceDisposition) {
          // Agent entered wrap-up with forced dispositions
          // Keep activeCallData if showing Active Call UI (for REMOTE mode during wrap-up)
          // Set dialer status to WRAP_UP if it's not already set
          if (this.dialer?.currentStatus !== DialerStatus.WRAP_UP) {
            this.setDialerCurrentStatus(DialerStatus.WRAP_UP)
          }

          // Only change the displayState if not showing Active Call UI
          if (this.displayState !== DisplayState.CALLING_REMOTE_ACTIVE_CALL) {
            this.displayState = DisplayState.HIDE
          }
        }

        // if we finished - don't need to handle the dial number
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
          this.dialer?.currentStatus === DialerStatus.WRAP_UP &&
          previousStatus === AgentStatus.AGENT_STATUS_ON_WRAP_UP) {
          this.isDialed = false
          this.onCancelCall()
        }
      }
    },

    makeCall () {
      // Block making calls if integration is disabled
      if (!this.isHubspotIntegrationEnabled) {
        console.log('[HubSpot Widget] makeCall blocked - integration is disabled')
        return
      }
      
      const result = this.widgetService.placeCall({
        campaignId: this.campaignId,
        hubspotDialNumber: this.hubspotDialNumber,
        contactDetails: this.contactDetails,
        profile: this.profile,
        dialer: this.dialer
      })

      if (!result.success) {
        if (result.hasActiveCall) {
          console.log('[HubSpot Widget] Active call detected, skipping')
          return
        }
        this.displayState = result.displayState || DisplayState.CRITICAL_ERROR_HAPPENED
        return
      }

      this.displayState = result.displayState
      this.$VueEvent.fire('makeCall', result.callParams)
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
     * Handles call completion events from a webrtc component
     */
    handleCallCompletedEvent () {
      const skippedStatuses = [DialerStatus.MAKING_CALL, DialerStatus.RECEIVED_CALL_INVITE, DialerStatus.ANSWERING_CALL, DialerStatus.CALL_CONNECTED]

      // some logic can send wrong status of call completed in a short time when call is just initiating
      if (skippedStatuses.includes(this.dialer?.currentStatus)) {
        return
      }

      if (this.extensions) {
        this.extensions.callEnded()

        // Broadcast CALL_ENDED to REMOTE mode when the call ends in WINDOW mode
        if (this.componentMode === ComponentMode.WINDOW) {
          this.broadcastManager?.broadcastCallEnded(this.dialer?.communication?.id, Date.now())
        }

        // In REMOTE mode, don't change the display state if showing active call UI - wait for broadcast
        if (this.componentMode === ComponentMode.REMOTE && this.displayState === DisplayState.CALLING_REMOTE_ACTIVE_CALL) {
          console.log('[REMOTE] Skipping state change - active call UI is showing')
          return
        }
        
        // Return to ready state when call is completed
        if (!this.dialer.parkedCall) {
          this.displayState = DisplayState.READY_FOR_CALLS
          this.startDialing = false
          this.isDialed = false
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
    handleCall () {
      // Block call initiation if integration is disabled
      if (!this.isHubspotIntegrationEnabled) {
        console.log('[HubSpot Widget] handleCall blocked - integration is disabled')
        return
      }

      // if there's a call in progress or in wrap up, we omit the call
      if (this.validateHasActiveCallStatus()) {
        return
      }

      const params = {
        timezone: this.contactDetails.contactTimezone,
        name: this.contactDetails.contactName,
        calls_notifications_open_time: this.currentCompany.calls_notifications_open_time,
        calls_notifications_close_time: this.currentCompany.calls_notifications_close_time
      }

      this.checkContactTimezone(params, this.makeCall, this.onCancelCall)
      this.isDialed = true
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
        // Notify HubSpot SDK that a user is logging out
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
        this.setDialerCurrentStatus(DialerStatus.OFFLINE)

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
     * Handle inbound calls from Aloware and notify HubSpot (WINDOW mode only)
     */
    async handleIncomingCall (communication) {
      /** TODO: Remove Logs **/
      console.log('[HubSpot Widget] handleIncomingCall called with:', communication)
      console.log('[HubSpot Widget] Component mode:', this.componentMode)
      console.log('[HubSpot Widget] Is authenticated:', this.authenticated)
      console.log('[HubSpot Widget] Is agent available:', this.isAgentAvailable)
      
      if (!this.authenticated) {
        console.log('[HubSpot Widget] User not authenticated, skipping inbound call')
        return
      }

      if (!this.isHubspotIntegrationEnabled) {
        console.log('[HubSpot Widget] Ignoring inbound call - integration is disabled')
        return
      }

      if (!this.isAgentAvailable) {
        console.log('[HubSpot Widget] Agent not available, skipping inbound call')
        return
      }

      if (this.componentMode !== ComponentMode.WINDOW) {
        return
      }

      const result = this.widgetService.handleIncomingCall(
        communication,
        this.extensions,
        this.processActionNotification,
        (type, payload) => this.broadcastManager?.publish(type, payload)
      )

      // Apply the returned state
      if (result.success) {
        this.setDialerCommunication(result.communication)
        this.setDialerContact(result.contact)
        this.setDialerCurrentStatus(result.dialerStatus)
        this.displayState = result.displayState
      }
    },

    /**
     * Shows custom incoming call UI in REMOTE mode
     */
    showIncomingCallUI (payload) {
      if (this.componentMode === ComponentMode.WINDOW) {
        return
      }

      const result = this.widgetService.showIncomingCall(payload, this.dialer, this.profile)
      this.displayState = result.displayState
      this.incomingCallData = result.incomingCallData

      // Re-check after a short delay in case the call was accepted very quickly (edge case)
      setTimeout(() => {
        const isConnectedNow = this.dialer?.currentStatus === DialerStatus.CALL_CONNECTED ||
                               this.profile?.agent_status === AgentStatus.AGENT_STATUS_ON_CALL

        if (this.displayState === DisplayState.INCOMING_CALL && isConnectedNow) {
          this.showActiveCallUI({ communication: payload.communication, contact: payload.contact })
        }
      }, 500)
    },

    /**
     * Hides incoming call UI in REMOTE mode
     */
    hideIncomingCallUI () {
      if (this.componentMode === ComponentMode.WINDOW) {
        return
      }

      const result = this.widgetService.hideIncomingCall(this.dialer, this.profile)
      
      if (result.shouldClearData) {
        this.incomingCallData = null
      }

      if (result.displayState && this.displayState === DisplayState.INCOMING_CALL) {
        this.displayState = result.displayState
      }
    },

    /**
     * Shows custom active call UI in REMOTE mode
     */
    showActiveCallUI (payload) {
      if (this.componentMode === ComponentMode.WINDOW) {
        return
      }

      const result = this.widgetService.showActiveCall(payload)

      this.displayState = result.displayState
      this.activeCallData = result.activeCallData
      this.incomingCallData = result.incomingCallData
    },

    /**
     * Hides active call UI in REMOTE mode
     */
    hideActiveCallUI () {
      if (this.componentMode === ComponentMode.WINDOW) {
        return
      }

      if (this.displayState === DisplayState.CALLING_REMOTE_ACTIVE_CALL) {
        const result = this.widgetService.hideActiveCall(this.profile, this.checkForceDisposition)

        if (!result.shouldKeepUI) {
          this.activeCallData = result.activeCallData
          this.displayState = result.displayState
        }
      }
    },

    /**
     * Handles accept button click in REMOTE mode
     */
    handleAcceptCall () {
      if (this.componentMode === ComponentMode.WINDOW) {
        return
      }

      const result = this.widgetService.acceptCall(this.incomingCallData, this.dialer, this.profile)

      switch (result.action) {
        case 'show_active_call':
          // Call already connected, so force-show the active call UI instead of accepting the call
          this.displayState = result.displayState
          this.activeCallData = result.activeCallData
          this.incomingCallData = result.incomingCallData
          break

        case 'broadcast_accept':
          // Broadcast to WINDOW mode to accept the call
          this.broadcastManager?.broadcastAcceptInboundCall(result.broadcast.payload.communicationId, result.broadcast.payload.contactId)
          this.hideIncomingCallUI()
          break

        case 'skip':
          break
      }
    },

    /**
     * Handles decline button click in REMOTE mode
     */
    handleDeclineCall () {
      if (this.componentMode === ComponentMode.WINDOW) {
        return
      }

      const result = this.widgetService.declineCall(this.incomingCallData, this.dialer, this.profile)

      switch (result.action) {
        case 'show_active_call':
          // Call already connected, so force show active call UI instead of declining the call
          this.displayState = result.displayState
          this.activeCallData = result.activeCallData
          this.incomingCallData = result.incomingCallData
          break

        case 'broadcast_decline':
          // Broadcast to WINDOW mode to decline the call
          this.broadcastManager?.broadcastCallCancelled(
            result.broadcast.payload.communicationId
          )

          // Fire reject event if needed
          if (result.fireRejectEvent) {
            this.$VueEvent.fire('rejectCall')
          }

          // Hide the incoming call UI
          this.hideIncomingCallUI()
          break

        case 'skip':
          break
      }
    },

    /**
     * Ends any active call when the HubSpot widget becomes hidden (closed)
     */
    endActiveCall () {
      const result = this.widgetService.endActiveCall(this.dialer, this.checkDialerForceDisposition)

      // Update display state
      this.displayState = result.displayState
      this.isDialed = false

      // Fire all events returned by the service
      result.eventsToFire.forEach(eventName => {
        this.$VueEvent.fire(eventName)
      })

      // Handle call completion
      this.handleCallCompletedEvent(true)
    },

    /**
     * Validates if there's an active call status that should prevent new calls
     */
    validateHasActiveCallStatus () {
      const lastCall = this.profile?.last_call

      const status = this.widgetService.validateActiveCallStatus(
        this.profile,
        this.dialer,
        this.componentMode,
        lastCall
      )

      // Handle state updates if there's an active call
      if (status) {
        if (lastCall) {
          this.setDialerCommunication(lastCall)
          this.setDialerContact(lastCall?.contact)
        }

        // do not show a widget message when force disposition; in this case, the dialer will appear with wrap-up page
        if (lastCall &&
          // the last call should not be held
          lastCall.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW &&
          this.profile.agent_status !== AgentStatus.AGENT_STATUS_ON_CALL &&
          this.checkForceDisposition) {
          this.setDialerCurrentStatus(DialerStatus.WRAP_UP)
          this.displayState = DisplayState.HIDE // Show webrtc component with wrap-up UI
        } else if (this.componentMode === ComponentMode.REMOTE && this.profile.agent_status === AgentStatus.AGENT_STATUS_RINGING) {
          // In REMOTE mode, don't use lastCall for incoming calls - wait for broadcast
          this.displayState = DisplayState.READY_FOR_CALLS
        } else if (this.componentMode === ComponentMode.REMOTE &&
                   (this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL ||
                    this.dialer?.currentStatus === DialerStatus.MAKING_CALL ||
                    this.dialer?.currentStatus === DialerStatus.CALL_CONNECTED)) {
          // In REMOTE mode, show active call UI when the agent is on call OR actively dialing/connected
          const contact = this.widgetService.resolveContactDetails(this.contactDetails, this.hubspotDialNumber, this.dialer, this.dialer?.lastCall)
          this.showActiveCallUI({
            communication: lastCall || this.dialer?.communication,
            contact: contact
          })
          
        } else {
          this.displayState = DisplayState.SHOW_ALERT_AGENT_ON_CALL
        }
      }

      return status
    },

    /**
     * Broadcasts CALL_CONNECTED event with contact data
     */
    broadcastCallConnected () {
      const data = this.widgetService.prepareCallConnectedData(
        this.dialer,
        this.contactDetails,
        this.hubspotDialNumber
      )

      this.broadcastManager?.broadcastCallConnected(data.communication, data.contact)
    },

    /**
     * Reloads the widget by refreshing the window
     * Also broadcasts to another widget instance to reload as well
     */
    reloadWidget () {
      console.log('[HubSpot Widget] Reload widget button clicked, broadcasting to other instance...')

      this.broadcastManager?.broadcastWidgetReload('user_clicked_reload_button')

      // Small delay to ensure the broadcast is sent before reloading
      setTimeout(() => {
        window.location.reload()
      }, 100)
    },

    /**
     * Gets contact details from HubSpot API
     */
    async getContact () {
      const result = await this.widgetService.fetchContactDetails(
        this.hubspotDialNumber,
        this.isAlwaysAskModeEnabled
      )

      if (result.success) {
        this.contactDetails = { ...this.contactDetails, ...result.contactDetails }
        
        if (result.campaignId) {
          this.campaignId = result.campaignId
        }
        
        if (result.lastCall) {
          this.setProfile({ last_call: result.lastCall })
        }
      } else {
        this.$handleErrors(result.error?.response)
        this.displayState = DisplayState.CRITICAL_ERROR_HAPPENED
        
        if (this.extensions) {
          this.extensions.callEnded()
        }

        throw result.error
      }
    }
  },
  watch: {
    /**
     * Updates the logged-in status in HubSpot if it changes in Aloware
     */
    authenticated (newVal) {
      if (newVal && this.extensions) {
        this.extensions.initialized({
          isLoggedIn: newVal,
          isAvailable: this.isAgentAvailable,
          sizeInfo: HUBSPOT_WIDGET_SIZE
        })
      }
    },

    /**
     * Stops dialing if there is a display state change
     */
    displayState (to) {
      if (to !== DisplayState.HIDE && this.startDialing) {
        this.startDialing = false
      }
    },

    /**
     * Handles widget visibility changes to maintain correct UI state
     */
    isCallingWidgetVisible (newVal) {
      if (newVal) {
        // Widget became visible - check if agent is on call
        if (this.profile && this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL) {
          this.displayState = DisplayState.SHOW_ALERT_AGENT_ON_CALL
        }
      } else {
        // Widget was hidden - clear dial number to prevent state leaks
        this.setHubspotDialNumber(null)
      }
    },
    
    /**
     * Update the agent status in HubSpot if it changes in Aloware
     * Only WINDOW mode should update HubSpot availability to prevent duplicate signals
     */
    'profile.agent_status' (newStatus) {
      this.callSdkOptions.isAvailable = this.isAgentAvailable

      // Only WINDOW mode should notify HubSpot of availability changes
      // REMOTE mode just displays the UI state
      if (this.callExtensionsInitialized && this.extensions && this.componentMode !== ComponentMode.REMOTE) {
        if (newStatus === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS) {
          this.extensions.userAvailable()
        } else {
          this.extensions.userUnavailable()
        }
      }
    },

    /**
     * Watch for dialer status changes to ensure the wrap-up state is properly set
     */
    'dialer.currentStatus' (newStatus, oldStatus) {
      // Broadcast CALL_CONNECTED to REMOTE mode when the call connects in WINDOW mode
      if (this.componentMode === ComponentMode.WINDOW &&
          newStatus === DialerStatus.CALL_CONNECTED &&
          oldStatus !== DialerStatus.CALL_CONNECTED) {

        // For unparked calls, the communication is loaded asynchronously after status changes
        // We need to wait for it to be loaded before broadcasting
        const attemptBroadcast = (retryCount = 0) => {
          if (!this.dialer?.communication && retryCount < 5) {
            console.log(`[DEBUG] Communication not loaded yet (attempt ${retryCount + 1}/5), retrying...`)
            setTimeout(() => attemptBroadcast(retryCount + 1), 200) // Retry after 200ms
          } else {
            if (!this.dialer?.communication) {
              console.log('[WARNING] Communication still not loaded after 5 retries, broadcasting anyway')
            }
            this.broadcastCallConnected()
          }
        }

        // Start with the initial 100ms delay
        setTimeout(() => attemptBroadcast(), 100)
      }

      // When the dialer becomes READY and the agent is in wrap-up, restore the wrap-up state
      // But only if we're coming from an initialization state AND this widget has the communication (edge case)
      if (newStatus === DialerStatus.READY &&
          this.profile?.agent_status === AgentStatus.AGENT_STATUS_ON_WRAP_UP &&
          this.checkForceDisposition &&
          this.dialer?.communication && // Only restore if this widget has the communication
          oldStatus !== DialerStatus.WRAP_UP) {
        console.log('[DEBUG] Restoring wrap-up state')
        this.validateHasActiveCallStatus()
      }

      // Keep the dialer in WRAP_UP if the agent is still in wrap-up AND this widget has the communication
      // But allow transition when agent status changes to ACCEPTING_CALLS (wrap-up completion)
      if (this.profile?.agent_status === AgentStatus.AGENT_STATUS_ON_WRAP_UP &&
          newStatus !== DialerStatus.WRAP_UP &&
          this.checkForceDisposition &&
          this.dialer?.communication && // Only force if this widget has the communication
          oldStatus !== DialerStatus.WRAP_UP && // Allow any transition FROM WRAP_UP (wrap-up completion flow)
          newStatus !== DialerStatus.GENERATING_TOKEN && // Don't force during token generation
          newStatus !== DialerStatus.TOKEN_GENERATED) { // Don't force after token is generated
        console.log('[DEBUG] Forcing dialer back to WRAP_UP')
        this.setDialerCurrentStatus(DialerStatus.WRAP_UP)
      }
    }
  },

  beforeDestroy () {
    // Clean up inbound call listener
    this.$VueEvent.stop('new_in_app_call', this.handleIncomingCall)

    // End any active call when the component is destroyed
    if (this.isHubspotIntegrationEnabled) {
      this.endActiveCall()
    }

    this.broadcastManager?.close()
  },

  async created () {
    this.setIsWidget(false) // TODO: set back to false
    this.setIsHubSpotWidget(true)

    if (this.$route.query.small) {
      this.small = true
    }
  },
  
  async mounted () {
    // Initialize service that handles all business logic for the HubSpot calling widget
    this.widgetService = new HubSpotWidgetService({
      $axios: this.$axios,
      $VueEvent: this.$VueEvent,
      $generalNotification: this.$generalNotification,
      $options: this.$options,
      $bvModal: this.$bvModal,
      vuexActions: {
        check: this.check,
        setCurrentCompany: this.setCurrentCompany,
        resetVuex: this.resetVuex,
        setProfile: this.setProfile,
        setDialerCommunication: this.setDialerCommunication,
        setDialerContact: this.setDialerContact,
        setDialerCurrentStatus: this.setDialerCurrentStatus,
        changeAgentStatus: this.changeAgentStatus,
        checkForceDisposition: () => this.checkForceDisposition
      }
    })

    let probableError = null

    // Check if we just came from login - if so, reload to ensure HubSpot SDK reinitialized (edge case)
    if (this.$route.query.from_login === 'true') {
      console.log('[HubSpot Widget] Detected from_login param, reloading to reinitialize SDK...')
      // Remove the query param and reload
      const url = new URL(window.location.href)
      url.searchParams.delete('from_login')
      window.location.replace(url.toString())
      return
    }

    // Initialize Broadcast Manager for cross-instance communication (REMOTE <-> WINDOW)
    this.broadcastManager = new HubSpotBroadcastManager({
      onMessageCallback: this.handleBroadcastMessage
    })

    this.broadcastManager.initialize(this.componentMode, this.handleBroadcastMessage)

    // Initialize HubSpot SDK
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

    // Set up listener for inbound calls from Aloware
    this.$VueEvent.listen('new_in_app_call', this.handleIncomingCall)
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
  position: relative;
  max-width: 350px;
  margin: 0 auto;
  height: auto !important;
  min-height: 522px;
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
