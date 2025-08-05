<template>
  <div class="widget-container">
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

    <dialer-listeners
      @user-logged-in="handleUserLogin"
      @agent-status-updated="handleAgentStatusUpdate"
    />

    <div
      class="p-3"
      v-if="widgetMessage === WIDGET_MSG_CRITICAL_ERROR_HAPPENED"
    >
      <p><strong>Something went wrong</strong></p>
      <hr>
      <p>For some reason we couldn't complete the call. Please refresh the page and try again.</p>
    </div>

    <div
      class="p-3"
      v-else-if="widgetMessage === WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL"
    >
      <p><strong>Call in Progress on Another Device</strong></p>
      <hr>
      <p>You're currently engaged in another call on Aloware Talk. Please complete your current conversation before
        initiating a new call.</p>
    </div>

    <div
      class="p-3"
      v-else-if="widgetMessage === WIDGET_MSG_SHOW_ALERT_CALL_FINISHED && dialer && !dialer.parkedCall"
    >
      <p><strong>Call Finished</strong></p>
      <hr>
      <p>Please close this window or click the back button to continue.</p>
    </div>

    <div class="p-3"
         v-else-if="widgetMessage === WIDGET_MSG_SHOW_ALERT_CALL_NOT_STARTED">
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
            @input="handleStatusChange"
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

      <!-- User Information Section -->
      <hr>
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
    </div>

    <webrtc
      :campaignId="campaignId"
      :class="[small ? 'small' : '']"
      :isAlwaysAskModeEnabled="isAlwaysAskModeEnabled()"
      :init-broadcast='false'
      :start-dialing="startDialing"
      v-show='widgetMessage === WIDGET_MSG_HIDE && !isLoadingDialer'
      v-if="allowed"
      @callCompleted="handleCallCompletedEvent"
      @changeCampaignId="handleChangeCampaignEvent"
      @handleCall="handleCall"
    />
  </div>
</template>

<script>
import DialerListeners from 'components/dialer-listeners.vue'
import Webrtc from 'components/webrtc'
import LogoutIcon from 'components/icons/logout-icon'
import * as AgentStatus from 'src/constants/agent-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as UserOutboundCallingModes from 'src/constants/user-outbound-calling-modes'
import * as storage from 'src/plugins/helpers/storage'
import { agentMixin, dispositionsMixin, helperMixin, timezoneCheckMixin, notificationMixin } from 'src/plugins/mixins'
import CallingExtensionsManager from 'src/utils/CallingExtensionsManager'
import { mapActions, mapState } from 'vuex'
import { CURRENT_STATUS_HOLD_NEW } from 'src/constants/communication-current-status'
import { AGENT_STATUS_ACCEPTING_CALLS, AGENT_STATUS_ON_CALL, AGENT_STATUS_ON_WRAP_UP } from 'src/constants/agent-status'

const WIDGET_MSG_HIDE = 1
const WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL = 2
const WIDGET_MSG_SHOW_ALERT_CALL_FINISHED = 3
const WIDGET_MSG_SHOW_ALERT_CALL_NOT_STARTED = 4
const WIDGET_MSG_CRITICAL_ERROR_HAPPENED = 5

export default {
  name: 'HubSpotSoftPhone',

  components: {
    Webrtc,
    DialerListeners,
    LogoutIcon
  },

  mixins: [timezoneCheckMixin, helperMixin, agentMixin, dispositionsMixin, notificationMixin],

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
      widgetMessage: WIDGET_MSG_HIDE,
      isFirstLoading: true,
      isDialed: false,
      startDialing: false,
      small: false,
      initialized: false,
      extensionsInitialized: false,
      // not always this can be switched to true before call
      // in HS Task view it's opening window automatically without sending event when
      // maybe it sends an event before our component is mounted
      extensionsVisibility: true,
      extensions: null,
      timeout: null,
      callSdkOptions: {
        // Whether to log various inbound/outbound messages to console
        debugMode: true,
        // eventHandlers handle inbound messages
        eventHandlers: {
          onReady: (data) => {
            console.log('onReady event received:', data)

            // Store the portal ID from HubSpot SDK
            this.hubspotPortalId = data.portalId
            console.log('Portal ID received from HubSpot SDK:', data.portalId)

            this.$VueEvent.fire('resetCall')

            const payload = {
              // Whether a user is logged-in
              isLoggedIn: this.authenticated,
              // Whether the agent is available for calls
              isAvailable: this.isAgentAvailable,
              // Optionally send the desired widget size
              sizeInfo: {
                height: 522,
                width: 300
              }
            }
            if (this.extensions) {
              this.extensions.initialized(payload)
            }
          },
          onDialNumber: async (event) => {
            this.setHubspotDialNumber(event)

            // do not continue if we not logged-in or we're already dialing
            if (!this.initialized || this.isDialed) {
              return
            }

            await this.postDialNumber()
          },
          onIncomingCall: async (event) => {
            console.log('Incoming call received from HubSpot:', event)
            // This event is triggered when HubSpot receives a call
            // For now, we'll just log it - this would be used if calls came to HubSpot first
          },
          onVisibilityChanged: (data) => {
            this.extensionsVisibility = !data?.isHidden

            if (!this.extensionsVisibility) {
              this.endActiveCall()
            }
          },
          // Add missing event handlers for HubSpot SDK errors
          onExternalCallIdNotPresent: (data) => {
            console.warn('External call ID not present:', data)
            // This is expected for some call flows, just log it
          },
          onInitiateCallIdFailed: (data) => {
            console.warn('Failed to initiate call ID:', data)
            // This might happen if HubSpot can't create the call record
            // Continue with the call flow
          },
          onCallerIdMatchFailed: (data) => {
            console.warn('Caller ID match failed:', data)
            // This might happen if the phone number doesn't match any contact
            // Continue with the call flow
          },
          onCreateEngagementFailed: (data) => {
            console.warn('Failed to create engagement:', data)
            // This might happen if HubSpot can't create the engagement record
            // Continue with the call flow
          }
        }
      },
      contactDetails: {
        contactName: '',
        contactTimezone: '',
        companyName: '',
        contactId: ''
      },
      campaignId: null,
      defaultOutboundCampaignId: null,
      isPreparingToCall: false,
      listeners: {
        userLoggedIn: null,
        agentStatusUpdated: null
      },
      // Adding the READY state to display a loading indicator during the Dialer's white screen loading phase.
      isLoadingDialerStatuses: ['GENERATING_TOKEN', 'TOKEN_GENERATED', 'READY', null],

      // HubSpot portal ID received from SDK
      hubspotPortalId: null,

      // Logout state
      isLoggingOut: false
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapState('auth', ['authenticated', 'profile']),
    ...mapState(['dialer', 'hubspotDialNumber']),

    allowed () {
      return this.profile && this.initialized
    },

    isLoadingDialer () {
      if (this.isPreparingToCall || !this.initialized) {
        return true
      }

      return this.isLoadingDialerStatuses.includes(this.dialer?.currentStatus) &&
        !this.dialer?.parkedCall &&
        this.widgetMessage === WIDGET_MSG_HIDE
    },

    isAgentAvailable () {
      // Agent is available only when status is ACCEPTING_CALLS
      return this.profile && this.profile.agent_status === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS
    },

    agentStatus: {
      get () {
        return this.profile ? this.profile.agent_status : AgentStatus.AGENT_STATUS_OFFLINE
      },
      set (value) {
        this.changeAgentStatus(value, false, 1, 'HubSpot-StatusSelector')
      }
    },

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

    shouldDisableStatusToggle () {
      const isForcedCallDisposition = this.currentCompany && this.currentCompany.force_call_disposition
      const isForcedContactDisposition = this.currentCompany && this.currentCompany.force_contact_disposition
      const isForcedDispositionOnWrapUp = (isForcedCallDisposition || isForcedContactDisposition) &&
        this.dialer.currentStatus === 'WRAP_UP'

      return this.loadingAgentStatus ||
        ['RECEIVED_CALL_INVITE', 'MAKING_CALL', 'CALL_CONNECTED'].includes(this.dialer.currentStatus) ||
        this.isAgentOnCall || isForcedDispositionOnWrapUp
    },

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

  created () {
    this.setIsWidget(true)

    if (this.$route.query.small) {
      this.small = true
    }
  },

  async mounted () {
    let probableError = null

    try {
      // init of CallingExtensions has to be once and do not repeat when, for instance, login page was called
      // otherwise we lose connection with parent window
      // that's why a global class was added
      this.extensions = await CallingExtensionsManager.initialize(this.callSdkOptions)
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

    CallingExtensionsManager.subscribe(this.callSdkOptions.eventHandlers)

    this.extensionsInitialized = true
    await this.init()
    this.isFirstLoading = false

    // Set up listener for inbound calls from Aloware
    console.log('Setting up listener for new_in_app_call events')
    this.$VueEvent.listen('new_in_app_call', this.handleIncomingCall)
    console.log('Successfully registered new_in_app_call listener')
  },

  beforeDestroy () {
    // Clean up inbound call listener
    this.$VueEvent.stop('new_in_app_call', this.handleIncomingCall)
    console.log('Successfully removed new_in_app_call listener')
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
      'setHubspotDialNumber',
      'setDialerCommunication',
      'setDialerContact',
      'setDialerCurrentStatus'
    ]),

    ...mapActions('cache', [
      'setCurrentCompany'
    ]),

    async postDialNumber () {
      this.$bvModal.hide('daytime-hours-confirmation')
      this.isPreparingToCall = true

      try {
        this.widgetMessage = WIDGET_MSG_HIDE

        do {
          if (this.dialer.currentStatus === 'GENERATING_TOKEN') {
            console.log('waiting for dialer token to be generated', this.dialer.currentStatus)
          }

          if (this.agentStatus === AgentStatus.AGENT_STATUS_ON_CALL) {
            console.log('waiting for agent to become available to make the call', this.dialer.currentStatus)
          }

          await new Promise(resolve => setTimeout(resolve, 500)) // Check every 0.5sec
        } while (this.dialer.currentStatus === 'GENERATING_TOKEN')

        await this.getContact()

        if (this.validateHasActiveCallStatus()) {
          return
        }

        // if dialing is initiating and current profile status is on wrap-up, then means that somewhere else wrap-up screen is not closed,
        // we need to initiate end wrap-up session to adequately tracking dialing statuses changes
        if (this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_WRAP_UP) {
          this.resetAgentStatus()
        }

        this.$VueEvent.fire('resetCall')
      } catch {
        return
      } finally {
        this.isPreparingToCall = false
      }

      if (!this.isAlwaysAskModeEnabled()) {
        this.defineDefaultOutboundCampaignId()

        if (this.defaultOutboundCampaignId) {
          this.campaignId = this.defaultOutboundCampaignId
        }
      }

      await this.handleDialNumber()
    },

    async init () {
      if (this.apiKey) {
        storage.local.setItem('api_token', this.apiKey)
      }

      await this.check().then((res) => {
        storage.local.setItem('company_id', res.data.user.company.id)
        this.setCurrentCompany(res.data.user.company)
        this.resetVuex(['all'])
        this.initialized = true
        this.handleUserLogin()
      }).catch((err) => {
        console.log('Error: api key is not valid', err)
        this.$handleErrors(err.response)
        if (this.$route.name !== 'Login') {
          this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
        }
      })
    },

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
        this.widgetMessage = WIDGET_MSG_CRITICAL_ERROR_HAPPENED
        if (this.extensions) {
          this.extensions.callEnded()
        }

        throw err
      })
    },

    async handleDialNumber () {
      console.log('Handle')
      console.log('CurrentStatus:', this.dialer?.currentStatus)

      if (this.validateHasActiveCallStatus()) {
        return
      }

      // stop if modal is disabled
      if (!this.extensionsVisibility) {
        this.widgetMessage = WIDGET_MSG_SHOW_ALERT_CALL_FINISHED
        return
      }

      // don't allow to make a call if there's a parked call
      if (this.dialer?.parkedCall) {
        this.widgetMessage = WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL
        return
      }

      this.widgetMessage = WIDGET_MSG_HIDE
      this.startDialing = true

      if (this.extensionsInitialized &&
        this.extensionsVisibility &&
        this.initialized &&
        this.profile &&
        this.dialer?.isReady &&
        // if isAlwaysAskModeEnabled is true then dialing will be triggered from select campaign dialog component
        (this.campaignId !== null ? !this.isAlwaysAskModeEnabled() : false) &&
        (this.agentStatus === AgentStatus.AGENT_STATUS_ON_WRAP_UP ? !this.checkForceDisposition : true)) {
        this.handleCall()
      } else if (!this.dialer?.isReady) {
        this.timeout = setTimeout(() => {
          this.handleDialNumber()
        }, 1000)
      } else {
        // do not handle call but show dialer, it supposes to show wrap-up or other useful UI
      }
    },

    handleUserLogin () {
      if (this.extensionsInitialized) {
        if (this.extensions) {
          this.extensions.userLoggedIn()
        }

        // Change agent status if profile allows, no call is active, and no force disposition is required or missing to complete.
        if (this.profile && this.profile?.go_to_available_after_login && !this.dialer.call && !this.checkForceDisposition) {
          this.changeAgentStatus(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS, false, 1, 'Talk-InitAuth-3')
        }
      }

      // if empty then onDialNumber event was not called - skip calling,
      // if not empty then dialer was called, and we are here after login page so we must dial the number
      if (!this.hubspotDialNumber) {
        this.widgetMessage = WIDGET_MSG_SHOW_ALERT_CALL_NOT_STARTED
        return
      }

      this.postDialNumber()
    },

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
          this.widgetMessage = WIDGET_MSG_SHOW_ALERT_CALL_NOT_STARTED
          this.startDialing = false
        }

        if (!this.defaultOutboundCampaignId) {
          this.campaignId = null
        }
      }
    },

    handleChangeCampaignEvent (campaignId) {
      this.campaignId = campaignId
    },

    handleCall () {
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
          this.widgetMessage === WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL &&
          !this.isDialed) {
          this.widgetMessage = WIDGET_MSG_SHOW_ALERT_CALL_FINISHED
        } else if (this.widgetMessage !== WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL &&
          this.isFirstLoading &&
          agentStatus === AgentStatus.AGENT_STATUS_ON_CALL &&
          !this.isDialed) {
          this.widgetMessage = WIDGET_MSG_HIDE
        }

        // if we finished - don't need to handle dial number
        if (this.widgetMessage === WIDGET_MSG_SHOW_ALERT_CALL_FINISHED) {
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
          [AGENT_STATUS_ACCEPTING_CALLS, AGENT_STATUS_ON_CALL].includes(agentStatus) &&
          this.dialer?.currentStatus === 'WRAP_UP' &&
          previousStatus === AGENT_STATUS_ON_WRAP_UP) {
          this.isDialed = false
          this.onCancelCall()
        }
      }
    },

    makeCall () {
      if (this.campaignId === null) {
        this.widgetMessage = WIDGET_MSG_CRITICAL_ERROR_HAPPENED
        this.$generalNotification('The dialer does not meet all the required criteria to start calling.', 'error', 5000, true)
        return
      }

      if (this.validateHasActiveCallStatus()) {
        return
      }

      this.widgetMessage = WIDGET_MSG_HIDE
      this.$VueEvent.fire('makeCall', {
        currentNumber: this.$options.filters.fixPhone(this.hubspotDialNumber?.phoneNumber),
        outboundCampaignId: this.campaignId.toString(),
        contactName: this.contactDetails.contactName,
        companyName: this.contactDetails.companyName,
        contactId: this.contactDetails.contactId
      })
    },

    defineDefaultOutboundCampaignId () {
      if (this.shouldUseCompanyCampaignId()) {
        this.defaultOutboundCampaignId = this.currentCompany.default_outbound_campaign_id
      } else if (this.shouldUseProfileCampaignId()) {
        this.defaultOutboundCampaignId = this.profile.default_outbound_campaign_id
      } else { // if there's no a line by default, we remove the selected line
        this.defaultOutboundCampaignId = null
      }
    },

    isAlwaysAskModeEnabled () {
      if (!this.profile) {
        return false
      }

      const isCompanyAlwaysAsk = this.shouldUseCompanyCampaignId() && !this.currentCompany.default_outbound_campaign_id
      const isUserAlwaysAsk = this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ACCOUNT_ALWAYS_ASK

      return isCompanyAlwaysAsk || isUserAlwaysAsk
    },

    shouldUseCompanyCampaignId () {
      return this.currentCompany &&
        (this.currentCompany.force_outbound_line ||
          (this.profile?.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ACCOUNT_DEFAULT &&
            !this.profile.default_outbound_campaign_id))
    },

    shouldUseProfileCampaignId () {
      return this.profile &&
        this.profile.default_outbound_campaign_id &&
        this.profile?.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ACCOUNT_DEFAULT
    },

    // status validates before starting dialing
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

      const lastCall = this.profile?.last_call

      // check if there is no last communication on hold
      if (lastCall && lastCall.current_status2 === CURRENT_STATUS_HOLD_NEW) {
        status = true
      }

      // define last call values to track useful updates if needed
      if (status) {
        if (lastCall) {
          this.setDialerCommunication(lastCall)
          this.setDialerContact(lastCall?.contact)
        }

        // do not show a widget message when force disposition, in this case, the dialer will appear with wrap-up page
        if (lastCall &&
          // the last call should not be held
          lastCall.current_status2 !== CURRENT_STATUS_HOLD_NEW &&
          this.profile.agent_status !== AgentStatus.AGENT_STATUS_ON_CALL &&
          this.checkForceDisposition) {
          this.setDialerCurrentStatus('WRAP_UP')
        } else {
          this.widgetMessage = WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL
        }
      }

      return status
    },

    endActiveCall () {
      this.widgetMessage = WIDGET_MSG_HIDE
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

    handleStatusChange (value) {
      if (value === 'logout') {
        return this.handleLogout()
      }

      this.changeAgentStatus(value, false, 1, 'HubSpot-StatusSelector')
    },

    async handleLogout () {
      this.isLoggingOut = true

      try {
        // Notify HubSpot SDK that user is logging out
        if (this.extensions) {
          this.extensions.userLoggedOut()
        }

        // Use the standard logout action which will handle the API call and state clearing
        await this.logoutUser()

        // Reset dialer state
        this.widgetMessage = WIDGET_MSG_HIDE
        this.startDialing = false
        this.isDialed = false
        this.setHubspotDialNumber(null)
        this.setDialerCommunication(null)
        this.setDialerContact(null)
        this.setDialerCurrentStatus('OFFLINE')

        // Reset extensions state
        this.extensionsVisibility = false

        // Redirect to login page with current route as redirect parameter
        this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
      } catch (error) {
        console.error('Error during logout:', error)
        this.$generalNotification('Failed to log out. Please try again.', 'error', 5000, true)
      } finally {
        this.isLoggingOut = false
      }
    },

    // Handle inbound calls from Aloware and notify HubSpot
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
      this.widgetMessage = WIDGET_MSG_HIDE
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
    }
  },

  watch: {
    authenticated (newVal) {
      if (newVal && this.extensions) {
        this.extensions.initialized({
          isLoggedIn: newVal,
          isAvailable: this.isAgentAvailable,
          sizeInfo: {
            height: 522,
            width: 300
          }
        })
      }
    },
    widgetMessage (to) {
      // stop dialing if there is a widget message
      if (to !== WIDGET_MSG_HIDE && this.startDialing) {
        this.startDialing = false
      }
    },
    extensionsVisibility () {
      if (this.extensionsVisibility) {
        if (this.profile && this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL) {
          this.widgetMessage = WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL
        }
      } else {
        // if hidden, reset HubSpot dial number
        this.setHubspotDialNumber(null)
      }
    },
    'profile.agent_status' (newStatus) {
      if (this.extensionsInitialized && this.extensions) {
        if (newStatus === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS) {
          this.extensions.userAvailable()
        } else {
          this.extensions.userUnavailable()
        }
      }
    }
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

/* Widget Container */
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
