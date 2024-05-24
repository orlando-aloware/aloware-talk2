<template>
  <div></div>
</template>

<script>
import TwilioDevice from '../communication/twilio/device'
import _ from 'lodash'
import { mapActions, mapState } from 'vuex'
import {
  aclMixin,
  agentMixin,
  userMixin,
  notificationMixin,
  visibilityMixin,
  unownedContactTaskMixin,
  dialerWrapUpMixin
} from '../../boot/mixins'
import * as WebrtcEvents from '../../constants/webrtc-events'
import * as AgentStatus from '../../constants/agent-status'
import * as CommunicationDispositionStatus from '../../constants/communication-disposition-status'
import * as CommunicationCurrentStatus from '../../constants/communication-current-status'

export default {
  name: 'dialer',

  mixins: [
    aclMixin,
    agentMixin,
    userMixin,
    notificationMixin,
    visibilityMixin,
    unownedContactTaskMixin,
    dialerWrapUpMixin
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
      CommunicationDispositionStatus
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany', 'profile']),

    ...mapState(['dialer', 'dialerFormStatus', 'isMobile', 'ringGroups']),

    ...mapState('auth', ['profile', 'authenticated']),

    ...mapState('powerDialer', ['activeTask', 'powerDialerTasks']),

    isNotInProgressCall () {
      return !this.dialer.call || !this.dialer.communication ||
        !['connected', 'open'].includes(this.dialer.call.state)
    },

    hasNoParkedAndInprogressCall () {
      return !this.dialer.parkedCall && !this.dialer.call
    },

    hasParkedAndInprogressCall () {
      return this.dialer.parkedCall && this.dialer.call
    },

    hasCallInProgressNoParkedCall () {
      return !this.dialer.parkedCall && this.dialer.call
    }
  },

  created () {
    this.dialerListeners.updateCommunication = (data) => {
      if (!this.checkCommunicationMatchesUserAccessibility(data)) {
        return
      }

      // check data matches dialer communication
      if (this.dialer.communication && this.dialer.communication.id === data.id) {
        data = _.merge(this.dialer.communication, data)
        this.setDialerCommunication(data)

        const user = this.getUser(this.dialer.communication.added_user_id)

        if (user.name) {
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

    this.dialerListeners.reconnectDialer = () => {
      this.getDesktopToken(true)
        .then(() => {
          this.device.register()
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
      console.log('Resetting call')
      this.resetCall()
    }

    this.dialerListeners.makeCall = (data) => {
      this.makeCall(data.currentNumber, data.outboundCampaignId, data.contactName, data.companyName, data.contactId)
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
      this.answerCallFishing(data.communication, data.shouldPark, data.shouldHangup)
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
      this.setDialerIsReady(true)
      this.setDialerCurrentStatus('READY')
      this.checkForcedStatus()
    })

    this.device.on(WebrtcEvents.UNREGISTERED, (device) => {
      this.removeUnownedLiveContactTask()

      if (this.dialer.isReady) {
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
      this.removeUnownedLiveContactTask()
      this.handleError(error)
      this.backToDial('Talk-Device.OnError')
    })

    this.device.on(WebrtcEvents.INCOMING, (call) => {
      this.stopAudio()
      this.connection = this.device._createConnection(call._connection, true)
      this.initConnectionEvents()
      console.log('Received call invite', call)
      this.dialerCallPrep(call._connection)
      this.setDialerCurrentNumber(this.$options.filters.fixPhone(call.from, 'E164'))
      this.setDialerCurrentStatus('RECEIVED_CALL_INVITE')
      console.log('call information', call.callSid, call.from, this.dialer.currentNumber)

      // restore app when a call comes
      if (this.$q.platform.is.electron) {
        this.$q.electron.ipcRenderer.send('restore_app')
      }

      this.getCommunication(this.dialer.call.callSid, this.dialer.call.from).then(res => {
        if (res) {
          this.$VueEvent.fire('new_in_app_call', res.data)
          this.processActionNotification(res.data, 'call')
          this.addNonOwnedLiveContact(res.data)
        }
      }).catch((err) => {
        console.log(err)
      })
    })

    this.device.on(WebrtcEvents.CANCEL, (call) => { // When originator cancels a call
      this.removeUnownedLiveContactTask()
      console.log('Call invite canceled', call)
      this.setDialerCurrentStatus('INVITE_CANCELLED')
      this.backToDial('Talk-Device.OnCancel')
      this.connection = null
      this.$closeActionNotification('incomingCall')
    })

    this.device.on(WebrtcEvents.DISCONNECT, (call) => { // On hangup
      console.log('Call ended', call, this.dialer.parkedCall, this.dialer.call)

      if (this.dialer.communication) {
        this.$VueEvent.fire('callDisconnected', this.dialer.communication.id)
      }

      this.removeUnownedLiveContactTask()
      this.stopCallTimer()
      this.connection = null
      this.setDialerCurrentStatus('CALL_DISCONNECTED')

      if (this.hasNoParkedAndInprogressCall || this.hasParkedAndInprogressCall || this.hasCallInProgressNoParkedCall) {
        this.startWrapUpTimer()
        return
      }

      this.backToDial('Talk-Device.OnDisconnect')
    })

    this.getDesktopToken()

    // ping getDesktopToken every 24 hours
    this.$options.webrtcTokenRegenerateInterval = setInterval(() => {
      if (this.authenticated) {
        this.getDesktopToken()
      }
    }, 24 * 60 * 60 * 1000)
  },

  methods: {
    checkForcedStatus () {
      if (!this.profile.last_call) {
        return
      }
      const shouldForceContactDisposition = this.currentCompany.force_contact_disposition &&
        !this.profile.last_call.contact.disposition_status_id
      const shouldForceCallDisposition = this.currentCompany.force_call_disposition &&
        !this.profile.last_call.call_disposition_id
      if (shouldForceContactDisposition || shouldForceCallDisposition) {
        this.forceStartOnWrapUp()
      }
    },
    forceStartOnWrapUp () {
      this.setDialerCommunication(this.profile.last_call)
      this.setDialerContact(this.profile.last_call.contact)
      this.startWrapUpTimer()
    },
    startDialerEvents () {
      this.$VueEvent.listen('update_communication', this.dialerListeners.updateCommunication)
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
    },

    stopDialerEvents () {
      this.$VueEvent.stop('update_communication', this.dialerListeners.updateCommunication)
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
    },

    forceRefreshCommunication () {
      return this.getCommunication(this.dialer.call.callSid, this.dialer.currentNumber, 1, true)
    },

    getCommunication (sid, from, getCommunicationTry = 1, force = false) {
      console.log('Getting communication', sid, from, getCommunicationTry)

      if (this.dialer.communication && !force) {
        return Promise.resolve()
      }

      this.loadingCommunication = true
      return this.$axios.get('/api/v1/communication/info', {
        params: {
          sid: sid,
          phone_number: from,
          live: true
        }
      }).then(res => {
        if (this.dialer.communication && !force) {
          return Promise.resolve()
        }

        const routeTitle = _.get(this.$route, 'meta.title', null)

        // If the communication was rejected by app then move it to skipped list
        if (res.data?.rejected_by_app) {
          const tempSet = new Set([...this.powerDialerTasks.skipped, this.activeTask].map(JSON.stringify)) // Convert each element to JSON to ensure correct comparison
          this.powerDialerTasks.skipped = Array.from(tempSet).map(JSON.parse) // Convert elements back to their original types
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

        this.setDialerCommunication(res.data)

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
        // setup twilio client

        /**
         * An ordered list of preferred codecs. Currently, 'pcmu' and 'opus' are supported.
         * PCMU will remain default until the next breaking release,
         * however we recommend testing and using Opus as it can provide better quality for lower bandwidth,
         * particularly noticeable in poor network conditions.
         */
        // initialize twilio client
        const options = {
          edge: ['umatilla', 'ashburn', 'roaming'],
          codecPreferences: ['opus', 'pcmu']
        }
        if (this.currentCompany && this.currentCompany.twilio_debug_log) {
          options.logLevel = 1
          options.enableImprovedSignalingErrorPrecision = true
        }
        if (this.isCompanyPartOfCustomEdgeLocations(this.currentCompany.id)) {
          options.edge = ['ashburn', 'umatilla', 'roaming'],
        }
        this.device.initialize(this.dialer.token, options)

        console.log('Reset device', reset)
        if (!reset) {
          this.device.register()
        } else {
          this.device.updateToken(this.dialer.token)
        }

        // remove the errors if we successfully generated a token
        this.setDialerErrorDefault()

        return Promise.resolve(res)
      }).catch(err => {
        this.loading = false
        console.log(err)
        return Promise.reject(err)
      })
    },

    async makeCall (currentNumber, outboundCampaignId, contactName = '', companyName = '', contactId = null) {
      console.log(currentNumber, outboundCampaignId, contactName, companyName, contactId, this.dialer.isReady, this.dialer.call)

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

      if (this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL) {
        console.log('Agent has a call in progress on another device', { agentStatus: this.profile.agent_status })
        return
      }

      if (this.isMobile && this.$route.name !== 'Phone') {
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

      console.log(' %c Making a call to: ', 'background: #000; color: #fff000;', params)

      this.setDialerCurrentStatus('MAKING_CALL')
      this.setDialerCurrentNumber(params['To'])

      // check if connection is completely closed before opening a new one
      if (this.connection) {
        console.log('Dialer is busy', currentNumber, outboundCampaignId)
        return
      }

      this.connection = await this.device.connect(params, true)
      this.initConnectionEvents()

      // Make sure that phone number is string in this part before proceeding
      currentNumber = currentNumber.toString()
      // force mute
      if (currentNumber.includes('barge') || currentNumber.includes('whisper')) {
        this.forceMute()
      }
    },

    initConnectionEvents () {
      if (!this.connection) {
        return
      }

      this.connection.on(WebrtcEvents.CONNECTION_WARNING, (warningName, warningData) => {
        console.log(WebrtcEvents.CONNECTION_WARNING, warningName, warningData)
        // add warning to list
        if (this.warnings.indexOf(warningName) === -1) {
          this.warnings.push(warningName)
        }

        this.setWarnings(this.warnings)
      })

      this.connection.on(WebrtcEvents.CONNECTION_WARNING_CLEARED, (warningName) => {
        console.log(WebrtcEvents.CONNECTION_WARNING_CLEARED, warningName)
        // remove warning from list
        this.warnings = this.warnings.filter(value => value !== warningName)
        this.setWarnings(this.warnings)
      })

      this.connection.on(WebrtcEvents.CONNECTION_ACCEPT, (call) => { // On accept call
        console.log('Successfully connected call', call)
        this.updateUnownedContactLastCommunicationStatus()
        this.dialerCallPrep(call)
        this.startCallTimer()
        this.setDialerCurrentStatus('CALL_CONNECTED')
        this.getCommunication(this.dialer.call.callSid, this.dialer.currentNumber)
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
        console.log('Call invite canceled', call)
        this.connection = null
        this.setDialerCurrentStatus('INVITE_CANCELLED')
        this.backToDial('Talk-Connection.OnCancel')
        this.$closeActionNotification('incomingCall')
      })

      this.connection.on(WebrtcEvents.CONNECTION_DISCONNECT, (call) => { // On hangup
        if (this.dialer.communication) {
          this.$VueEvent.fire('callDisconnected', this.dialer.communication.id)
        }

        console.log('Call ended', call, this.dialer.parkedCall, this.dialer.call)
        this.removeUnownedLiveContactTask()
        this.stopCallTimer()
        this.connection = null
        this.setDialerCurrentStatus('CALL_DISCONNECTED')

        if (this.hasNoParkedAndInprogressCall || this.hasParkedAndInprogressCall || this.hasCallInProgressNoParkedCall) {
          this.startWrapUpTimer()
          return
        }

        this.backToDial('Talk-Connection.OnDisconnect')
      })
    },

    hangupCall () {
      if (!this.dialer.call) {
        return
      }

      console.log('Hanging up call')

      this.setDialerCurrentStatus('HANGING_UP_CALL')

      this.connection.hangup()
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

    answerCall (communication = null) {
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
        if (this.isMobile && this.$route.name !== 'Phone') {
          this.$router.push({
            name: 'Phone'
          })
        }
        // accept the incoming connection and start two-way audio
        this.connection.accept()
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
      // @custom for HutchBug, Cardone Capital: rejecting a call should still keep the agent on the previous status
      if (this.currentCompany && ![379, 892].includes(this.currentCompany.id) &&
        !this.currentCompany.force_users_always_available) {
        this.changeAgentStatus(AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS, false, 1, 'Talk-RejectCall')
      }

      this.resetCall()
    },

    toggleMute () {
      if (!this.dialer.call || !['connected', 'open'].includes(this.dialer.call.state)) {
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
          console.log('Call parked')
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

    parkCallCombo (shouldAnswer = false, shouldUnpark = false, data = null) {
      if (this.isNotInProgressCall || (!shouldUnpark && this.dialer.parkedCall)) {
        return
      }

      this.loadingPark = true
      this.setDialerParkedCall(this.dialer.communication)
      const params = {
        communication_id: this.dialer.communication.id
      }

      this.$axios.post('/api/v1/dialer/park', params).then(() => {
        console.log('Call parked')

        if (shouldAnswer) {
          this.makeCall('call:' + data.id, data.campaignId)
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

      const counter = { data: 0 }

      this.$options.hangupInterval = setInterval(() => {
        if (this.dialer.currentStatus === 'WRAP_UP') {
          this.backToDial('Talk-hangupInterval')

          setTimeout(() => {
            if (shouldUnpark) {
              this.unparkCall(data)
            } else if (shouldAnswer) {
              this.makeCall('call:' + data.id, data.campaignId)
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
        console.log((params.introduce) ? 'Introduce is in progress.' : 'Add is in progress.')
      }).catch(err => {
        this.setAddedParty()
        console.log(err)
        this.$handleErrors(err.response)
      }).finally(() => {
        this.loadingAdd = false
      })
    },

    dialerCallPrep (call) {
      const map = call.customParameters
      const customParameters = {}

      map.forEach((value, key) => {
        customParameters[key] = value
      })

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
    },

    countCallDuration () {
      const duration = this.dialer.duration + 1
      const timer = this.secondsToHms(duration)
      this.setDialerDuration(duration)
      this.setDialerTimer(timer)
    },

    countWrapUpDuration () {
      if (this.wrapUpPaused) {
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

    backToDial (signature = 'Talk-BackToDial', forceStatus = false) {
      this.resetAgentStatus(forceStatus, signature)
      this.resetCall()
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

      // Request new token if error
      if ([20101, 31102, 31204, 31205, 31207].includes(err.code)) {
        return this.getDesktopToken(true)
      }

      this.setDialerIsReady(false)
    },

    rebootPhone (login = false) {
      this.backToDial('Talk-RebootPhone')

      if (login) {
        this.setDialerCurrentStatus('RESTARTING')
        this.getDesktopToken()
        return
      }

      this.setDialerIsReady(true)
      this.setDialerCurrentStatus('READY')
    },

    answerCallFishing (communication, shouldPark = false, shouldHangup = false) {
      this.setShowIncomingCallNotification(false)

      if (this.isMobile && this.$route.name !== 'Phone') {
        this.$router.push({
          name: 'Phone'
        })
      }

      // store temporarily the parked call
      const parkedCall = this.dialer.parkedCall ? JSON.parse(JSON.stringify(this.dialer.parkedCall)) : null

      // answer the incoming call then park the in-progress call
      if (shouldPark && !parkedCall) {
        this.parkCallCombo(true, false, communication)
        return
      }

      // park the in-progress call and unpark the parked call
      if (shouldPark && parkedCall) {
        this.parkCallCombo(false, true, parkedCall)
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

      this.makeCall('call:' + communication.id, communication.campaignId)
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
      'removeParkedCall'
    ])
  },

  watch: {
    'dialer.currentStatus': function (value) {
      if (value === 'ANSWERING_CALL' && this.dialer.error.code !== null) {
        this.setDialerErrorDefault()
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
  }
}
</script>
