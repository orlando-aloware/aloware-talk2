<template>
  <div>
    <microphone-permission-modal ref="microphonePermissionModal" />
  </div>
</template>

<script>
import _ from 'lodash'
import talk2Api from 'src/plugins/api/api'
import teamInboxApi from 'src/plugins/api/teamInboxApi'
import { mapActions, mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import {
  aclMixin,
  agentMixin,
  dialerWrapUpMixin,
  dispositionsMixin,
  notificationMixin,
  sessionCallStatusMixin,
  unownedContactTaskMixin,
  userMixin,
  visibilityMixin
} from '../../boot/mixins'
import * as AgentStatus from '../../constants/agent-status'
import * as CommunicationCurrentStatus from '../../constants/communication-current-status'
import * as CommunicationDispositionStatus from '../../constants/communication-disposition-status'
import * as COMMUNICATION_SENTRY_TYPE from '../../constants/communication-sentry-types'
import { REJECTION_REASONS } from '../../constants/rejection-reason-messages'
import * as WebrtcEvents from '../../constants/webrtc-events'
import TwilioDevice from '../communication/twilio/device'
import MicrophonePermissionModal from './microphone-permission-modal.vue'
import { isIvrOrDeadEndCampaign } from 'src/plugins/helpers/campaigns'
import { ALL_INBOXES_ID } from 'src/store/teaminbox/teaminbox.store'

export default {
  name: 'dialer',

  components: {
    MicrophonePermissionModal
  },

  mixins: [
    aclMixin,
    agentMixin,
    userMixin,
    notificationMixin,
    visibilityMixin,
    unownedContactTaskMixin,
    dialerWrapUpMixin,
    dispositionsMixin,
    sessionCallStatusMixin
  ],

  data () {
    return {
      loadingCommunication: false,
      loadingDropThirdParty: false,
      loadingTransfer: false,
      loadingToggleRecordingStatus: false,
      loadingMerge: false,
      loadingHold: false,
      loadingUnhold: false,
      loadingPark: false,
      loadingUnpark: false,
      device: new TwilioDevice(null),
      connection: null,
      warnings: [],
      hangupInterval: null,
      activeConnectionInterval: null,
      dialerListeners: {},
      AgentStatus,
      WebrtcEvents,
      CommunicationDispositionStatus,
      taskRedialed: false,
      hungFromAnotherTab: false,
      parkFromAnotherTab: false,
      // Token retry tracking
      tokenRetryCount: 0,
      tokenRetryTimeout: null,
      maxTokenRetries: 3,
      baseRetryDelay: 1000, // 1 second base delay
      pendingNotificationData: null,
      notificationShownFromCustomParams: false
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany', 'profile']),

    ...mapState(['dialer', 'dialerFormStatus', 'isMobile', 'ringGroups', 'campaigns']),

    ...mapState('auth', ['profile', 'authenticated']),

    ...mapState('powerDialer', ['powerDialerTasks']),

    ...mapState(['isWidget', 'isSalesforceWidget', 'isHubSpotWidget']),

    ...mapState('TeamInbox', ['activeInboxId']),

    ...mapFields('powerDialer', [
      'activeTask',
      'sessionPaused',
      'redialedTask'
    ]),

    isNotInProgressCall () {
      return (!this.dialer.call || !this.dialer.communication ||
        !['connected', 'open'].includes(this.dialer.call.state)) && !this.isAgentOnCall
    },

    hasNoParkedAndInprogressCall () {
      return !this.dialer.parkedCall && !this.dialer.call
    },

    hasParkedAndInprogressCall () {
      return this.dialer.parkedCall && (this.dialer.call !== null)
    },

    hasCallInProgressNotParked () {
      return !this.dialer.parkedCall && (this.dialer.call !== null)
    },

    shouldPushPhoneRoute () {
      return (this.isMobile && !this.isWidget) && this.$route.name !== 'Phone'
    },

    isOnPowerDialerSessionRoute () {
      return this.$route?.meta?.id === 'power-dialer-session'
    }
  },

  created () {
    this.dialerListeners.updateCommunication = (data) => {
      // check data matches dialer communication
      if (this.dialer.communication && this.dialer.communication.id === data.id) {
        data = _.merge(this.dialer.communication, data)
        console.log('Setting dialer communication from dialer > updateCommunication', data)
        this.setDialerCommunication(data)

        const communication = this.dialer?.communication
        const isGreetingNew = communication?.legc_uuid && [CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW, CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW].includes(communication.legc_status)
        const user = communication?.added_user

        if (user && !isGreetingNew) {
          this.setAddedParty(user)
        }

        const routeTitle = _.get(this.$route, 'meta.title', null)
        const isActiveTaskInPowerDialerSession = routeTitle && this.activeTask &&
          routeTitle === 'Power Dialer Sessions' &&
          parseInt(this.activeTask.id) === parseInt(this.dialer.communication.contact.id)
        const dialerCommunicationHasContact = routeTitle !== 'Power Dialer Sessions' &&
          this.dialer.communication.contact

        // if in power dialer session, we must match the active task (contact)'s id
        // with the communication's contact id OR if in other pages and dialer's
        // communication has a contact, set the contact.
        if (isActiveTaskInPowerDialerSession || dialerCommunicationHasContact) {
          this.setDialerContact(this.dialer.communication.contact)
        }
      }

      // check data matches dialer parked call
      if (this.dialer.parkedCall && this.dialer.parkedCall.id === data.id) {
        data = _.merge(this.dialer.parkedCall, data)
        this.setDialerParkedCall(data)

        if (!this.dialer.parkedCallTimer) {
          this.startParkedCallTimer()
        }

        if (data.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW ||
          data.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW) {
          this.setDialerParkedCall()

          if (this.dialer.parkedCallTimer) {
            this.stopParkedCallTimer()
          }
        }
      }
    }

    this.dialerListeners.updateRecordingStatus = (data) => {
      if (data.communication_id === this.dialer.communication.id) {
        this.setDialerRecordingStatus(data.recording_status)
      }
    }

    this.dialerListeners.reconnectDialer = () => {
      // Reset retry count for manual reconnection
      this.resetTokenRetryState()

      this.getDesktopToken(true)
        .then(() => {
          try {
            this.device.register()
          } catch (err) {
            console.error('[Reconnect Device] Can not register device. Error: ' + err, this.device.state)
          }
          this.rebootPhone()
        })
    }

    this.dialerListeners.endWrapUp = () => {
      if (this.dialer.currentStatus !== 'WRAP_UP') {
        return
      }

      this.backToDial('Talk-DialerListeners-EndWrapUp')
    }

    this.dialerListeners.forceEndWrapUp = () => {
      if (this.dialer.currentStatus !== 'WRAP_UP') {
        return
      }

      this.backToDial('Talk-DialerListeners-ForceEndWrapUp', true)
    }

    this.dialerListeners.resetCall = () => {
      this.resetCall()
    }

    this.dialerListeners.makeCall = (data) => {
      this.makeCall(data.currentNumber, data.outboundCampaignId, data.contactName, data.companyName, data.contactId, false, false, data.isFromDialer)
    }

    this.dialerListeners.transferCall = (data) => {
      this.transferCall(data)
    }

    this.dialerListeners.addParticipant = (data) => {
      this.addParticipant(data)
    }

    this.dialerListeners.hangupCall = () => {
      this.hangupCall()
    }

    this.dialerListeners.answerCall = (communication = null) => {
      console.log('dialerListeners.answerCall communication', communication)
      this.answerCall(communication)
      this.$closeActionNotification('incomingCall')
      this.$closeActionNotification('callFishing')
    }

    this.dialerListeners.rejectCall = () => {
      this.rejectCall()
    }

    this.dialerListeners.sendDigit = (data) => {
      this.sendDigit(data)
    }

    this.dialerListeners.toggleMute = () => {
      this.toggleMute()
    }

    this.dialerListeners.toggleHold = () => {
      this.toggleHold()
    }

    this.dialerListeners.toggleRecordingStatus = () => {
      this.toggleRecordingStatus()
    }

    this.dialerListeners.forceRefreshCommunication = () => {
      this.forceRefreshCommunication()
    }

    this.dialerListeners.parkCall = () => {
      this.parkCall()
    }

    this.dialerListeners.hangupAndAnswerCall = () => {
      this.answerCall()
      this.$nextTick(() => {
        this.parkCall()
      })
    }

    this.dialerListeners.parkAndAnswerCall = () => {
      this.answerCall()
      this.$nextTick(() => {
        this.parkCall()
      })
    }

    this.dialerListeners.unparkCall = (data = null, preventClear = false) => {
      this.unparkCall(data, preventClear)
    }

    this.dialerListeners.mergeCalls = () => {
      this.mergeCalls()
    }

    this.dialerListeners.dropThirdParty = () => {
      this.dropThirdParty()
    }

    this.dialerListeners.answerCallFishing = (data) => {
      console.log('dialerListeners.answerCallFishing', data)
      this.answerCallFishing(data.communication, data.shouldPark, data.shouldHangup, data.parkFromAnotherTab)
    }

    this.dialerListeners.setInputDevice = (inputDevice) => {
      this.setInputDevice(inputDevice)
    }

    this.dialerListeners.setOutputDevice = (outputDevice) => {
      this.setOutputDevice(outputDevice)
    }

    this.dialerListeners.testOutputDevice = (outputDevice) => {
      this.testOutputDevice(outputDevice)
    }

    this.dialerListeners.initializeSettings = () => {
      this.initializeSettings()
    }

    this.dialerListeners.handleCallParkedFromOtherTab = (data) => {
      console.log('Call parked from other tab', data, this.dialer.communication)
      if (this.dialer.currentStatus === 'WRAP_UP') {
        this.$VueEvent.fire('callEnded')
        return
      }
      // If we have the same communication open
      if (this.dialer.communication && this.dialer.communication.id === data.communicationId && this.dialer.call) {
        this.parkFromAnotherTab = true
      }
    }
    this.dialerListeners.handleCallHungUpFromOtherTab = (data) => {
      console.log('Call hung up from other tab', data, this.dialer.communication)
      if (this.dialer.currentStatus === 'WRAP_UP') {
        this.$VueEvent.fire('callEnded')
        return
      }
      // If we have the same communication open
      if (this.dialer.communication && this.dialer.communication.id === data.communicationId && this.dialer.call) {
        this.hungFromAnotherTab = true
      }
    }

    this.dialerListeners.colleagueStatusNotification = (event) => {
      // Show error notification in the dialer
      if (event.message && event.communication_id && this.dialer.communication?.id === event.communication_id) {
        this.$generalNotification(event.message, 'error')
      }
    }

    this.startDialerEvents()

    this.device.on(WebrtcEvents.REGISTERED, (device) => {
      // Subscribe to the event for when the list of devices changes
      device.audio.on('deviceChange', () => this.initializeSettings())

      // Now it's time to Call getUserMedia to get the input device names.
      // This is needed to get the labels. Otherwise, we will only have device IDs.
      // It's also recommended to ensure we know which mic to use when the call comes in.
      // Furthermore, performing this action here, allows for capturing gUM errors early
      // before accepting/receiving a call and it's possible to create a much better user experience
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        this.initializeSettings()

        // Calling getUserMedia will start the media track selected.
        // This is not desired as the user may get the impression the mic is in use.
        // Therefore, we want to avoid having tracks started when they're not needed.
        // We only wanted to get the input device list so we stop the tracks immediately.
        stream.getTracks().forEach(track => track.stop())
      }).catch(error => {
        // Handle error. Tell the user there's a a mic issue. You could also tell
        // your backend or raise an alert for the system admin to resolve this issue.
        console.log(error)
      })

      this.setDialerErrorDefault()

      console.log('Ready to start')

      // TODO: Remove logs
      console.log('[Twilio] Device registered and ready to receive calls')
      console.log('[Twilio] Device identity:', this.device.identity)
      console.log('[Twilio] Widget flags at registration:', {
        isWidget: this.isWidget,
        isHubSpotWidget: this.isHubSpotWidget,
        isSalesforceWidget: this.isSalesforceWidget
      })
      this.setDialerIsReady(true)
      this.setDialerCurrentStatus('READY')
      this.checkForcedStatus()
    })

    this.device.on(WebrtcEvents.UNREGISTERED, (device) => {
      this.removeUnownedLiveContactTask()

      if (this.dialer.isReady && (this.isSalesforceWidget ? true : !this.isWidget)) {
        this.$generalNotification('Whoops! You have lost connection with the server. Check your internet connection and try again.', 'error', 10000)
        console.warn('[UNREGISTERED] Twilio token', this.dialer.token)
        this.setDialerIsReady(false)
        this.setDialerCurrentStatus('OFFLINE')
      }
    })

    this.device.on(WebrtcEvents.TOKEN_WILL_EXPIRE, () => {
      console.log('Regenerate token')
      this.getDesktopToken(true)
    })

    this.device.on(WebrtcEvents.ERROR, (error) => {
      // TODO: Remove logs
      console.error('[Twilio] Device ERROR event:', error)
      console.error('[Twilio] Error code:', error.code)
      console.error('[Twilio] Error message:', error.message)
      console.error('[Twilio] Error stack:', error.stack)
      this.removeUnownedLiveContactTask()
      this.handleError(error)
      this.backToDial('Talk-Device.OnError')
    })

    // TODO: Remove logs
    console.log('[Twilio] Registering INCOMING event handler')
    console.log('[Twilio] Device object:', this.device)
    console.log('[Twilio] WebrtcEvents.INCOMING:', WebrtcEvents.INCOMING)

    this.device.on(WebrtcEvents.INCOMING, (call) => {
      // TODO: Remove logs
      console.log('[Twilio] ========== INCOMING CALL EVENT FIRED ==========')
      console.log('[Twilio] INCOMING call event received!', call)
      console.log('[Twilio] Widget flags:', {
        isWidget: this.isWidget,
        isSalesforceWidget: this.isSalesforceWidget,
        isHubSpotWidget: this.isHubSpotWidget
      })

      // Only ignore calls for regular widgets (not Salesforce or HubSpot widgets)
      const shouldIgnoreCall = this.isWidget && !this.isSalesforceWidget && !this.isHubSpotWidget

      if (shouldIgnoreCall) {
        console.log('[Twilio] Ignoring inbound call - widget check failed')
        console.table({
          isWidget: this.isWidget,
          isSalesforceWidget: this.isSalesforceWidget,
          isHubSpotWidget: this.isHubSpotWidget
        })
        call._connection.ignore()
        return
      }

      /** TODO: Remove logs */
      console.log('[Twilio] Processing incoming call (not ignoring)')

      if (this.isOnPowerDialerSessionRoute) {
        return
      }

      this.stopAudio()
      this.connection = this.device._createConnection(call._connection, true)
      this.initConnectionEvents()
      console.log('Received call invite', call)
      //
      console.log('[Twilio] call.direction:', call.direction)
      console.log('[Twilio] call._connection:', call._connection)
      console.log('[Twilio] call._connection.direction:', call._connection?.direction)
      this.dialerCallPrep(call._connection)
      console.log('[Twilio] After dialerCallPrep, dialer.call:', this.dialer.call)
      this.setDialerCurrentNumber(this.$options.filters.fixPhone(call.from, 'E164'))
      this.setDialerCurrentStatus('RECEIVED_CALL_INVITE')
      console.log('call information', call.callSid, call.from, this.dialer.currentNumber)

      // restore app when a call comes
      if (this.$q.platform.is.electron) {
        this.$q.electron.ipcRenderer.send('restore_app')
      }

      const communicationData = this.buildCommunicationFromCustomParameters()
      this.notificationShownFromCustomParams = false

      if (communicationData) {
        if (this.agentStatus === AgentStatus.AGENT_STATUS_RINGING) {
          this.$VueEvent.fire('new_in_app_call', communicationData)
          this.processActionNotification(communicationData, 'call')
          this.notificationShownFromCustomParams = true
        } else {
          this.pendingNotificationData = communicationData
        }
      }

      this.getCommunication(call.callSid, call.from).then(res => {
        if (res) {
          if (!this.notificationShownFromCustomParams) {
            this.$VueEvent.fire('new_in_app_call', res.data)
            this.processActionNotification(res.data, 'call')
            this.pendingNotificationData = null
          }
          this.addNonOwnedLiveContact(res.data)
        }
      }).catch((err) => {
        console.log('getCommunication error', {
          'callSid': call.callSid,
          'from': call.from,
          'err': err
        })
      })
    })

    this.device.on(WebrtcEvents.CANCEL, (call) => { // When originator cancels a call
      this.removeUnownedLiveContactTask()
      console.log('Talk-Device: Call invite canceled', call)
      this.connection = null
      this.setDialerCurrentStatus('INVITE_CANCELLED')
      this.backToDial('Talk-Device.OnCancel')
      this.$closeActionNotification('incomingCall')
    })

    this.getDesktopToken()

    // ping getDesktopToken every 24 hours
    this.$options.webrtcTokenRegenerateInterval = setInterval(() => {
      if (this.authenticated) {
        this.getDesktopToken(true)
      }
    }, 24 * 60 * 60 * 1000)
  },

  methods: {
    checkForcedStatus () {
      if (!this.profile.last_call || (this.isImpersonate && this.agentStatus === AgentStatus.AGENT_STATUS_ON_CALL)) {
        return
      }

      if (this.checkForceDisposition) {
        if (this.isWidget && this.agentStatus !== AgentStatus.AGENT_STATUS_ON_WRAP_UP) {
          return
        }

        this.forceStartOnWrapUp()
      }
    },
    forceStartOnWrapUp () {
      const wrapUpTimer = this.currentCompany && this.currentCompany.force_wrap_up
        ? this.currentCompany.wrap_up_seconds
        : this.profile.wrap_up_seconds

      if (wrapUpTimer < 0) {
        return
      }

      console.log('Setting dialer communication from dialer > forceStartOnWrapUp', this.profile.last_call)
      this.setDialerCommunication(this.profile.last_call)
      this.setDialerContact(this.profile.last_call.contact)
      this.startWrapUpTimer()
    },
    startDialerEvents () {
      this.$VueEvent.listen('update_communication', this.dialerListeners.updateCommunication)
      this.$VueEvent.listen('updated_recording_status', this.dialerListeners.updateRecordingStatus)
      this.$VueEvent.listen('webrtc_update_communication', this.dialerListeners.updateCommunication)
      this.$VueEvent.listen('reconnectDialer', this.dialerListeners.reconnectDialer)
      this.$VueEvent.listen('endWrapUp', this.dialerListeners.endWrapUp)
      this.$VueEvent.listen('forceEndWrapUp', this.dialerListeners.forceEndWrapUp)
      this.$VueEvent.listen('resetCall', this.dialerListeners.resetCall)
      this.$VueEvent.listen('makeCall', this.dialerListeners.makeCall)
      this.$VueEvent.listen('transferCall', this.dialerListeners.transferCall)
      this.$VueEvent.listen('addParticipant', this.dialerListeners.addParticipant)
      this.$VueEvent.listen('hangupCall', this.dialerListeners.hangupCall)
      this.$VueEvent.listen('answerCall', this.dialerListeners.answerCall)
      this.$VueEvent.listen('rejectCall', this.dialerListeners.rejectCall)
      this.$VueEvent.listen('sendDigit', this.dialerListeners.sendDigit)
      this.$VueEvent.listen('toggleMute', this.dialerListeners.toggleMute)
      this.$VueEvent.listen('toggleHold', this.dialerListeners.toggleHold)
      this.$VueEvent.listen('toggleRecordingStatus', this.dialerListeners.toggleRecordingStatus)
      this.$VueEvent.listen('forceRefreshCommunication', this.dialerListeners.forceRefreshCommunication)
      this.$VueEvent.listen('parkCall', this.dialerListeners.parkCall)
      this.$VueEvent.listen('hangupAndAnswerCall', this.dialerListeners.hangupAndAnswerCall)
      this.$VueEvent.listen('parkAndAnswerCall', this.dialerListeners.parkAndAnswerCall)
      this.$VueEvent.listen('unparkCall', this.dialerListeners.unparkCall)
      this.$VueEvent.listen('mergeCalls', this.dialerListeners.mergeCalls)
      this.$VueEvent.listen('dropThirdParty', this.dialerListeners.dropThirdParty)
      this.$VueEvent.listen('answerCallFishing', this.dialerListeners.answerCallFishing)
      this.$VueEvent.listen('setInputDevice', this.dialerListeners.setInputDevice)
      this.$VueEvent.listen('setOutputDevice', this.dialerListeners.setOutputDevice)
      this.$VueEvent.listen('testOutputDevice', this.dialerListeners.testOutputDevice)
      this.$VueEvent.listen('initializeSettings', this.dialerListeners.initializeSettings)
      this.$VueEvent.listen('call_parked_from_another_tab', this.dialerListeners.handleCallParkedFromOtherTab)
      this.$VueEvent.listen('call_hung_up_from_another_tab', this.dialerListeners.handleCallHungUpFromOtherTab)
      this.$VueEvent.listen('colleague_status_notification', this.dialerListeners.colleagueStatusNotification)
    },

    stopDialerEvents () {
      this.$VueEvent.stop('update_communication', this.dialerListeners.updateCommunication)
      this.$VueEvent.stop('updated_recording_status', this.dialerListeners.updateRecordingStatus)
      this.$VueEvent.stop('webrtc_update_communication', this.dialerListeners.updateCommunication)
      this.$VueEvent.stop('reconnectDialer', this.dialerListeners.reconnectDialer)
      this.$VueEvent.stop('endWrapUp', this.dialerListeners.endWrapUp)
      this.$VueEvent.stop('forceEndWrapUp', this.dialerListeners.forceEndWrapUp)
      this.$VueEvent.stop('resetCall', this.dialerListeners.resetCall)
      this.$VueEvent.stop('makeCall', this.dialerListeners.makeCall)
      this.$VueEvent.stop('transferCall', this.dialerListeners.transferCall)
      this.$VueEvent.stop('addParticipant', this.dialerListeners.addParticipant)
      this.$VueEvent.stop('hangupCall', this.dialerListeners.hangupCall)
      this.$VueEvent.stop('answerCall', this.dialerListeners.answerCall)
      this.$VueEvent.stop('rejectCall', this.dialerListeners.rejectCall)
      this.$VueEvent.stop('sendDigit', this.dialerListeners.sendDigit)
      this.$VueEvent.stop('toggleMute', this.dialerListeners.toggleMute)
      this.$VueEvent.stop('toggleHold', this.dialerListeners.toggleHold)
      this.$VueEvent.stop('toggleRecordingStatus', this.dialerListeners.toggleRecordingStatus)
      this.$VueEvent.stop('forceRefreshCommunication', this.dialerListeners.forceRefreshCommunication)
      this.$VueEvent.stop('parkCall', this.dialerListeners.parkCall)
      this.$VueEvent.stop('hangupAndAnswerCall', this.dialerListeners.hangupAndAnswerCall)
      this.$VueEvent.stop('parkAndAnswerCall', this.dialerListeners.parkAndAnswerCall)
      this.$VueEvent.stop('unparkCall', this.dialerListeners.unparkCall)
      this.$VueEvent.stop('mergeCalls', this.dialerListeners.mergeCalls)
      this.$VueEvent.stop('dropThirdParty', this.dialerListeners.dropThirdParty)
      this.$VueEvent.stop('answerCallFishing', this.dialerListeners.answerCallFishing)
      this.$VueEvent.stop('setInputDevice', this.dialerListeners.setInputDevice)
      this.$VueEvent.stop('setOutputDevice', this.dialerListeners.setOutputDevice)
      this.$VueEvent.stop('testOutputDevice', this.dialerListeners.testOutputDevice)
      this.$VueEvent.stop('initializeSettings', this.dialerListeners.initializeSettings)
      this.$VueEvent.stop('call_parked_from_another_tab', this.dialerListeners.handleCallParkedFromOtherTab)
      this.$VueEvent.stop('call_hung_up_from_another_tab', this.dialerListeners.handleCallHungUpFromOtherTab)
      this.$VueEvent.stop('colleague_status_notification', this.dialerListeners.colleagueStatusNotification)
    },

    forceRefreshCommunication () {
      return this.getCommunication(this.dialer.call.callSid, this.dialer.currentNumber, 1, true)
    },

    getCommunication (sid, from, getCommunicationTry = 1, force = false) {
      console.log('Getting communication', sid, from, getCommunicationTry)

      if (this.dialer.communication && !force) {
        return Promise.resolve()
      }

      const params = {
        sid: sid,
        phone_number: from,
        live: true
      }

      let apiCall
      if (this.currentCompany.team_inbox_enabled) {
        // Use Team Inbox V3 API when team inbox is enabled
        apiCall = teamInboxApi.communication.info(params)
      } else {
        // Use regular V1 API
        apiCall = this.$axios.get('/api/v1/communication/info', { params })
      }

      this.loadingCommunication = true
      return apiCall.then(res => {
        if (this.dialer.communication && !force) {
          return Promise.resolve()
        }

        const routeTitle = _.get(this.$route, 'meta.title', null)

        // If the communication was rejected by app then move it to skipped list
        if (res.data?.rejected_by_app) {
          const skippedAndActive = this.getSkippedAndActiveTasks()
          const tempSet = new Set(skippedAndActive.map(JSON.stringify)) // Convert each element to JSON to ensure correct comparison
          this.powerDialerTasks.skipped = Array.from(tempSet).map(JSON.parse) // Convert elements back to their original types

          const rejectionReason = REJECTION_REASONS.find(rejectionReason => rejectionReason.type === res.data.rejected_by_app)

          if (rejectionReason) {
            this.$generalNotification(rejectionReason.message, 'error')
          }
        }

        // we need to prevent proceeding to the next steps if current task's contact id
        // is not the same as the communication's contact id in power dialer session
        // to prevent showing incorrect contact details in the active call component when
        // making a call just after the previous task was manually ended
        // (end call or next button was clicked w/o wrap-up), automatically ended (no wrap-up),
        // or manually clicked the end wrap-up when wrap-up is indefinite. The previous task
        // was already processed/ended but the fetching of the previous task's communication
        // got delayed so the previous task's contact details will show for brief amount of
        // seconds, which is being prevented here:
        if (routeTitle && this.activeTask &&
          routeTitle === 'Power Dialer Sessions' &&
          this.activeTask.id !== res.data.contact_id) {
          return Promise.resolve()
        }

        console.log('Setting dialer communication from dialer > getCommunication', res.data)
        this.setDialerCommunication(res.data)

        const communication = this.dialer.communication
        const isGreetingNew = communication.legc_uuid && [CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW, CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW].includes(communication.legc_status)
        const user = communication.added_user

        if (user && !isGreetingNew) {
          this.setAddedParty(user)
        }

        // if in power dialer session, we must match the active task (contact)'s id
        // with the communication's contact id
        // else, set the contact.
        if ((routeTitle &&
            this.activeTask &&
            routeTitle === 'Power Dialer Sessions' &&
            parseInt(this.activeTask.id) === parseInt(res.data.contact_id)) ||
          (routeTitle !== 'Power Dialer Sessions' &&
            this.dialer.communication.contact)) {
          this.setDialerContact(this.dialer.communication.contact)
        }

        this.setDialerCurrentNumber(this.$options.filters.fixPhone(this.dialer.communication.lead_number, 'E164'))
        this.$VueEvent.fire('communicationLoaded')
        this.loadingCommunication = false

        return Promise.resolve(res)
      }).catch(err => {
        // Fail if the API returned a 4xx error
        if (err.response && err.response.status >= 400 && err.response.status < 500) {
          this.setDialerCommunication()
          this.setDialerContact()
          this.setDialerDeal()
          this.$VueEvent.fire('communicationLoaded')
          this.loadingCommunication = false

          // Move task to skipped list
          const skippedAndActive = this.getSkippedAndActiveTasks()
          const tempSet = new Set(skippedAndActive.map(JSON.stringify)) // Convert each element to JSON to ensure correct comparison
          this.powerDialerTasks.skipped = Array.from(tempSet).map(JSON.parse) // Convert elements back to their original types

          return Promise.reject(err)
        }

        getCommunicationTry++
        // error
        console.log('An error occurred while getting the communication', err)
        // check if we have found the communication after 3 retries
        if (getCommunicationTry > 4) {
          this.setDialerCommunication()
          this.setDialerContact()
          this.setDialerDeal()
          this.$VueEvent.fire('communicationLoaded')
          this.loadingCommunication = false

          return Promise.reject(err)
        }

        return this.getCommunication(sid, from, getCommunicationTry)
      })
    },

    getDesktopToken (reset = false) {
      // Check if we're already in the process of getting a token (universal protection)
      if (this.tokenRetryTimeout) {
        console.log('Token request already in progress, skipping')
        return Promise.reject(new Error('Token request already in progress'))
      }

      // Check if we've exceeded the maximum retry attempts (company-specific)
      if ([7113, 2584, 1629].includes(this.currentCompany?.id) && this.tokenRetryCount >= this.maxTokenRetries) {
        console.log('Maximum token retry attempts reached')
        this.setDialerIsReady(false)
        this.setDialerCurrentStatus('OFFLINE')
        return Promise.reject(new Error('Maximum token retry attempts reached'))
      }

      console.log('Generating desktop token')

      this.setDialerCurrentStatus('GENERATING_TOKEN')

      let params = {
        reset
      }

      return this.$axios.post('/api/v1/dialer/new-mobile-token', params).then(res => {
        this.loading = false
        this.setDialerToken(res.data)
        this.setDialerCurrentStatus('TOKEN_GENERATED')
        console.log('Twilio token', this.dialer.token)

        // Reset retry count on successful token generation
        this.resetTokenRetryState()

        // setup twilio client

        /**
         * An ordered list of preferred codecs. Currently, 'pcmu' and 'opus' are supported.
         * PCMU will remain default until the next breaking release,
         * however we recommend testing and using Opus as it can provide better quality for lower bandwidth,
         * particularly noticeable in poor network conditions.
         */
        // initialize twilio client

        // check if the profile has edge locations
        let edgeLocations = this.profile.edge_locations
        // make sure it is a filled array
        if (this.profile.edge_locations === undefined || !Array.isArray(edgeLocations) || edgeLocations.length === 0) {
          edgeLocations = ['umatilla', 'ashburn', 'roaming']
        }
        const options = {
          edge: edgeLocations,
          codecPreferences: ['opus', 'pcmu']
        }
        if (this.currentCompany && this.currentCompany.twilio_debug_log) {
          options.logLevel = 1
          options.enableImprovedSignalingErrorPrecision = true
        }
        console.log('Edge locations', options.edge)
        this.device.initialize(this.dialer.token, options)

        console.log('Reset device', reset)
        if (!reset) {
          try {
            this.device.register()
          } catch (err) {
            console.error('[Reset Device] Can not register device. Error: ' + err, this.device.state)
          }
        } else {
          this.device.updateToken(this.dialer.token)
        }

        // remove the errors if we successfully generated a token
        this.setDialerErrorDefault()

        return Promise.resolve(res)
      }).catch(err => {
        this.loading = false
        console.log(err)

        // Clear the timeout on error
        this.tokenRetryTimeout = null

        return Promise.reject(err)
      })
    },

    shouldIncludeRingGroupId (isFromDialer, outboundCampaign) {
      if (isFromDialer) {
        // Call is made directly from dialer, so we don't need to include the ring group id
        return false
      }

      if (!this.activeInboxId) {
        // No active inbox, so we don't need to include the ring group id
        return false
      }

      const campaign = ['number', 'string'].includes(typeof outboundCampaign)
        ? this.campaigns.find(campaign => campaign.id === outboundCampaign)
        : outboundCampaign

      if (!isIvrOrDeadEndCampaign(campaign)) {
        // Campaign is not an IVR or Dead End campaign, so we don't need to include the ring group id
        return false
      }

      return true
    },

    async makeCall (
      currentNumber,
      outboundCampaignId,
      contactName = '',
      companyName = '',
      contactId = null,
      isCallWaiting = false,
      shouldAnswer = false,
      isFromDialer = false
    ) {
      // Check microphone permission after device is ready
      const hasMicrophoneAccess = await this.checkMicrophonePermission()
      if (!hasMicrophoneAccess) {
        console.log('Microphone is not allowed by the user')
        return
      }

      if (!this.dialer.isReady) {
        console.log('Dialer is not ready', currentNumber, outboundCampaignId)
        return
      }

      const isCallNotPending = this.dialer.call && this.dialer.call.state !== 'pending'

      if (isCallNotPending || !currentNumber || !outboundCampaignId) {
        console.log('Dialer requirements are not met', currentNumber, outboundCampaignId)
        return
      }

      // reject ongoing call if there is one
      this.rejectCall()

      if (this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL && !isCallWaiting && !shouldAnswer) {
        console.log('Agent has a call in progress on another device', { agentStatus: this.profile.agent_status })
        return
      }

      const to = this.$options.filters.fixPhone(currentNumber, 'E164')
      // check if the user has enabled two-legged outbound calls,
      // and the requested call is does not include ":" in the phone number
      // ":" is used to dial into an existing call,
      // and also used for calling from HubSpot
      if (!!contactId && !to.includes(':') && this.profile.enabled_two_legged_outbound) {
        const contact = {
          id: contactId,
          name: contactName
        }
        let message = 'We will call your secondary phone'
        message += ' on ' + this.profile.secondary_phone_number
        message += ' and connect you with '
        if (contactName) {
          message += contact.name
        } else {
          message += 'the contact'
        }
        message += '. Proceed?'
        this.$bvModal.msgBoxConfirm(message, {
          buttonSize: 'sm',
          okTitle: 'Yes',
          cancelTitle: 'No',
          centered: true
        }).then(confirm => {
          if (confirm) {
            this.makeTwoLeggedCall(contact, to)
          }
        })

        return
      }

      if (this.shouldPushPhoneRoute) {
        this.$router.push({
          name: 'Phone'
        })
      }

      this.$VueEvent.fire('showLoadingPhone')
      const params = {
        'To': this.$options.filters.fixPhone(currentNumber, 'E164'),
        'CampaignId': outboundCampaignId ? outboundCampaignId.toString() : '',
        'UserId': this.profile ? this.profile.id.toString() : '',
        'ContactName': contactName ? contactName.toString() : 'No Name',
        'CompanyName': companyName ? companyName.toString() : '',
        'ContactId': contactId ? contactId.toString() : ''
      }

      if (this.isOnPowerDialerSessionRoute) {
        params['AnswerInPD'] = true
      }

      if (this.shouldIncludeRingGroupId(isFromDialer, outboundCampaignId)) {
        // RingGroupId is used to identify the current inbox
        // when making a call from an IVR line
        let ringGroupId = this.activeInboxId.toString()
        if (this.$route.params.inboxId === ALL_INBOXES_ID && !isNaN(+this.$route.query.inboxId)) {
          ringGroupId = this.$route.query.inboxId
        }
        params['RingGroupId'] = ringGroupId
      }

      console.log(' %c Making a call to: ', 'background: #000; color: #fff000;', params)

      this.setDialerCurrentStatus('MAKING_CALL')
      this.setDialerCurrentNumber(params['To'])

      // Wait to finish the previous call to avoid conflicts with device.connect()
      if (shouldAnswer) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // check if connection is completely closed before opening a new one
      if (this.connection && !shouldAnswer) {
        console.log('Dialer is busy', currentNumber, outboundCampaignId)
        return
      }

      this.connection = await this.device.connect(params, true)
      this.initConnectionEvents()

      // Make sure that phone number is string in this part before proceeding
      currentNumber = currentNumber.toString()
      const isWhisperCall = currentNumber.includes(COMMUNICATION_SENTRY_TYPE.WHISPER)
      const isBargeCall = currentNumber.includes(COMMUNICATION_SENTRY_TYPE.BARGE)

      // Force mute for whisper/barge calls
      if (isBargeCall || isWhisperCall) {
        this.forceMute()
        // If it's a whisper call to an AI agent, disable unmute functionality
        if (isWhisperCall) {
          const commId = currentNumber.split(':')[1]
          if (commId) {
            this.fetchAndSetAiAgentCallMode(commId, COMMUNICATION_SENTRY_TYPE.WHISPER)
          }
        }

        // If it's a barge call to an AI agent, drop other agents
        if (isBargeCall) {
          const commId = currentNumber.split(':')[1]
          if (commId) {
            this.fetchAndSetAiAgentCallMode(commId, COMMUNICATION_SENTRY_TYPE.BARGE)
          }
        }
      }
    },

    makeTwoLeggedCall (contact, phoneNumber) {
      let prefix = ' the contact'
      if (contact.name) {
        prefix = ' ' + contact.name
      }
      this.$axios.post(`/api/v1/contact/${contact.id}/make-two-legged-call`, {
        phone_number: phoneNumber
      }).then(() => {
        this.$generalNotification(`We are calling your phone to connect you to ${prefix}`)
      }).catch(err => {
        const message = err.response.data.message
        if (message) {
          this.$generalNotification(err.response.data.message, 'error')
          return
        }
        const error = err.response.data.error
        if (error) {
          this.$generalNotification(err.response.data.error, 'error')
        }
      })
    },

    initConnectionEvents () {
      if (!this.connection) {
        return
      }

      if (![7113].includes(this.currentCompany?.id)) {
        this.connection.on(WebrtcEvents.CONNECTION_WARNING, (warningName, warningData) => {
          console.log(WebrtcEvents.CONNECTION_WARNING, warningName, warningData)
          // add warning to list
          if (this.warnings.indexOf(warningName) === -1) {
            this.warnings.push(warningName)
          }

          this.setWarnings(this.warnings)
          this.saveCallIssue(warningName, warningData)
        })

        this.connection.on(WebrtcEvents.CONNECTION_WARNING_CLEARED, (warningName) => {
          console.log(WebrtcEvents.CONNECTION_WARNING_CLEARED, warningName)
          // remove warning from list
          this.warnings = this.warnings.filter(value => value !== warningName)
          this.setWarnings(this.warnings)
        })
      }

      this.connection.on(WebrtcEvents.CONNECTION_ACCEPT, (call) => { // On accept call
        console.log('Successfully connected call', call)
        this.updateUnownedContactLastCommunicationStatus()
        this.dialerCallPrep(call)
        this.startCallTimer()
        this.setDialerCurrentStatus('CALL_CONNECTED')
        this.getCommunication(this.dialer.call.callSid, this.dialer.currentNumber, 1, true)
          .catch((err) => {
            console.log(err)
          })

        // mute the phone
        if (this.dialer.isMuted) {
          this.forceMute()
        }

        // close the dialer form when it's open and incoming call is answered
        if (this.dialerFormStatus) {
          this.setDialerFormStatus(false)
        }
      })

      this.connection.on(WebrtcEvents.CONNECTION_CANCEL, (call) => { // When originator cancels a call
        this.removeUnownedLiveContactTask()
        console.log('Talk-Connection: Call invite canceled', call)
        this.connection = null
        this.setDialerCurrentStatus('INVITE_CANCELLED')
        this.backToDial('Talk-Connection.OnCancel', false, true)
        this.$closeActionNotification('incomingCall')
      })

      this.connection.on(WebrtcEvents.CONNECTION_DISCONNECT, (call) => { // On hangup
        this.handleCallDisconnected(call, WebrtcEvents.CONNECTION_DISCONNECT)
      })
    },

    handleCallDisconnected (call, event) {
      console.log('Call ended event', event)
      console.log('Call ended', call)
      console.log('** Parked call', this.dialer.parkedCall)
      console.log('** Dialer call', this.dialer.call)

      // don't do anything if there is no communication
      if (!this.dialer.communication) {
        console.log('No dialer communication found')
      } else {
        console.log('Dialer communication found', this.dialer.communication)
      }

      if (this.dialer.communication) {
        this.$VueEvent.fire('callDisconnected', this.dialer.communication.id)
      }

      this.removeUnownedLiveContactTask()
      this.stopCallTimer()
      this.connection = null
      this.setDialerCurrentStatus('CALL_DISCONNECTED')

      // only start wrap up timer if there is a communication
      if (this.dialer.communication) {
        // Skip wrap-up for barge/whisper calls
        const isBargeOrWhisperCall = this.dialer?.isBargeOrWhisperCall

        if (isBargeOrWhisperCall) {
          this.backToDial('Talk-Device.OnDisconnect', false, true)
          return
        }

        const shouldStartWrapUp = (this.hasNoParkedAndInprogressCall ||
            this.hasParkedAndInprogressCall ||
            this.hasCallInProgressNotParked) &&
          !(this.parkFromAnotherTab || this.hungFromAnotherTab)

        if (shouldStartWrapUp) {
          this.startWrapUpTimer()
          return
        }
      }

      // Handle parked call from another tab
      if (this.parkFromAnotherTab) {
        this.setDialerParkedCall(this.dialer.communication)
      }

      if (this.hungFromAnotherTab || this.parkFromAnotherTab) {
        this.resetCall('Talk-Device.OnDisconnect')
        this.hungFromAnotherTab = false
        this.parkFromAnotherTab = false

        return
      }

      this.backToDial('Talk-Device.OnDisconnect', false, true)
    },

    hangupCall () {
      if (!this.dialer.call || !this.connection) {
        return
      }

      console.log('Hanging up call')

      this.setDialerCurrentStatus('HANGING_UP_CALL')

      // If we're in an AI agent takeover mode and still muted, make sure we drop the AI agent
      if (this.dialer.aiAgentTakeover && this.dialer.isMuted && this.dialer.communication) {
        console.log('Dropping AI agent before hanging up')
        this.$axios.post('/api/v1/dialer/drop-aloai-agent', {
          communication_id: this.dialer.communication.id
        })
          .then(response => {
            console.log('Successfully dropped AI agent during hangup')
            this.connection.hangup()
          })
          .catch(err => {
            console.error('Error dropping AI agent during hangup:', err)
            this.connection.hangup()
          })
      } else {
        this.connection.hangup()
      }

      this.setIsCallBackButtonDisabled(true)
      setTimeout(() => {
        this.setIsCallBackButtonDisabled(false)
      }, 3500)
    },

    sendDigit (digit) {
      if (!this.dialer.call) {
        return
      }

      if (digit === 'DEL') {
        return
      }

      console.log('Sending digit to call: ' + digit)

      if (this.connection) {
        this.connection.sendDigits(digit)
      }
    },

    answerCall (communication = null, retryCount = 0) {
      if (!this.dialer.call) {
        return
      }

      console.log('Answering call')

      this.setDialerCurrentStatus('ANSWERING_CALL')
      this.setShowIncomingCallNotification(false)
      this.clearDialerCallFishing()

      if (communication) {
        this.answerCallFishing(communication)
        return
      }

      if (this.connection) {
        if (this.shouldPushPhoneRoute) {
          this.$router.push({
            name: 'Phone'
          })
        }
        // accept the incoming connection and start two-way audio
        this.connection.accept()
      } else if (retryCount < 10) {
        // Twilio connection not ready yet, retry after a short delay (max 10 retries = ~2 seconds)
        console.log(`[answerCall] Twilio connection not ready, retrying... (${retryCount + 1}/10)`)
        setTimeout(() => {
          this.answerCall(communication, retryCount + 1)
        }, 300)
      } else {
        console.error('[answerCall] Twilio connection did not become ready after 10 retries')
        this.$generalNotification('Unable to answer call. Please try again.', 'error', 3000, true)
        this.setDialerCurrentStatus('READY')
      }
    },

    rejectCall () {
      if (!this.dialer.call) {
        return
      }

      console.log('Rejecting call')

      this.removeUnownedLiveContactTask()
      this.setDialerCurrentStatus('REJECTING_CALL')

      if (this.connection) {
        // rejecting an incoming call
        this.connection.reject()
      }

      // set agent status to busy if it's an answer by browser/apps user
      // @custom for Cardone Capital: rejecting a call should still keep the agent on the previous status
      if (this.currentCompany?.id === 892 &&
        !this.currentCompany.force_users_always_available) {
        this.changeAgentStatus(AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS, false, 1, 'Talk-RejectCall')
      }

      this.resetCall()
    },

    toggleMute () {
      if (!this.dialer.call || !['connected', 'open'].includes(this.dialer.call.state)) {
        return
      }

      // If this is a barge call to an AI agent and user tries to unmute, handle takeover
      if (this.dialer.aiAgentTakeover && this.dialer.isMuted) {
        console.log('Taking over the call from AI agent')
        this.$generalNotification('You are taking over the call from the AloAi agent', 'info')

        if (this.dialer.communication) {
          // Call the drop-other-agents API when taking over
          this.$axios.post('/api/v1/dialer/drop-aloai-agent', {
            communication_id: this.dialer.communication.id
          })
            .then(response => {
              console.log('Successfully dropped other agents from call')

              // After successfully dropping AI agent, unmute and update state
              if (this.connection) {
                this.connection.mute(false)
              }
              this.setDialerIsMuted(false)
              this.setDialerAiAgentTakeover(false)
            })
            .catch(err => {
              console.error('Error dropping other agents from call:', err)
              // Even if there's an error, we should still unmute for better UX
              if (this.connection) {
                this.connection.mute(false)
              }
              this.setDialerIsMuted(false)
              this.setDialerAiAgentTakeover(false)
            })

          return
        }

        // Unmute the call and update the state
        if (this.connection) {
          this.connection.mute(false)
        }
        this.setDialerIsMuted(false)
        this.setDialerAiAgentTakeover(false)

        return
      }

      if (!this.dialer.isMuted) {
        console.log('Muting call')

        if (this.connection) {
          this.connection.mute(true)
        }

        this.setDialerIsMuted(true)

        return
      }

      console.log('Unmuting call')

      if (this.connection) {
        this.connection.mute(false)
      }

      this.setDialerIsMuted(false)
    },

    forceMute () {
      this.setDialerIsMuted(true)
      this.connection.mute(true)
    },

    toggleRecordingStatus () {
      if (this.isNotInProgressCall) {
        return
      }

      const newStatus = (this.dialer.recordingStatus === 'in-progress') ? 'paused' : 'in-progress'

      if (newStatus === 'paused') {
        console.log('Pausing recording')
      } else if (newStatus === 'in-progress') {
        console.log('Starting recording')
      }

      this.loadingToggleRecordingStatus = true

      this.$axios.post(`/api/v1/communication/${this.dialer.communication.id}/toggle-recording-status`, {
        status: newStatus
      }).then((res) => {
        this.loadingToggleRecordingStatus = false

        if (res.data.result) {
          this.setDialerRecordingStatus(newStatus)

          switch (newStatus) {
            case 'paused':
              console.log('Recording paused')
              break
            case 'in-progress':
              console.log('Recording started')
              break
          }

          return
        }

        // alert didn't change
        switch (newStatus) {
          case 'paused':
            console.log('Failed to pause recording')
            break
          case 'in-progress':
            console.log('Failed to start recording')
            break
        }
      }).catch(err => {
        switch (newStatus) {
          case 'paused':
            console.log('Failed to pause recording')
            break
          case 'in-progress':
            console.log('Failed to start recording')
            break
        }

        this.loadingToggleRecordingStatus = false
        console.log(err)
      })
    },

    toggleHold () {
      if (!this.dialer.call || !['connected', 'open'].includes(this.dialer.call.state)) {
        return
      }

      if (!this.dialer.isHeld) {
        console.log('Holding call')
        this.loadingHold = true
        const params = {
          communication_id: this.dialer.communication.id
        }

        this.$axios.post('/api/v1/dialer/new-hold', params).then(() => {
          this.setDialerIsHeld(true)
          console.log('Call held')
        }).catch(err => {
          console.log(err)
          this.$VueEvent.fire('holdFailed')
        }).finally(_ => {
          this.loadingHold = false
        })

        return
      }

      console.log('Unparking call')
      this.loadingUnhold = true
      const params = {
        communication_id: this.dialer.communication.id
      }

      this.$axios.post('/api/v1/dialer/new-unhold', params).then(() => {
        this.setDialerIsHeld(false)
        console.log('Call unparked')
      }).catch(err => {
        console.log(err)
        this.$VueEvent.fire('unholdFailed')
      }).finally(_ => {
        this.loadingUnhold = false
      })
    },

    parkCall () {
      if (this.isNotInProgressCall) {
        return
      }

      this.loadingPark = true
      this.setDialerParkedCall(this.dialer.communication)
      this.addNonOwnedParkedTask(this.dialer.communication)
      const params = {
        communication_id: this.dialer.communication.id
      }

      this.$axios.post('/api/v1/dialer/park', params).then(() => {
        console.log('Call parked')
      }).catch(err => {
        this.setDialerParkedCall()
        this.stopParkedCallTimer()
        console.log(err)
      }).finally(_ => {
        this.loadingPark = false
      })
    },

    unparkCall (parkedCallData = null, preventClear = false) {
      if (!parkedCallData && !this.dialer.parkedCall) {
        return
      }

      this.loadingUnpark = true
      const parkedCall = parkedCallData || this.dialer.parkedCall

      if ((parkedCallData && !preventClear) || !parkedCallData) {
        this.setDialerParkedCall()
        this.stopParkedCallTimer()
      }

      const data = {
        currentNumber: 'unhold:' + parkedCall.id,
        outboundCampaignId: parkedCall.campaign_id,
        contactName: (parkedCall.contact) ? parkedCall.contact.name : '',
        companyName: (parkedCall.contact) ? parkedCall.contact.company_name : '',
        contactId: parkedCall.contact_id,
        id: parkedCall.id
      }

      this.removeParkedCall(data.id)
      this.makeCall(data.currentNumber, data.outboundCampaignId, data.contactName, data.companyName, data.contactId)
      this.loadingUnpark = false
      this.setDialerRecordingStatus('paused')
      console.log('Unpark is in progress.')

      if (this.isMobile) {
        this.$VueEvent.fire('doneUnparkCall')
      }
    },

    parkCallCombo (shouldAnswer = false, shouldUnpark = false, data = null, parkFromAnotherTab = false) {
      if (this.isNotInProgressCall || (!shouldUnpark && this.dialer.parkedCall)) {
        return
      }

      this.loadingPark = true
      this.setDialerParkedCall(this.dialer.communication)
      const params = {
        communication_id: this.dialer.communication.id,
        call_parked_from_another_tab: parkFromAnotherTab
      }

      this.$axios.post('/api/v1/dialer/park', params).then(() => {
        console.log('Call parked combo')

        if (shouldAnswer) {
          if (this.dialer.communication) {
            this.setDialerCommunication()
          }

          this.makeCall('call:' + data.id, data.campaignId, '', '', null, data.isCallWaiting, shouldAnswer)
        } else if (shouldUnpark) {
          this.unparkCall(data, true)
        }

        this.setDialerIsMuted(false)
      }).catch(err => {
        this.setDialerParkedCall()
        this.stopParkedCallTimer()
        console.log(err)
      }).finally(_ => {
        this.loadingPark = false

        if (this.isMobile) {
          this.$VueEvent.fire('doneParkAndConnect')
        }
      })
    },

    hangupCallCombo (shouldAnswer = false, shouldUnpark = false, data = null) {
      if (this.isAgentOnCall && !this.dialer.call && this.dialer.communication) {
        talk2Api.V1.communication.agentForceTerminate(this.dialer.communication.id)
          .then(res => {
            this.hangUpInterval(shouldAnswer, shouldUnpark, data)
          })
      }

      if (!this.dialer.call) {
        return
      }

      console.log('Hanging up call')

      this.setDialerCurrentStatus('HANGING_UP_CALL')

      if (!this.connection) {
        return
      }

      // hangup an incoming call
      this.connection.hangup()
      this.hangUpInterval(shouldAnswer, shouldUnpark, data)
    },

    hangUpInterval (shouldAnswer = false, shouldUnpark = false, data = null) {
      const counter = { data: 0 }

      this.$options.hangupInterval = setInterval(() => {
        // Added 'READY' status to handle the case when the agent has set Wrap Time to 'No Wrap up'
        if (['WRAP_UP', 'READY'].includes(this.dialer.currentStatus)) {
          this.backToDial('Talk-hangupInterval')
          this.setDialerCurrentStatus('HANGING_UP_CALL')

          setTimeout(() => {
            if (shouldUnpark) {
              this.unparkCall(data)
            } else if (shouldAnswer) {
              this.makeCall('call:' + data.id, data.campaignId, '', '', null, data.isCallWaiting, shouldAnswer)
            }

            this.isMobile && this.$VueEvent.fire('doneHangupAndConnect')
            clearInterval(this.$options.hangupInterval)
          }, 1000)
        }

        counter.data++

        if (counter.data > 120) {
          clearInterval(this.$options.hangupInterval)
        }
      }, 500)
    },

    mergeCalls () {
      if (this.isNotInProgressCall) {
        return
      }

      this.loadingMerge = true
      const params = {
        communication_id: this.dialer.communication.id
      }

      this.$axios.post('/api/v1/dialer/merge-calls', params).then(res => {
        this.setShouldIntroduce(false)
        setTimeout(() => {
          this.forceRefreshCommunication()
        }, 500)
        console.log('Merge successful.')
      }).catch(err => {
        console.log(err)
      }).finally(_ => {
        this.loadingMerge = false
      })
    },

    dropThirdParty () {
      if (this.isNotInProgressCall) {
        return
      }

      this.loadingDropThirdParty = true
      this.$axios.post('/api/v1/dialer/drop-third-party', {
        communication_id: this.dialer.communication.id
      }).then(res => {
        this.setShouldIntroduce(false)
        this.setAddedParty()
        setTimeout(() => {
          this.forceRefreshCommunication()
        }, 500)
        console.log('Third party has been dropped out of this call.')
      }).catch(err => {
        console.log(err)
      }).finally(_ => {
        this.loadingDropThirdParty = false
      })
    },

    transferCall (transfer) {
      if (this.isNotInProgressCall) {
        return
      }

      this.loadingTransfer = true
      const params = {
        communication_id: this.dialer.communication.id,
        user_id: null,
        ring_group_id: null,
        phone_number: null,
        type: 'cold'
      }

      if (transfer.mode === 'user') {
        params.user_id = transfer.userId
      } else if (transfer.mode === 'ring-group') {
        params.ring_group_id = transfer.ringGroupId
      } else if (transfer.mode === 'phone-number') {
        params.phone_number = this.$options.filters.fixPhone(transfer.phoneNumber, 'E164', true, true)
      }

      this.$axios.post('/api/v1/dialer/conferencing-transfer', params).then(res => {
        setTimeout(() => {
          this.forceRefreshCommunication()
        }, 500)
        console.log('Transfer is in progress')
      }).catch(err => {
        console.log(err)
        this.$handleErrors(err.response)
      }).finally(() => {
        this.loadingTransfer = false
      })
    },

    addParticipant (add) {
      if (this.isNotInProgressCall) {
        return
      }

      this.loadingAdd = true
      const params = {
        communication_id: this.dialer.communication.id,
        introduce: add.introduce,
        user_id: null,
        ring_group_id: null,
        phone_number: null,
        type: 'warm'
      }

      switch (add.mode) {
        case 'user':
          params.user_id = add.userId
          const user = this.getUser(add.userId)

          if (user) {
            this.setAddedParty(user)
          }
          break
        case 'ring-group':
          params.ring_group_id = add.ringGroupId
          const ringGroup = this.getRingGroup(add.ringGroupId)

          if (ringGroup) {
            this.setAddedParty(ringGroup)
          }
          break
        case 'phone-number':
          params.phone_number = this.$options.filters.fixPhone(add.phoneNumber)
          this.setAddedParty({
            name: this.$options.filters.fixPhone(add.phoneNumber, 'NATIONAL', true, true)
          })
          break
      }

      this.$axios.post('/api/v1/dialer/conferencing-transfer', params).then(res => {
        this.setShouldIntroduce(params.introduce)
        setTimeout(() => {
          this.forceRefreshCommunication()
        }, 500)
        console.log((params.introduce) ? 'Introduce is in progress.' : 'Add is in progress.')
      }).catch(err => {
        this.setAddedParty()
        console.log(err)
        this.$handleErrors(err.response)
      }).finally(() => {
        this.loadingAdd = false
      })
    },

    cleanParticipant () {
      this.setAddedParty()
    },

    dialerCallPrep (call) {
      const map = call.customParameters
      const customParameters = {}

      map.forEach((value, key) => {
        customParameters[key] = value
      })

      // TODO: remove logs
      console.log('[Dialer] setDialerCall - call.direction value:', call.direction)
      console.log('[Dialer] setDialerCall - call object:', call)

      this.setDialerCall({
        from: call.parameters.From,
        to: call.parameters.To,
        callSid: call.parameters.CallSid,
        state: call.status(),
        isMuted: call.isMuted(),
        customParameters: customParameters,
        direction: call.direction
      })
    },

    resetCall () {
      if (this.shouldProcessRedial) {
        // Set active task as redialed, so it won't process redial again for this task
        this.activeTask.forcedRedial = true
        // Trigger onNextTask to handle redialing
        this.$VueEvent.fire('onNextTask')
        return
      }

      this.stopCallTimer()
      this.stopWrapUpTimer()
      this.stopParkedCallTimer()
      this.setDialerCall()
      this.setDialerCommunication()
      this.setDialerDeal()
      this.setShouldIntroduce(false)
      this.setAddedParty()
      this.setWarnings([])
      this.setDialerContact()
      this.setDialerCurrentNumber('')
      this.setDialerIsMuted(false)
      this.setDialerIsHeld(false)
      this.setDialerRecordingStatus('in-progress')
      this.setDialerCurrentStatus('READY')
      this.setShowIncomingCallNotification(false)
      this.setDialerAiAgentWhisper(false)
      this.setDialerAiAgentTakeover(false)
      this.setDialerIsBargeOrWhisperCall(false)
      this.pendingNotificationData = null
      this.notificationShownFromCustomParams = false
    },

    countCallDuration () {
      const duration = this.dialer.duration + 1
      const timer = this.secondsToHms(duration)
      this.setDialerDuration(duration)
      this.setDialerTimer(timer)
    },

    countWrapUpDuration () {
      if (this.wrapUpPaused || this.sessionPaused) {
        return
      }

      const duration = this.dialer.wrapUpDuration - 1
      const timer = this.secondsToHms(duration)
      this.setDialerWrapUpDuration(duration)
      this.setDialerWrapUpTimer(timer)

      if (duration <= 0) {
        this.stopWrapUpTimer()
        this.backToDial('Talk-CountWrapUpDuration')
      }
    },

    countParkedCallDuration () {
      const duration = this.dialer.parkedCallDuration + 1
      const timer = this.secondsToHms(duration)
      this.setDialerParkedCallDuration(duration)
      this.setDialerParkedCallTimer(timer)
    },

    secondsToHms (d) {
      d = Number(d)
      const h = Math.floor(d / 3600)
      const m = Math.floor(d % 3600 / 60)
      const s = Math.floor(d % 3600 % 60)
      return ((h > 0 ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (s < 10 ? '0' : '') + s)
    },

    startCallTimer () {
      const timer = this.secondsToHms(0)
      this.setDialerDuration(0)
      this.setDialerTimer(timer)
      this.$options.callDurationInterval = setInterval(this.countCallDuration, 1000)
    },

    stopCallTimer () {
      this.setDialerDuration(0)
      this.setDialerTimer('')
      clearInterval(this.$options.callDurationInterval)
    },

    startWrapUpTimer () {
      this.setDialerCurrentStatus('WRAP_UP')

      // when communication is rejected by app, skip wrap-up
      if (this.dialer.communication?.rejected_by_app) {
        this.$VueEvent.fire('callEnded')
        return
      }

      const wrapUpTimer = this.currentCompany && this.currentCompany.force_wrap_up
        ? this.currentCompany.wrap_up_seconds
        : this.profile.wrap_up_seconds
      console.log('Wrap-up time: ' + wrapUpTimer)

      if (wrapUpTimer < 0 || this.isBargingOrWhispering) {
        this.backToDial('Talk-StartWrapUpTimer')
        return
      }

      if (wrapUpTimer === 0) {
        this.stopWrapUpTimer()
        return
      }

      this.setDialerWrapUpDuration(wrapUpTimer)
      this.setDialerWrapUpTimer(this.secondsToHms(this.dialer.wrapUpDuration))
      this.$options.wrapUpDurationInterval = setInterval(this.countWrapUpDuration, 1000)
    },

    stopWrapUpTimer () {
      this.setDialerWrapUpDuration(0)
      this.setDialerWrapUpTimer('')
      clearInterval(this.$options.wrapUpDurationInterval)
    },

    startParkedCallTimer () {
      const timer = this.secondsToHms(0)
      this.setDialerParkedCallDuration(0)
      this.setDialerParkedCallTimer(timer)
      this.$options.parkedCallDurationInterval = setInterval(this.countParkedCallDuration, 1000)
    },

    stopParkedCallTimer () {
      this.setDialerParkedCallDuration(0)
      this.setDialerParkedCallTimer('')
      clearInterval(this.$options.parkedCallDurationInterval)
    },

    backToDial (signature = 'Talk-BackToDial', forceStatus = false, ignoreForceDisposition = false) {
      // Check if this is a barge/whisper call
      const isBargeOrWhisperCall = this.dialer?.isBargeOrWhisperCall

      // For barge/whisper calls, skip force disposition and reset immediately
      if (isBargeOrWhisperCall) {
        // Force agent status to available for barge/whisper calls
        this.changeAgentStatus(AgentStatus.AGENT_STATUS_ACCEPTING_CALLS, true, 1, signature)
        this.resetCall(signature)
        return
      }

      // do not send status change to Aloware because connection was cancelled outside, we will wait a new agent status from Aloware
      if (signature !== 'Talk-Connection.OnCancel') {
        this.resetAgentStatus(forceStatus, signature)
      }

      // halt due to required forced dispositions
      if (this.isForcedToDisposeAndNotDisposed && !ignoreForceDisposition) {
        return
      }

      this.resetCall(signature)
    },

    playDispositionNotification () {
      if (this.$q.platform.is.electron) {
        const myMedia = new window.Media(process.env.API_URL + '/static/ivr/default-communication-notification.wav', () => {
        }, (err) => {
          console.log('playAudio():Audio Error: ' + err)
        })
        myMedia.play()
      }
    },

    setInputDevice (inputDevice) {
      this.device.setInputDevice(inputDevice).then(() => {
        console.info('Changed input device', inputDevice)
        this.setCurrentInputDevice(inputDevice)
      }).catch(err => {
        console.info('Could not change the input device!', err)
      })
    },

    getInputDevices () {
      const inputDevices = []

      if (!this.device) {
        return inputDevices
      }

      const devices = this.device.availableInputDevices()

      if (devices) {
        devices.forEach(function (device, id) {
          inputDevices.push({
            id: id,
            label: device.label
          })
        })
      }

      return inputDevices
    },

    setOutputDevice (outputDevice) {
      this.device.setSpeakerDevice(outputDevice).then(() => {
        console.info('Changed output device', outputDevice)
        this.setCurrentOutputDevice(outputDevice)
      }).catch(err => {
        console.info('Could not change the output device!', err)
      })
    },

    getOutputDevices () {
      const outputDevices = []

      if (!this.device) {
        return outputDevices
      }

      const devices = this.device.availableOutputDevices()

      if (devices) {
        devices.forEach(function (device, id) {
          outputDevices.push({
            id: id,
            label: device.label
          })
        })
      }

      return outputDevices
    },

    testOutputDevice (outputDevice) {
      this.device.testSpeakerDevice().then(() => {
        console.info('Tested speaker device', outputDevice)
      }).catch(err => {
        console.info('Could not test the speaker device!', err)
      })
    },

    initializeSettings () {
      this.setInputDevices(this.getInputDevices())
      this.setOutputDevices(this.getOutputDevices())
    },

    bounceDock () {
      if (this.$q.platform.is.electron) {
        this.$q.electron.ipcRenderer.send('bounce', 'critical')
      }
    },

    handleError (error) {
      this.setDialerCurrentStatus('GOT_ERROR')
      this.setDialerError({
        message: error.message,
        code: error.code
      })
      const err = new Error(`${error.message} Code: ${error.code}`)
      err.code = error.code
      error.token = this.dialer.token

      console.error(error)

      // 31000 => General Twilio Client error.
      // 31005 => WebSocket connection to Twilio's signaling servers were unexpectedly ended. If this is happening consistently,
      // there may be an issue resolving the hostname provided. If a region is being specified in Device setup, ensure it's a valid region.
      // 31009 => No transport available to send or receive messages.
      // 31201 => Generic unknown error. => New Code 31402

      // Handled errors
      // 31003 => Connection timeout. => New Code 53405
      // 31204 => Invalid JWT token.
      // 31205 => JWT token expired.
      // 9221 => Cannot connect to insights
      // 20101 => Invalid token
      // 31102 => MalformedRequestErrors.AuthorizationTokenMissingError, SignatureValidationErrors.AccessTokenSignatureValidationFailed
      // 31203 => AuthorizationErrors.NoValidAccountError
      // 31207 => AuthorizationErrors.JWTTokenExpirationTooLongError
      // 31404 => ClientErrors.NotFound
      // 31480 => ClientErrors.TemporarilyUnavilable
      // 31486 => ClientErrors.BusyHere
      // 31603 => SIPServerErrors.Decline
      // 31002 => GeneralErrors.ConnectionDeclinedError
      if (![9221, 20101, 31000, 31005, 31009, 31102, 31203, 31204, 31205, 31207, 53405].includes(err.code)) {
        this.$Sentry.captureException(err)
      }

      // Apply retry mechanism only to 31009 error (No transport available) for company ID 7113, 2584, 1629
      if (err.code === 31009 && [7113, 2584, 1629].includes(this.currentCompany?.id)) {
        // Increment retry count
        this.tokenRetryCount++

        // Calculate exponential backoff delay: baseDelay * 2^(retryCount - 1)
        const delay = this.baseRetryDelay * Math.pow(2, this.tokenRetryCount - 1)

        console.log(`Token retry attempt ${this.tokenRetryCount}/${this.maxTokenRetries} with ${delay}ms delay for error 31009 (Company ID: ${this.currentCompany.id})`)

        // Set timeout to prevent multiple simultaneous requests
        this.tokenRetryTimeout = setTimeout(() => {
          this.tokenRetryTimeout = null
          this.getDesktopToken(true)
            .catch(retryErr => {
              console.error('Token retry failed:', retryErr)
              if (this.tokenRetryCount >= this.maxTokenRetries) {
                this.setDialerIsReady(false)
                this.setDialerCurrentStatus('OFFLINE')
                this.$generalNotification('Failed to reconnect after multiple attempts. Please refresh the page.', 'error', 10000)
              }
            })
        }, delay)

        return
      }

      // Request new token immediately for other token-related errors (original behavior)
      if ([20101, 31102, 31204, 31205, 31207, 31009].includes(err.code)) {
        return this.getDesktopToken(true)
      }

      this.setDialerIsReady(false)
    },

    rebootPhone (login = false) {
      this.backToDial('Talk-RebootPhone')

      if (login) {
        this.setDialerCurrentStatus('RESTARTING')
        // Reset retry count for manual reboot
        this.resetTokenRetryState()
        this.getDesktopToken()
        return
      }

      this.setDialerIsReady(true)
      this.setDialerCurrentStatus('READY')
    },

    answerCallFishing (communication, shouldPark = false, shouldHangup = false, parkFromAnotherTab = false) {
      this.setShowIncomingCallNotification(false)

      if (this.shouldPushPhoneRoute) {
        this.$router.push({
          name: 'Phone'
        })
      }

      // store temporarily the parked call
      const parkedCall = this.dialer.parkedCall ? JSON.parse(JSON.stringify(this.dialer.parkedCall)) : null

      // answer the incoming call then park the in-progress call
      if (shouldPark && !parkedCall) {
        this.parkCallCombo(true, false, communication, parkFromAnotherTab)
        return
      }

      // park the in-progress call and unpark the parked call
      if (shouldPark && parkedCall) {
        this.parkCallCombo(false, true, parkedCall, parkFromAnotherTab)
        return
      }

      // hang-up the in-progress call and unpark the parked call
      if (shouldHangup && parkedCall) {
        this.hangupCallCombo(false, true, parkedCall)
        return
      }

      // hangup the in-progress call and answer the incoming call
      if (shouldHangup && !parkedCall) {
        this.hangupCallCombo(true, false, communication)
        return
      }

      console.log('answerCallFishing', {
        connection: !!this.connection,
        dialer_currentStatus: this.dialer.currentStatus,
        communication_campaignId: communication.campaignId,
        agent_status: this.agentStatus
      })

      if (this.dialer.currentStatus === 'RECEIVED_CALL_INVITE' && this.agentStatus === AgentStatus.AGENT_STATUS_RINGING) {
        this.connection.accept()
      } else {
        this.makeCall('call:' + communication.id, communication.campaignId)
      }
    },

    saveCallIssue (warningName, warningData) {
      if (this.dialer.communication && warningData) {
        const {
          samples,
          ...dataCallIssue
        } = warningData

        try {
          // Ensure that the data can be safely converted to JSON
          const dataString = JSON.stringify(dataCallIssue)
          const params = {
            event_name: warningName,
            communication_id: this.dialer.communication.id,
            data: dataString
          }

          // Post call, but handle any errors gracefully
          this.$axios.post('/api/v2/call-quality-events', params)
            .catch(err => {
              console.error('Error saving call issue:', err)
              this.$handleErrors(err.response)
            })
        } catch (error) {
          console.error('Invalid data for call issue:', error)
          // Handle the error
        }
      } else {
        console.warn('Warning: Missing required data for saving call issue.')
      }
    },

    fetchAndSetAiAgentCallMode (commId, type = null) {
      return talk2Api.V1.communication.get(commId)
        .then(res => {
          if (type === COMMUNICATION_SENTRY_TYPE.WHISPER && this.isAiAgentUser(res.data.user)) {
            this.setDialerAiAgentWhisper(true)
          } else if (type === COMMUNICATION_SENTRY_TYPE.BARGE && this.isAiAgentUser(res.data.user)) {
            this.setDialerAiAgentTakeover(true)
          }
          return res.data
        })
        .catch(err => {
          console.error('Error fetching communication details:', err)
        })
    },

    ...mapActions([
      'setDialerToken',
      'setDialerCall',
      'setDialerParkedCall',
      'setDialerIsReady',
      'setDialerCurrentStatus',
      'setDialerCommunication',
      'setDialerDeal',
      'setDialerContact',
      'setDialerCurrentNumber',
      'setDialerIsMuted',
      'setDialerIsHeld',
      'setDialerRecordingStatus',
      'setDialerDuration',
      'setDialerTimer',
      'setDialerWrapUpDuration',
      'setDialerWrapUpTimer',
      'setDialerParkedCallDuration',
      'setDialerParkedCallTimer',
      'setOldAgentStatus',
      'setWarnings',
      'setShouldIntroduce',
      'setAddedParty',
      'setCurrentInputDevice',
      'setInputDevices',
      'setCurrentOutputDevice',
      'setOutputDevices',
      'setShowIncomingCallNotification',
      'setDialerFormStatus',
      'setDialerError',
      'setDialerErrorDefault',
      'removeParkedCall',
      'setIsCallBackButtonDisabled',
      'setDialerAiAgentWhisper',
      'setDialerAiAgentTakeover',
      'setDialerIsBargeOrWhisperCall'
    ]),

    // Helper method to reset token retry state
    resetTokenRetryState () {
      this.tokenRetryCount = 0
      if (this.tokenRetryTimeout) {
        clearTimeout(this.tokenRetryTimeout)
        this.tokenRetryTimeout = null
      }
    },

    buildCommunicationFromCustomParameters () {
      const customParams = this.dialer.call?.customParameters

      console.log('Attempting to build communication from customParameters:', customParams)

      if (!customParams || !this.dialer.call) {
        return null
      }

      const requiredParams = ['ContactId', 'CommunicationData', 'CampaignId', 'CampaignName']
      const missingParams = requiredParams.filter(param => {
        return !customParams[param]
      })

      if (missingParams.length > 0) {
        console.log(`Missing required parameters in customParameters: ${missingParams.join(', ')}, falling back to API call`)
        return null
      }

      const campaignId = parseInt(customParams.CampaignId) || null

      let communicationData
      let locationData = null

      try {
        communicationData = JSON.parse(customParams.CommunicationData)
      } catch (error) {
        console.error('Failed to parse CommunicationData JSON from customParameters:', error)
        return null
      }

      if (!communicationData || !communicationData.Id) {
        console.error('CommunicationData is missing or invalid')
        return null
      }

      if (customParams.LocationData) {
        try {
          locationData = JSON.parse(customParams.LocationData)
        } catch (error) {
          console.warn('Failed to parse LocationData JSON from customParameters, continuing without location data:', error)
          locationData = null
        }
      }

      const communication = {
        id: parseInt(communicationData.Id) || null,
        contact: {
          id: parseInt(customParams.ContactId) || null,
          name: customParams.ContactName,
          phone_number: this.dialer.call.from,
          user_id: customParams?.ContactUserId,
          company_name: customParams?.CompanyName
        },
        city: locationData?.City,
        state: locationData?.State,
        country: locationData?.Country,
        ring_group_id: parseInt(communicationData.RingGroupId) || null,
        campaign_id: campaignId,
        campaign: {
          name: customParams?.CampaignName
        }
      }

      console.log('Successfully built communication data from customParameters:', communication)
      return communication
    },

    async checkMicrophonePermission () {
      // Check if the browser supports getUserMedia
      if (!navigator?.mediaDevices?.getUserMedia) {
        console.error('[checkMicrophonePermission] microphone not supported')
        this.showMicrophonePermissionModal()
        return false
      }

      // Check current permission status (only if Permissions API is supported)
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' })
        if (permissionStatus.state === 'denied') {
          console.error('[checkMicrophonePermission] microphone access denied')
          this.showMicrophonePermissionModal()
          return false
        }
      } catch (error) {
        // Permissions API not supported, continue to getUserMedia check
      }

      // Try to get microphone access to trigger permission request if needed
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        // Stop the stream immediately to avoid keeping the microphone active
        stream.getTracks().forEach(track => track.stop())
        return true
      } catch (error) {
        console.error('[checkMicrophonePermission] getUserMedia error:', error)
        this.showMicrophonePermissionModal()
        return false
      }
    },

    showMicrophonePermissionModal () {
      this.$refs.microphonePermissionModal.show()
    }
  },

  watch: {
    'dialer.currentStatus': function (value) {
      if (value === 'ANSWERING_CALL' && this.dialer.error.code !== null) {
        this.setDialerErrorDefault()
      }
    },

    agentStatus (newStatus, oldStatus) {
      if (newStatus === AgentStatus.AGENT_STATUS_RINGING &&
        oldStatus !== AgentStatus.AGENT_STATUS_RINGING &&
        this.pendingNotificationData &&
        !this.notificationShownFromCustomParams) {
        this.$VueEvent.fire('new_in_app_call', this.pendingNotificationData)
        this.processActionNotification(this.pendingNotificationData, 'call')
        this.notificationShownFromCustomParams = true
        this.pendingNotificationData = null
      }
    }
  },

  beforeDestroy () {
    this.stopDialerWrapUpEvents()
    this.stopDialerEvents()
    clearInterval(this.$options.callDurationInterval)
    clearInterval(this.$options.wrapUpDurationInterval)
    clearInterval(this.$options.parkedCallDurationInterval)
    clearInterval(this.$options.webrtcTokenRegenerateInterval)
    clearInterval(this.$options.hangupInterval)
    clearInterval(this.unownedContact.interval)

    // Clear token retry timeout
    this.resetTokenRetryState()

    // Destroy the Twilio device to avoid having multiple Twilio device instances.
    console.log('Destroying Twilio device')
    this.device.destroy()
  }
}
</script>
