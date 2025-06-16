<template>
  <div>
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
      <p>For some reason we couldn’t complete the call. Please refresh the page and try again.</p>
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
import * as AgentStatus from 'src/constants/agent-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as UserOutboundCallingModes from 'src/constants/user-outbound-calling-modes'
import * as storage from 'src/plugins/helpers/storage'
import { agentMixin, dispositionsMixin, helperMixin, timezoneCheckMixin } from 'src/plugins/mixins'
import CallingExtensionsManager from 'src/utils/CallingExtensionsManager'
import { mapActions, mapState } from 'vuex'

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

  mixins: [timezoneCheckMixin, helperMixin, agentMixin, dispositionsMixin],

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
      widgetMessage: WIDGET_MSG_SHOW_ALERT_CALL_FINISHED,
      isFirstLoading: true,
      isDialed: false,
      startDialing: false,
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
      // showAlertAgentOnCall: false,
      callSdkOptions: {
        // Whether to log various inbound/outbound messages to console
        debugMode: true,
        // eventHandlers handle inbound messages
        eventHandlers: {
          onReady: () => {
            console.log('resetCall')
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
            // this.criticalErrorHappened = false

            this.setHubspotDialNumber(event)

            // do not continue if we not logged-in or we're already dialing
            if (!this.initialized || this.isDialed) {
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
      contactDetails: {
        contactName: '',
        contactTimezone: '',
        companyName: '',
        contactId: ''
      },
      campaignId: null,
      defaultOutboundCampaignId: null,
      // showAlertCallFinished: false,
      // criticalErrorHappened: false,
      isPreparingToCall: false,
      listeners: {
        userLoggedIn: null,
        agentStatusUpdated: null
      },
      // Adding the READY state to display a loading indicator during the Dialer's white screen loading phase.
      isLoadingDialerStatuses: ['GENERATING_TOKEN', 'TOKEN_GENERATED', 'READY', null]
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapState('auth', ['authenticated', 'profile']),
    ...mapState(['dialer', 'hubspotDialNumber']),

    allowed () {
      console.log('allowed', this.profile, this.initialized)
      return this.profile && this.initialized
    },

    isLoadingDialer () {
      console.log('isLoadingDialer', this.dialer?.currentStatus, this.isLoadingDialerStatuses.includes(this.dialer?.currentStatus), this.dialer?.parkedCall, this.widgetMessage === WIDGET_MSG_HIDE, this.isPreparingToCall, this.initialized)

      if (this.isPreparingToCall || !this.initialized) {
        return true
      }

      return this.isLoadingDialerStatuses.includes(this.dialer?.currentStatus) &&
        !this.dialer?.parkedCall &&
        this.widgetMessage === WIDGET_MSG_HIDE

      // return false
      // return this.isLoadingDialerStatuses.includes(this.dialer?.currentStatus) &&
      //   !this.showAlertAgentOnCall &&
      //   !this.showAlertCallFinished &&
      //   !this.dialer?.parkedCall &&
      //   !this.criticalErrorHappened
    }
  },

  created () {
    this.setIsWidget(true)

    if (this.$route.query.small) {
      this.small = true
    }

    this.needsExtensions = this.$route.name === 'HubSpot Call Extension'

    if (!this.needsExtensions) {
      this.extensionsVisibility = true
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
      // this.showAlertCallFinished = false
      // this.$bvModal.hide('daytime-hours-confirmation')
      this.isPreparingToCall = true
      // @todo check if correct
      this.widgetMessage = WIDGET_MSG_HIDE
      // if (this.widgetMessage === WIDGET_MSG_SHOW_ALERT_CALL_FINISHED) {
      //   this.widgetMessage = WIDGET_MSG_HIDE
      // }

      do {
        if (this.dialer.currentStatus === 'GENERATING_TOKEN') {
          console.log('waiting for dialer token to be generated', this.dialer.currentStatus)
        }

        // if (this.agentStatus === AgentStatus.AGENT_STATUS_ON_CALL) {
        console.log('waiting for agent to become available to make the call', this.dialer.currentStatus)
        // }

        await new Promise(resolve => setTimeout(resolve, 500)) // Check every 0.5sec
      } while (this.dialer.currentStatus === 'GENERATING_TOKEN')

      await this.getContact()

      if (this.agentHasActiveCallDevice()) {
        // this.showAlertAgentOnCall = true
        if (this.profile?.agent_status === AgentStatus.AGENT_STATUS_ON_CALL ? true : !this.checkForceDisposition) {
          // do not show a widget message when force disposition, int this case, the dialer will appear with wrap-up page
          this.widgetMessage = WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL
        }

        console.log('agentHasActiveCallDevice dddddd', this.profile?.last_call, this.checkForceDisposition)
        this.isPreparingToCall = false

        return
      }

      // if (!this.checkForceDisposition) {
      // @todo check reset call when redial
      this.$VueEvent.fire('resetCall')
      // }

      this.isPreparingToCall = false

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
      this.loading = true

      await this.check().then((res) => {
        storage.local.setItem('company_id', res.data.user.company.id)
        this.setCurrentCompany(res.data.user.company)
        this.resetVuex(['all'])
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

    async getContact () {
      const withLastUsedCallLine = this.isAlwaysAskModeEnabled()
      const withLastCall = !this.checkForceDisposition
      await this.$axios.post('/api/v1/integrations/hubspot/find-contact', {
        params: this.hubspotDialNumber,
        with_last_used_call_line: withLastUsedCallLine,
        with_last_call: withLastCall
      }).then(res => {
        const contact = res?.data?.contact
        this.contactDetails.contactName = this.getContactName(contact)
        this.contactDetails.contactTimezone = contact.timezone
        this.contactDetails.companyName = contact.company_name
        this.contactDetails.contactId = contact.id

        if (withLastUsedCallLine) {
          this.campaignId = res?.data?.last_used_call_line
        }
        if (withLastCall) {
          this.setDialerCommunication(res?.data?.last_call)
          this.setDialerContact(res?.data?.last_call?.contact)
          const profile = {
            'last_call': res?.data?.last_call
          }
          this.setProfile(profile)
        }
        this.$emit('change', this.$emit('change', this.contactDetails))
      }).catch(err => {
        this.$handleErrors(err.response)
        // this.criticalErrorHappened = true
        this.widgetMessage = WIDGET_MSG_CRITICAL_ERROR_HAPPENED
        if (this.extensions) {
          this.extensions.callEnded()
        }
      })
    },

    async handleDialNumber () {
      console.warn('Handle')
      console.log('CurrentStatus:', this.dialer?.currentStatus)

      if (this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL || (this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_WRAP_UP && this.checkForceDisposition)) {
        console.log('RRRRRRRRRRRR change to WRAP_UP', this.profile, this.dialer)
        this.setDialerCurrentStatus('WRAP_UP')
        return
      }

      if (this.agentHasActiveCallDevice()) {
        console.log('checkAgentHasActiveCallInAnotherDevice')
        // this.showAlertAgentOnCall = true
        if (this.profile?.agent_status === AgentStatus.AGENT_STATUS_ON_CALL ? true : !this.checkForceDisposition) {
          this.widgetMessage = WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL
        } else {
          console.log('change to WRAP_UP')
          this.setDialerCurrentStatus('WRAP_UP')
        }
        return
      }

      // const isCallInProgressOrWrapUp = ['CALL_CONNECTED', 'WRAP_UP', 'MAKING_CALL']
      //
      // // if there's a call in progress or in wrap up, we omit the call
      // if (isCallInProgressOrWrapUp.includes(this.dialer?.currentStatus)) {
      //   // this.showAlertAgentOnCall = true
      //   this.widgetMessage = WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL
      //   return
      // }

      // stop if modal is disabled
      if (!this.extensionsVisibility) {
        console.warn('WIDGET_MSG_SHOW_ALERT_CALL_FINISHED 3')
        this.widgetMessage = WIDGET_MSG_SHOW_ALERT_CALL_FINISHED
        console.log('extensionsVisibility')
        return
      }

      console.log(
        'last_call',
        this.profile?.last_call,
        this.dialer?.communication,
        this.agentStatus,
        this.checkForceDisposition,
        this.profile,
        this.initialized
      )

      // if (this.agentStatus === AgentStatus.AGENT_STATUS_ON_WRAP_UP && this.checkForceDisposition) {
      //   console.log('fire showPhone')
      //   this.$VueEvent.fire('showPhone')
      //   return
      // }

      // don't allow to make a call if there's a parked call
      if (this.dialer?.parkedCall) {
        console.log('parkedCall')
        this.widgetMessage = WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL
        return
      }

      // this.showAlertAgentOnCall = false
      this.widgetMessage = WIDGET_MSG_HIDE
      this.startDialing = true

      console.log(
        'needsExtensions', this.needsExtensions,
        'extensionsInitialized', this.extensionsInitialized,
        'extensionsVisibility', this.extensionsVisibility,
        'initialized', this.initialized,
        'profile', this.profile,
        'isReady', this.dialer?.isReady,
        'campaignId', (this.campaignId !== null ? !this.isAlwaysAskModeEnabled() : false),
        'agentStatus', (this.agentStatus === AgentStatus.AGENT_STATUS_ON_WRAP_UP ? !this.checkForceDisposition : true)
      )

      if (this.needsExtensions &&
        this.extensionsInitialized &&
        this.extensionsVisibility &&
        this.initialized &&
        this.profile &&
        this.dialer?.isReady &&
        // if isAlwaysAskModeEnabled is true then dialing will be triggered from select campaign dialog component
        (this.campaignId !== null ? !this.isAlwaysAskModeEnabled() : false) &&
        (this.agentStatus === AgentStatus.AGENT_STATUS_ON_WRAP_UP ? !this.checkForceDisposition : true)) {
        console.log('handleCall passed')
        this.handleCall()
      } else if (!this.dialer?.isReady) {
        this.timeout = setTimeout(() => {
          this.handleDialNumber()
        }, 1000)
      } else {
        // do not handle call but show dialer, it supposes to show wrap-up or other useful UI
        console.log('isReady', this.dialer?.isReady)
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

    handleCallCompletedEvent (skipCallFinished = false) {
      if (this.extensions) {
        this.extensions.callEnded()

        // @todo check if correct
        if (!this.dialer.parkedCall) {
          if (!skipCallFinished) {
            console.warn('WIDGET_MSG_SHOW_ALERT_CALL_FINISHED 1')
            this.widgetMessage = WIDGET_MSG_SHOW_ALERT_CALL_FINISHED
          }
          this.startDialing = false
        }

        // this.showAlertCallFinished = !this.dialer.parkedCall && !skipCallFinished
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

      console.warn('handleCall', this.dialer?.currentStatus)

      // if there's a call in progress or in wrap up, we omit the call
      if (isCallInProgressOrWrapUp.includes(this.dialer?.currentStatus)) {
        // this.showAlertAgentOnCall = true
        this.widgetMessage = WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL
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
        const previousStatus = this.profile.agent_status
        const agentStatus = data.agent_status
        this.setAgentStatus(agentStatus)

        console.log('widgetMessage 2', this.widgetMessage, this.isFirstLoading, agentStatus === AgentStatus.AGENT_STATUS_ON_CALL, !this.isDialed, agentStatus, previousStatus)

        // if (agentStatus === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS && this.showAlertAgentOnCall && !this.isDialed) {
        //   this.showAlertCallFinished = true
        //   this.showAlertAgentOnCall = false
        // } else if (!this.showAlertAgentOnCall && this.isFirstLoading && agentStatus === AgentStatus.AGENT_STATUS_ON_CALL && !this.isDialed) {
        //   this.showAlertCallFinished = false
        // }

        if (agentStatus === AgentStatus.AGENT_STATUS_ACCEPTING_CALLS &&
          this.widgetMessage === WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL &&
          !this.isDialed) {
          console.warn('WIDGET_MSG_SHOW_ALERT_CALL_FINISHED 2')
          this.widgetMessage = WIDGET_MSG_SHOW_ALERT_CALL_FINISHED
          // this.showAlertCallFinished = true
          // this.showAlertAgentOnCall = false
        } else if (this.widgetMessage !== WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL &&
          this.isFirstLoading &&
          agentStatus === AgentStatus.AGENT_STATUS_ON_CALL &&
          !this.isDialed) {
          // this.showAlertCallFinished = false
          // @todo check if this correct
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
          // return
        }

        // if (agentStatus !== AgentStatus.AGENT_STATUS_ON_CALL && agentStatus !== AgentStatus.AGENT_STATUS_ON_WRAP_UP) {
        //   this.handleDialNumber()
        // }
      }
    },

    makeCall () {
      if (this.callDisabled || this.campaignId === null) {
        this.widgetMessage = WIDGET_MSG_CRITICAL_ERROR_HAPPENED
        this.$generalNotification('The dialer does not meet all the required criteria to start calling.', 'error', 5000, true)
        return
      }

      if (this.agentHasActiveCallDevice()) {
        // this.showAlertAgentOnCall = true
        if (this.profile?.agent_status === AgentStatus.AGENT_STATUS_ON_CALL ? true : !this.checkForceDisposition) {
          // do not show a widget message when force disposition, int this case, the dialer will appear with wrap-up page
          this.widgetMessage = WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL
        }
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
      if (!this.profile) return false

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

    agentHasActiveCallDevice () {
      const statuses = [
        'MAKING_CALL',
        'CALL_CONNECTED',
        'HANGING_UP_CALL',
        'CALL_DISCONNECTED',
        'WRAP_UP',
        'ANSWERING_CALL'
      ]

      if (this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL || (this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_WRAP_UP && this.checkForceDisposition)) {

      }

      console.warn('checkAgentHasActiveCallInAnotherDevice', this.profile.agent_status, this.dialer?.currentStatus)

      if (statuses.includes(this.dialer?.currentStatus)) {
        return true
      }

      return this.profile?.agent_status === AgentStatus.AGENT_STATUS_ON_CALL

      // return this.dialer &&
      //   this.profile &&
      //   this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL &&
      //   !statuses.includes(this.dialer?.currentStatus)
    },

    endActiveCall () {
      this.widgetMessage = WIDGET_MSG_HIDE
      // this.showAlertAgentOnCall = false
      // this.showAlertCallFinished = false
      this.isDialed = false

      console.log(
        'CHECK WRAP_UP',
        this.dialer?.currentStatus,
        this.checkForceDisposition,
        this.currentCompany?.force_call_disposition,
        this.profile?.last_call?.call_disposition_id,
        this.profile?.last_call
      )

      if (this.dialer?.currentStatus === 'WRAP_UP' && !this.checkForceDisposition) {
        console.log('endWrapUp')
        this.$VueEvent.fire('endWrapUp')
      }

      if (this.dialer?.communication?.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW) {
        console.log('hangupCall')
        this.$VueEvent.fire('hangupCall')
      }

      if (!this.checkForceDisposition) {
        console.log('resetCall')
        this.$VueEvent.fire('resetCall')
      }

      this.handleCallCompletedEvent(true)
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
    widgetMessage (to, from) {
      console.warn('changed widgetMessage', from + ' => ' + to)
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
        // this.showAlertAgentOnCall = this.profile && this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL
      } else {
        // this.showAlertCallFinished = true
        // this.widgetMessage = WIDGET_MSG_SHOW_ALERT_CALL_FINISHED
        // if hidden, reset HubSpot dial number
        this.setHubspotDialNumber(null)
      }
    },

    'dialer.currentStatus' (to, from) {
      console.warn('dialer.currentStatus', from + '=>' + to, this.profile.agent_status, this.checkForceDisposition)

      if (this.isLoadingDialer) {
        return
      }

      const isCallInProgress = ['CALL_CONNECTED', 'WRAP_UP', 'MAKING_CALL']
      if (isCallInProgress?.includes(this.dialer?.currentStatus) &&
        (this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL || (this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_WRAP_UP && !this.checkForceDisposition)) &&
        !this.isDialed) {
        this.widgetMessage = WIDGET_MSG_SHOW_ALERT_AGENT_ON_CALL
        // this.showAlertAgentOnCall = true
        // this.showAlertCallFinished = false
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
  height: 522px;
}
</style>
