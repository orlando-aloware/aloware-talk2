<template>
  <div></div>
</template>

<script>
import TwilioDevice from '../communication/twilio/device'
import _ from 'lodash'
import { mapActions, mapState } from 'vuex'
import { aclMixin, agentMixin } from '../../boot/mixins'
import * as WebrtcEvents from '../../constants/webrtc-events'
import * as AgentStatus from '../../constants/agent-status'
import * as CommunicationDispositionStatus from '../../constants/communication-disposition-status'

export default {
  name: 'dialer',

  mixins: [aclMixin, agentMixin],

  data () {
    return {
      loadingCommunication: false,
      loadingDropThirdParty: false,
      loadingToggleRecordingStatus: false,
      loadingMerge: false,
      loadingHold: false,
      loadingUnhold: false,
      loadingPark: false,
      loadingUnpark: false,
      callNotification: null,
      desktopNotification: null,
      device: new TwilioDevice(),
      connection: null,
      warnings: [],
      AgentStatus,
      WebrtcEvents,
      CommunicationDispositionStatus
    }
  },

  computed: {
    ...mapState(['currentCompany', 'dialer']),
    ...mapState('auth', ['profile', 'authenticated'])
  },

  created () {
    this.$VueEvent.listen('update_communication', (data) => {
      // check data matches dialer communication
      if (this.dialer.communication && this.dialer.communication.id === data.id) {
        data = _.merge(this.dialer.communication, data)
        this.setDialerCommunication(data)
        if (this.dialer.communication.contact) {
          this.setDialerContact(this.dialer.communication.contact)
        }
      }

      // check data matches dialer on hold call
      if (this.dialer.parkedCall && this.dialer.parkedCall.id === data.id) {
        if (data.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          data = _.merge(this.dialer.parkedCall, data)
          this.setDialerParkedCall(data)
        } else {
          this.setDialerParkedCall()
        }
      }
    })

    // initialize twilio client
    this.device.initialize()

    this.device.on(WebrtcEvents.READY, (device) => {
      // Subscribe to the event for when the list of devices changes
      device.audio.on('deviceChange', () => this.getInputDevices())

      // Now it's time to Call getUserMedia to get the input device names.
      // This is needed to get the labels. Otherwise, we will only have device IDs.
      // It's also recommended to ensure we know which mic to use when the call comes in.
      // Furthermore, performing this action here, allows for capturing gUM errors early
      // before accepting/receiving a call and it's possible to create a much better user experience
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        this.getInputDevices()

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

      console.log('Ready to start')
      this.setDialerIsReady(true)
      this.setDialerCurrentStatus('READY')
    })

    this.device.on(WebrtcEvents.OFFLINE, (device) => {
      if (this.dialer.isReady) {
        this.$q.notify({
          timeout: 10000,
          type: 'negative',
          message: 'Whoops! You have lost connection with the server. Check your internet connection and try again.'
        })
        this.setDialerIsReady(false)
        this.setDialerCurrentStatus('OFFLINE')
      }
    })

    this.device.on(WebrtcEvents.ERROR, (error) => {
      this.handleError(error)
      this.backToDial()
    })

    this.device.on(WebrtcEvents.INCOMING, (call) => {
      console.log('Received call invite', call)
      let map = call._connection.customParameters
      let customParameters = {}
      map.forEach((value, key) => {
        customParameters[key] = value
      })
      this.setDialerCall({
        from: call.from,
        to: call.to,
        callSid: call.callSid,
        state: call.state,
        isMuted: call.isMuted,
        customParameters: customParameters,
        direction: call._connection._direction
      })
      this.setDialerCurrentNumber(this.$options.filters.fixPhone(this.dialer.call.from, 'E164'))
      this.setDialerCurrentStatus('RECEIVED_CALL_INVITE')
      console.log('call information', this.dialer.call.callSid, this.dialer.call.from, this.dialer.currentNumber)

      // restore app when a call comes
      if (this.$q.platform.is.electron) {
        this.$q.electron.ipcRenderer.send('restore_app')
      }

      this.getCommunication(this.dialer.call.callSid, this.dialer.call.from).finally(() => {
        // this.$router.push({ name: 'Incoming Call' }).catch(err => {
        //   console.log(err)
        // })
      }).catch((err) => {
        console.log(err)
      })
    })

    this.device.on(WebrtcEvents.CANCEL, (call) => { // When originator cancels a call
      console.log('Call invite canceled', call)
      this.setDialerCurrentStatus('INVITE_CANCELLED')
      this.backToDial()
      // if (this.$route.name === 'Incoming Call') {
      //   this.$router.push({ name: 'Dial' }).catch(err => {
      //     console.log(err)
      //   })
      // }
      if (this.callNotification) {
        this.callNotification()
      }
    })

    this.device.on(WebrtcEvents.CONNECT, (call) => { // On accept call
      console.log('Successfully connected call', call)
      let map = call._connection.customParameters
      let customParameters = {}
      map.forEach((value, key) => {
        customParameters[key] = value
      })
      this.setDialerCall({
        from: call.from,
        to: call.to,
        callSid: call.callSid,
        state: call.state,
        isMuted: call.isMuted,
        customParameters: customParameters,
        direction: call._connection._direction
      })
      this.getCommunication(this.dialer.call.callSid, this.dialer.currentNumber).finally(() => {
        // this.$router.push({ name: 'Call' }).catch(err => {
        //   console.log(err)
        // })
        setTimeout(() => {
          this.startCallTimer()
          this.setDialerCurrentStatus('CALL_CONNECTED')
        }, 3000)
      }).catch((err) => {
        console.log(err)
      })
      if (this.callNotification) {
        this.callNotification()
      }
    })

    this.device.on(WebrtcEvents.DISCONNECT, (call) => { // On hangup
      console.log('Call ended', call, this.dialer.parkedCall, this.dialer.call)
      this.stopCallTimer()
      this.setDialerCurrentStatus('CALL_DISCONNECTED')
      if (!this.dialer.parkedCall && !this.dialer.call) {
        this.startWrapUpTimer()
      } else if (this.dialer.parkedCall && this.dialer.call) {
        this.startWrapUpTimer()
      } else {
        this.backToDial()
      }
    })

    this.getDesktopToken()

    // ping getDesktopToken every 24 hours
    this.$options.webrtcTokenRegenerateInterval = setInterval(() => {
      if (this.authenticated) {
        this.getDesktopToken()
      }
    }, 24 * 60 * 60 * 1000)

    this.$VueEvent.listen('endWrapUp', () => {
      if (this.dialer.currentStatus !== 'WRAP_UP') {
        return
      }
      console.log('Ending wrap up')
      this.backToDial()
    })

    this.$VueEvent.listen('resetCall', () => {
      console.log('Resetting call')
      this.resetCall()
    })

    this.$VueEvent.listen('makeCall', (data) => {
      this.makeCall(data.currentNumber, data.outboundCampaignId, data.contactName, data.companyName, data.contactId)
    })

    this.$VueEvent.listen('hangupCall', () => {
      this.hangupCall()
    })

    this.$VueEvent.listen('answerCall', () => {
      this.answerCall()
    })

    this.$VueEvent.listen('rejectCall', () => {
      this.rejectCall()
    })

    this.$VueEvent.listen('sendDigit', (data) => {
      this.sendDigit(data)
    })

    this.$VueEvent.listen('toggleMute', () => {
      this.toggleMute()
    })

    this.$VueEvent.listen('toggleHold', () => {
      this.toggleHold()
    })

    this.$VueEvent.listen('toggleRecordingStatus', () => {
      this.toggleRecordingStatus()
    })

    this.$VueEvent.listen('forceRefreshCommunication', () => {
      this.forceRefreshCommunication()
    })

    this.$VueEvent.listen('parkCall', () => {
      this.parkCall()
    })

    this.$VueEvent.listen('unparkCall', () => {
      this.unparkCall()
    })

    this.$VueEvent.listen('mergeCalls', () => {
      this.mergeCalls()
    })

    this.$VueEvent.listen('dropThirdParty', () => {
      this.dropThirdParty()
    })

    this.$VueEvent.listen('setInputDevice', (inputDevice) => {
      this.setInputDevice(inputDevice)
    })

    this.$VueEvent.listen('setOutputDevice', (outputDevice) => {
      this.setOutputDevice(outputDevice)
    })

    this.$VueEvent.listen('testOutputDevice', (outputDevice) => {
      this.testOutputDevice(outputDevice)
    })

    this.$VueEvent.listen('initializeSettings', () => {
      this.initializeSettings()
    })
  },

  methods: {
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
          phone_number: from
        }
      }).then(res => {
        if (this.dialer.communication && !force) {
          return Promise.resolve()
        }
        this.setDialerCommunication(res.data)
        if (this.dialer.communication.contact) {
          this.setDialerContact(this.dialer.communication.contact)
        }
        this.setDialerCurrentNumber(this.$options.filters.fixPhone(this.dialer.communication.lead_number, 'E164'))
        this.$VueEvent.fire('communicationLoaded')
        this.loadingCommunication = false
        return Promise.resolve(res)
      }).catch(err => {
        getCommunicationTry++
        // error
        console.log('An error occurred while getting the communication', err)
        // check if we have found the communication after 3 retries
        if (getCommunicationTry > 10) {
          this.setDialerCommunication()
          this.setDialerContact()
          this.setDialerDeal()
          this.$VueEvent.fire('communicationLoaded')
          this.loadingCommunication = false

          return Promise.reject(err)
        } else {
          return this.getCommunication(sid, from, getCommunicationTry)
        }
      })
    },

    getDesktopToken () {
      console.log('Generating desktop token')

      this.setDialerCurrentStatus('GENERATING_TOKEN')

      return this.$axios.post('/api/v1/dialer/new-mobile-token').then(res => {
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
        this.device.setup(this.dialer.token, {
          edge: ['ashburn', 'roaming'],
          codecPreferences: ['opus', 'pcmu'],
          enableIceRestart: true
        })

        return Promise.resolve(res)
      }).catch(err => {
        this.loading = false
        console.log(err)
        return Promise.reject(err)
      })
    },

    makeCall (currentNumber, outboundCampaignId, contactName = '', companyName = '', contactId = null) {
      console.log(currentNumber, outboundCampaignId, contactName, companyName, contactId, this.dialer.isReady, this.dialer.call)

      if (!this.dialer.isReady) {
        console.log('Dialer is not ready, rescheduling', currentNumber, outboundCampaignId)
        // dialer is not ready, rescheduling
        setTimeout(() => {
          this.makeCall(currentNumber, outboundCampaignId, contactName, companyName, contactId)
        }, 1000)
      }

      if (this.dialer.call || !currentNumber || !outboundCampaignId) {
        return
      }

      let params = {
        'To': this.$options.filters.fixPhone(currentNumber, 'E164'),
        'CampaignId': outboundCampaignId ? outboundCampaignId.toString() : '',
        'UserId': this.profile ? this.profile.id.toString() : '',
        'ContactName': contactName ? contactName.toString() : 'No Name',
        'CompanyName': companyName ? companyName.toString() : '',
        'ContactId': contactId ? contactId.toString() : ''
      }

      console.log('Making call', params)

      this.setDialerCurrentStatus('MAKING_CALL')
      this.setDialerCurrentNumber(params['To'])

      this.connection = this.device.connect(params, true)
      this.initConnectionEvents()
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
    },

    hangupCall () {
      if (!this.dialer.call) {
        return
      }

      console.log('Hanging up call')

      this.setDialerCurrentStatus('HANGING_UP_CALL')

      if (this.device.activeConnection()) {
        // hangup an incoming call
        this.device.activeConnection().hangup()
      }

      // this.resetCall()
    },

    sendDigit (digit) {
      if (!this.dialer.call) {
        return
      }

      if (digit === 'DEL') {
        return
      }

      console.log('Sending digit to call: ' + digit)

      if (this.device.activeConnection()) {
        this.device.activeConnection().sendDigits(digit)
      }
    },

    answerCall () {
      if (!this.dialer.call) {
        return
      }

      console.log('Answering call')

      this.setDialerCurrentStatus('ANSWERING_CALL')

      if (this.device.activeConnection()) {
        // accept the incoming connection and start two-way audio
        this.device.activeConnection().accept()
      }
    },

    rejectCall () {
      if (!this.dialer.call) {
        return
      }

      console.log('Rejecting call')

      this.setDialerCurrentStatus('REJECTING_CALL')

      if (this.device.activeConnection()) {
        // rejecting an incoming call
        this.device.activeConnection().reject()
      }

      // set agent status to busy if it's an answer by browser/apps user
      // @custom for HutchBug, Cardone Capital: rejecting a call should still keep the agent on the previous status
      if (this.currentCompany && ![379, 892].includes(this.currentCompany.id)) {
        this.changeAgentStatus(AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS)
      }

      this.resetCall()
    },

    toggleMute () {
      if (!this.dialer.call || !['connected', 'open'].includes(this.dialer.call.state)) {
        return
      }

      if (!this.dialer.isMuted) {
        console.log('Muting call')
        if (this.device.activeConnection()) {
          this.device.activeConnection().mute(true)
        }
        this.setDialerIsMuted(true)
      } else {
        console.log('Unmuting call')
        if (this.device.activeConnection()) {
          this.device.activeConnection().mute(false)
        }
        this.setDialerIsMuted(false)
      }
    },

    toggleHold () {
      if (!this.dialer.call || !['connected', 'open'].includes(this.dialer.call.state)) {
        return
      }

      if (!this.dialer.isHeld) {
        console.log('Holding call')
        this.setDialerIsHeld(true)
      } else {
        console.log('Unholding call')
        this.setDialerIsHeld(false)
      }
    },

    toggleRecordingStatus () {
      if (!this.dialer.call || !this.dialer.communication || !['connected', 'open'].includes(this.dialer.call.state)) {
        return
      }

      const newStatus = (this.dialer.recordingStatus === 'in-progress') ? 'paused' : 'in-progress'

      if (newStatus === 'paused') {
        console.log('Pausing recording')
      }

      if (newStatus === 'in-progress') {
        console.log('Starting recording')
      }

      this.loadingToggleRecordingStatus = true
      this.$axios.post('/api/v1/communication/' + this.dialer.communication.id + '/toggle-recording-status', {
        status: newStatus
      }).then((res) => {
        this.loadingToggleRecordingStatus = false
        if (res.data.result) {
          this.setDialerRecordingStatus(newStatus)
          if (newStatus === 'paused') {
            console.log('Recording paused')
          }

          if (newStatus === 'in-progress') {
            console.log('Recording started')
          }
        } else {
          // alert didn't change
          if (newStatus === 'paused') {
            console.log('Failed to pause recording')
          }

          if (newStatus === 'in-progress') {
            console.log('Failed to start recording')
          }
        }
      }).catch(err => {
        if (newStatus === 'paused') {
          console.log('Failed to pause recording')
        }

        if (newStatus === 'in-progress') {
          console.log('Failed to start recording')
        }
        this.loadingToggleRecordingStatus = false
        console.log(err)
      })
    },

    parkCall () {
      if (!this.dialer.communication) {
        return
      }
      if (this.dialer.parkedCall) {
        return
      }
      this.loadingPark = true
      this.setDialerParkedCall(this.dialer.communication)
      let params = {
        communication_id: this.dialer.communication.id
      }
      this.$axios.post('/api/v1/dialer/hold', params).then(() => {
        console.log('Call parked')
      }).catch(err => {
        this.setDialerParkedCall()
        console.log(err)
      }).finally(_ => {
        this.loadingPark = false
      })
    },

    unparkCall () {
      if (!this.dialer.parkedCall) {
        return
      }

      this.loadingUnpark = true
      const parkedCall = this.dialer.parkedCall
      this.setDialerParkedCall()
      let data = {
        currentNumber: 'unhold:' + parkedCall.id,
        outboundCampaignId: parkedCall.campaign_id,
        contactName: (parkedCall.contact) ? parkedCall.contact.name : '',
        companyName: (parkedCall.contact) ? parkedCall.contact.company_name : '',
        contactId: parkedCall.contact_id
      }
      this.makeCall(data.currentNumber, data.outboundCampaignId, data.contactName, data.companyName, data.contactId)
      this.loadingUnpark = false
      console.log('Unhold is in progress.')
    },

    mergeCalls () {
      if (!this.dialer.communication) {
        return
      }
      this.loadingMerge = true
      let params = {
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
      if (!this.dialer.communication) {
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

    resetCall () {
      this.stopCallTimer()
      this.stopWrapUpTimer()
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
      if (this.callNotification) {
        this.callNotification()
      }
    },

    countCallDuration () {
      let duration = this.dialer.duration + 1
      let timer = this.secondsToHms(duration)
      this.setDialerDuration(duration)
      this.setDialerTimer(timer)
    },

    countWrapUpDuration () {
      let duration = this.dialer.wrapUpDuration - 1
      let timer = this.secondsToHms(duration)
      this.setDialerWrapUpDuration(duration)
      this.setDialerWrapUpTimer(timer)
      if (duration <= 0) {
        this.stopWrapUpTimer()
        this.backToDial()
      }
    },

    secondsToHms (d) {
      d = Number(d)
      let h = Math.floor(d / 3600)
      let m = Math.floor(d % 3600 / 60)
      let s = Math.floor(d % 3600 % 60)
      return ((h > 0 ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (s < 10 ? '0' : '') + s)
    },

    startCallTimer () {
      let timer = this.secondsToHms(0)
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
      let wrapUpTimer = this.currentCompany.force_wrap_up ? this.currentCompany.wrap_up_seconds : this.profile.wrap_up_seconds
      console.log('Wrap-up time: ' + wrapUpTimer)
      if (wrapUpTimer < 0) {
        this.backToDial()
        return
      }
      this.changeAgentStatus(AgentStatus.AGENT_STATUS_ON_WRAP_UP)
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

    backToDial () {
      this.resetAgentStatus()
      this.resetCall()
    },

    playDispositionNotification () {
      if (this.$q.platform.is.electron) {
        let myMedia = new window.Media(process.env.API_URL + '/static/ivr/default-communication-notification.wav', () => {
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
      let inputDevices = []
      if (!this.device) {
        return inputDevices
      }

      let devices = this.device.availableInputDevices()
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
      let outputDevices = []
      if (!this.device) {
        return outputDevices
      }

      let devices = this.device.availableOutputDevices()
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

    closeNotification (communication) {
      if (communication && this.$q.platform.is.electron) {
        window.Push.close('communication-notification-' + communication.id)
      }
    },

    bounceDock () {
      if (this.$q.platform.is.electron) {
        this.$q.electron.ipcRenderer.send('bounce', 'critical')
      }
    },

    handleError (error) {
      this.setDialerCurrentStatus('GOT_ERROR')
      let err = new Error(error.message + ' Code: ' + error.code)
      err.code = error.code
      // 31005 => WebSocket connection to Twilio's signaling servers were unexpectedly ended. If this is happening consistently,
      // there may be an issue resolving the hostname provided. If a region is being specified in Device setup, ensure it's a valid region.
      // 31009 => No transport available to send or receive messages.
      // 31201 => Generic unknown error.
      // 31204 => Invalid JWT token.
      // 31205 => JWT token expired.
      if (![31005, 31009, 31201, 31204, 31205].includes(err.code)) {
        this.$Sentry.captureException(err)
      }
      console.log(error)
      this.setDialerIsReady(false)
    },

    rebootPhone (login = false) {
      this.backToDial()
      if (login) {
        this.setDialerCurrentStatus('RESTARTING')
        this.getDesktopToken()
      } else {
        this.setDialerIsReady(true)
        this.setDialerCurrentStatus('READY')
      }
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
      'setOldAgentStatus',
      'setWarnings',
      'setShouldIntroduce',
      'setAddedParty',
      'setCurrentInputDevice',
      'setInputDevices',
      'setCurrentOutputDevice',
      'setOutputDevices'
    ])
  },

  beforeDestroy () {
    this.$VueEvent.stop('update_communication')
    this.$VueEvent.stop('endWrapUp')
    this.$VueEvent.stop('resetCall')
    this.$VueEvent.stop('makeCall')
    this.$VueEvent.stop('hangupCall')
    this.$VueEvent.stop('answerCall')
    this.$VueEvent.stop('rejectCall')
    this.$VueEvent.stop('sendDigit')
    this.$VueEvent.stop('toggleMute')
    this.$VueEvent.stop('toggleHold')
    this.$VueEvent.stop('toggleRecordingStatus')
    this.$VueEvent.stop('forceRefreshCommunication')
    this.$VueEvent.stop('setInputDevice')
    this.$VueEvent.stop('setOutputDevice')
    this.$VueEvent.stop('testOutputDevice')
    this.$VueEvent.stop('initializeSettings')
    clearInterval(this.$options.callDurationInterval)
  }
}
</script>
