<template>
  <div></div>
</template>

<script>
import TwilioDevice from './communication/twilio/device'
import auth from '../boot/auth'
import _ from 'lodash'
import { mapState, mapActions, mapGetters } from 'vuex'
import { aclMixin, agentMixin } from '../boot/mixins'
import * as WebrtcEvents from '../constants/webrtc-events'
import * as AgentStatus from '../constants/agent-status'
import * as CommunicationDispositionStatus from '../constants/communication-disposition-status'

export default {
  name: 'Dialer',

  mixins: [aclMixin, agentMixin],

  data () {
    return {
      auth: auth,
      loadingCommunication: false,
      callNotification: null,
      desktopNotification: null,
      device: new TwilioDevice(),
      inputDevices: [],
      inputDevice: 'default',
      outputDevices: [],
      outputDevice: 'default',
      connection: null,
      warnings: [],
      AgentStatus,
      WebrtcEvents,
      CommunicationDispositionStatus
    }
  },

  computed: {
    ...mapState(['dialer', 'current_company']),
    ...mapGetters('auth', ['user'])
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
      if (this.dialer.onHoldCall && this.dialer.onHoldCall.id === data.id) {
        if (data.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          data = _.merge(this.dialer.onHoldCall, data)
          this.setDialerOnHoldCall(data)
        } else {
          this.setDialerOnHoldCall()
        }
      }
    })

    // for mobile
    if (this.$q.platform.is.cordova) {
      // Handle Initialization
      window.Twilio.TwilioVoiceClient.clientinitialized(() => {
        console.log('Ready to start')
        this.setDialerIsReady(true)
        this.setDialerCurrentStatus('READY')
      })

      // Handle Errors
      window.Twilio.TwilioVoiceClient.error((err) => {
        console.log('Error', err)
        this.setDialerCurrentStatus('GOT_ERROR')
        this.resetAgentStatus()
        this.resetCall()
      })

      // Handle Call Connection
      window.Twilio.TwilioVoiceClient.calldidconnect((call) => {
        console.log('Successfully connected call', call)
        this.setDialerCall(call)
        this.startCallTimer()
        this.getCommunication(this.dialer.call.callSid, this.dialer.currentNumber).finally(() => {
          this.$router.push({ name: 'Call' }).catch(err => {
            console.log(err)
          })
        }).catch((err) => {
          console.log(err)
        })
        this.setDialerCurrentStatus('CALL_CONNECTED')
        if (this.callNotification) {
          this.callNotification()
        }
      })

      // Handle Call Disconnect
      window.Twilio.TwilioVoiceClient.calldiddisconnect(() => {
        console.log('Call ended')
        setTimeout(() => {
          this.playDispositionNotification()
        }, 500)
        this.stopCallTimer()
        this.setDialerCurrentStatus('CALL_DISCONNECTED')
        if (!this.dialer.onHoldCall) {
          this.startWrapUpTimer()
        } else {
          this.backToDial()
        }
      })

      window.Twilio.TwilioVoiceClient.callinvitereceived((call) => {
        console.log('Received call invite', call)
        this.setDialerCall(call)
        this.setDialerCurrentNumber(this.$options.filters.fixPhone(this.dialer.call.from, 'E164'))
        this.setDialerCurrentStatus('RECEIVED_CALL_INVITE')
        console.log('call information', this.dialer.call.callSid, this.dialer.call.from, this.dialer.currentNumber)
        this.getCommunication(this.dialer.call.callSid, this.dialer.currentNumber).finally(() => {
          let message = '<div class="no-select">'
          if (this.dialer.communication && this.dialer.communication.campaign) {
            message += '<p class="has-margin-bottom-5 has-text-link has-text-weight-medium">' + this.dialer.communication.campaign.name + '</p>'
          }
          if (this.dialer.contact) {
            message += '<small><b>' + this.$options.filters.fixName(this.$options.filters.truncate(this.dialer.contact.name, 15)) + '</b></small>'
          }
          if (this.dialer.currentNumber) {
            message += '<p class="has-margin-top-5">' + this.$options.filters.fixPhone(this.dialer.currentNumber) + '</p>'
          } else if (this.dialer.call) {
            message += '<p class="has-margin-top-5">' + this.$options.filters.fixPhone(this.dialer.call.from) + '</p>'
          }
          message += '</div>'
          if (this.$q.platform.is.android) {
            this.callNotification = this.$q.notify({
              timeout: 0,
              message: message,
              html: true,
              actions: [
                {
                  label: 'Answer',
                  color: 'success',
                  handler: () => {
                    this.callNotification()
                    this.answerCall()
                  }
                },
                {
                  label: 'Reject',
                  color: 'danger',
                  handler: () => {
                    this.callNotification()
                    this.rejectCall()
                  }
                }
              ]
            })
          }
        }).catch((err) => {
          console.log(err)
        })
      })

      window.Twilio.TwilioVoiceClient.callinvitecanceled(() => {
        console.log('Call invite canceled')
        this.setDialerCurrentStatus('INVITE_CANCELLED')
        this.resetAgentStatus()
        this.resetCall()
      })

      this.getMobileToken()

      // ping getMobileToken every 24 hours
      this.$options.mobileTokenRegenerateInterval = setInterval(() => {
        if (this.user.authenticated) {
          this.getMobileToken()
        }
      }, 24 * 60 * 60 * 1000)
    }

    // for desktop
    if (!this.$q.platform.is.cordova) {
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
            textColor: 'white',
            message: 'Whoops! You have lost connection with the server. Check your internet connection and try again.'
          })
          this.setDialerIsReady(false)
          this.setDialerCurrentStatus('OFFLINE')
        }
      })

      this.device.on(WebrtcEvents.ERROR, (error) => {
        // if this error is a token error re-establish it
        if (error.tokenError() || error.code === 'Canceled') {
          this.handleError(error)
          if ([31205, 31204].includes(error.code)) {
            this.rebootPhone(true)
          } else {
            this.rebootPhone()
          }
        } else {
          // non token related errors (non trivial errors)
          // this.changePhoneStatus('Error (' + error.code + ')')
          this.handleError(error)
          if ([31201].includes(error.code)) {
            setTimeout(() => {
              this.rebootPhone()
            }, 5000)
          }
        }
      })

      this.device.on(WebrtcEvents.INCOMING, (call) => {
        console.log('Received call invite', call)
        this.setDialerCall({
          from: call.from,
          to: call.to,
          callSid: call.callSid,
          state: call.state,
          isMuted: call.isMuted
        })
        this.setDialerCurrentNumber(this.$options.filters.fixPhone(this.dialer.call.from, 'E164'))
        this.setDialerCurrentStatus('RECEIVED_CALL_INVITE')
        console.log('call information', this.dialer.call.callSid, this.dialer.call.from, this.dialer.currentNumber)

        // restore app when a call comes
        if (this.$q.platform.is.electron) {
          this.$q.electron.ipcRenderer.send('restore_app')
        }

        this.getCommunication(this.dialer.call.callSid, this.dialer.call.from).finally(() => {
          this.$router.push({ name: 'Incoming Call' }).catch(err => {
            console.log(err)
          })
        }).catch((err) => {
          console.log(err)
        })
      })

      this.device.on(WebrtcEvents.CANCEL, (call) => { // When originator cancels a call
        console.log('Call invite canceled', call)
        this.setDialerCurrentStatus('INVITE_CANCELLED')
        this.resetAgentStatus()
        this.resetCall()
        if (this.$route.name === 'Incoming Call') {
          this.$router.push({ name: 'Dial' }).catch(err => {
            console.log(err)
          })
        }
        if (this.callNotification) {
          this.callNotification()
        }
      })

      this.device.on(WebrtcEvents.CONNECT, (call) => { // On accept call
        console.log('Successfully connected call', call)
        this.setDialerCall(call)
        this.startCallTimer()
        this.getCommunication(this.dialer.call.callSid, this.dialer.currentNumber).finally(() => {
          if (this.$q.platform.is.electron) {
            this.$router.push({ name: 'Call' }).catch(err => {
              console.log(err)
            })
          } else {
            if ((this.$route.name === 'Contact' && parseInt(this.$route.params.contactId) !== parseInt(this.dialer.contact.id)) || this.$route.name !== 'Contact') {
              this.$router.push({ name: 'Contact', params: { contactObj: this.dialer.contact, contactId: this.dialer.contact.id } }).catch(err => {
                console.log(err)
              })
            }
          }
        }).catch((err) => {
          console.log(err)
        })
        this.setDialerCurrentStatus('CALL_CONNECTED')
        if (this.callNotification) {
          this.callNotification()
        }
      })

      this.device.on(WebrtcEvents.DISCONNECT, (call) => { // On hangup
        console.log('Call ended')
        this.stopCallTimer()
        this.setDialerCurrentStatus('CALL_DISCONNECTED')
        if (!this.dialer.onHoldCall) {
          this.startWrapUpTimer()
        } else {
          this.backToDial()
        }
      })

      this.getDesktopToken()

      // ping getMobileToken every 24 hours
      this.$options.webrtcTokenRegenerateInterval = setInterval(() => {
        if (this.user.authenticated) {
          this.getDesktopToken()
        }
      }, 24 * 60 * 60 * 1000)
    }

    this.$VueEvent.listen('endWrapUp', () => {
      if (this.dialer.currentStatus !== 'CALL_DISCONNECTED') {
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
      this.makeCall(data.currentNumber, data.outboundCampaignId)
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
      this.sendDigit(data.digit)
    })

    this.$VueEvent.listen('toggleSpeaker', () => {
      this.toggleSpeaker()
    })

    this.$VueEvent.listen('toggleMute', () => {
      this.toggleMute()
    })

    this.$VueEvent.listen('forceRefreshCommunication', () => {
      this.forceRefreshCommunication()
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

    getMobileToken () {
      console.log('Generating mobile token')

      this.setDialerCurrentStatus('GENERATING_TOKEN')

      return this.$axios.post('/api/v1/dialer/new-mobile-token', {
        is_android: this.$q.platform.is.android,
        is_ios: this.$q.platform.is.ios
      }).then(res => {
        this.loading = false
        this.setDialerToken(res.data)
        this.setDialerCurrentStatus('TOKEN_GENERATED')
        console.log('Twilio token', this.dialer.token)
        // initialize twilio voice client
        window.Twilio.TwilioVoiceClient.initialize(this.dialer.token)

        return Promise.resolve(res)
      }).catch(err => {
        this.loading = false
        console.log(err)
        return Promise.reject(err)
      })
    },

    makeCall (currentNumber, outboundCampaignId) {
      console.log(currentNumber, outboundCampaignId, this.dialer.isReady, this.dialer.call)

      if (!this.dialer.isReady) {
        console.log('Dialer is not ready, rescheduling', currentNumber, outboundCampaignId)
        // dialer is not ready, rescheduling
        setTimeout(() => {
          this.makeCall(currentNumber, outboundCampaignId)
        }, 1000)
      }

      if (this.dialer.call || !currentNumber || !outboundCampaignId) {
        return
      }

      let params = {
        'To': this.$options.filters.fixPhone(currentNumber, 'E164'),
        'CampaignId': outboundCampaignId.toString(),
        'UserId': this.user.profile.id.toString()
      }

      console.log('Making call', params)

      this.setDialerCurrentStatus('MAKING_CALL')
      this.setDialerCurrentNumber(params['To'])

      if (this.$q.platform.is.cordova) {
        window.Twilio.TwilioVoiceClient.call(this.dialer.token, params)
      } else {
        this.connection = this.device.connect(params, true)
        this.initConnectionEvents()
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
    },

    hangupCall () {
      if (!this.dialer.call) {
        return
      }

      console.log('Hanging up call')

      this.setDialerCurrentStatus('HANGING_UP_CALL')

      if (this.$q.platform.is.cordova) {
        window.Twilio.TwilioVoiceClient.disconnect()
      } else {
        if (this.device.activeConnection()) {
          // hangup an incoming call
          this.device.activeConnection().hangup()
        }
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

      if (this.$q.platform.is.cordova) {
        window.Twilio.TwilioVoiceClient.sendDigits(digit)
      } else {
        if (this.device.activeConnection()) {
          this.device.activeConnection().sendDigits(digit)
        }
      }
    },

    answerCall () {
      if (!this.dialer.call) {
        return
      }

      console.log('Answering call')

      this.setDialerCurrentStatus('ANSWERING_CALL')

      if (this.$q.platform.is.cordova) {
        window.Twilio.TwilioVoiceClient.acceptCallInvite()
      } else {
        if (this.device.activeConnection()) {
          // accept the incoming connection and start two-way audio
          this.device.activeConnection().accept()
        }
      }
    },

    rejectCall () {
      if (!this.dialer.call) {
        return
      }

      console.log('Rejecting call')

      this.setDialerCurrentStatus('REJECTING_CALL')

      if (this.$q.platform.is.cordova) {
        window.Twilio.TwilioVoiceClient.rejectCallInvite()
      } else {
        if (this.device.activeConnection()) {
          // rejecting an incoming call
          this.device.activeConnection().reject()
        }
      }

      this.changeAgentStatus(AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS)

      this.resetCall()
    },

    toggleSpeaker () {
      if (!this.dialer.call) {
        return
      }

      if (!this.dialer.onSpeaker) {
        this.turnOnSpeaker()
      } else {
        this.turnOffSpeaker()
      }
    },

    turnOnSpeaker () {
      console.log('Setting speaker to on')
      this.setDialerOnSpeaker(true)
      if (this.$q.platform.is.cordova) {
        window.Twilio.TwilioVoiceClient.setSpeaker('on')
      }
    },

    turnOffSpeaker () {
      console.log('Setting speaker to off')
      this.setDialerOnSpeaker(false)
      if (this.$q.platform.is.cordova) {
        window.Twilio.TwilioVoiceClient.setSpeaker('off')
      }
    },

    toggleMute () {
      if (!this.dialer.call || !['connected', 'open'].includes(this.dialer.call.state)) {
        return
      }

      if (!this.dialer.call.isMuted) {
        console.log('Muting call')
        if (this.$q.platform.is.cordova) {
          window.Twilio.TwilioVoiceClient.muteCall()
        } else {
          if (this.device.activeConnection()) {
            this.device.activeConnection().mute(true)
          }
        }
        this.setDialerIsMuted(true)
      } else {
        console.log('Unmuting call')
        if (this.$q.platform.is.cordova) {
          window.Twilio.TwilioVoiceClient.unmuteCall()
        } else {
          if (this.device.activeConnection()) {
            this.device.activeConnection().mute(false)
          }
        }
        this.setDialerIsMuted(false)
      }
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
      this.turnOffSpeaker()
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
      this.$options.callDurationInterval = setInterval(this.countCallDuration, 1000)
    },

    stopCallTimer () {
      this.setDialerDuration(0)
      this.setDialerTimer('')
      clearInterval(this.$options.callDurationInterval)
    },

    startWrapUpTimer () {
      let wrapUpTimer = this.current_company.force_wrap_up ? this.current_company.wrap_up_seconds : this.user.profile.wrap_up_seconds
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
      if (this.$q.platform.is.cordova || this.$q.platform.is.electron) {
        setTimeout(() => {
          if (this.$route.name === 'Call') {
            this.$router.push({ name: 'Dial' }).catch(err => {
              console.log(err)
            })
          }
        }, 200)
      }
    },

    playDispositionNotification () {
      if (this.$q.platform.is.cordova || this.$q.platform.is.electron) {
        let myMedia = new window.Media(process.env.API_URL + '/static/ivr/default-communication-notification.wav', () => {
        }, (err) => {
          console.log('playAudio():Audio Error: ' + err)
        })
        myMedia.play()
      }
    },

    setInputDevice () {
      this.device.setInputDevice(this.inputDevice).then(() => {
        console.info('Changed input device', this.inputDevice)
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

    setOutputDevice () {
      this.device.setSpeakerDevice(this.outputDevice).then(() => {
        console.info('Changed output device', this.outputDevice)
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

    testOutputDevice () {
      this.device.testSpeakerDevice().then(() => {
        console.info('Tested speaker device', this.outputDevice)
      }).catch(err => {
        console.info('Could not test the speaker device!', err)
      })
    },

    initializeSettings () {
      this.inputDevices = this.getInputDevices()
      this.outputDevices = this.getOutputDevices()
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
      this.resetAgentStatus()
      this.resetCall()
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
      'setDialerOnHoldCall',
      'setDialerIsReady',
      'setDialerCurrentStatus',
      'setDialerCommunication',
      'setDialerDeal',
      'setDialerContact',
      'setDialerCurrentNumber',
      'setDialerOnSpeaker',
      'setDialerIsMuted',
      'setDialerDuration',
      'setDialerTimer',
      'setDialerWrapUpDuration',
      'setDialerWrapUpTimer',
      'setOldAgentStatus',
      'setWarnings',
      'setShouldIntroduce',
      'setAddedParty'
    ])
  },

  beforeDestroy () {
    clearInterval(this.$options.callDurationInterval)
  }
}
</script>
