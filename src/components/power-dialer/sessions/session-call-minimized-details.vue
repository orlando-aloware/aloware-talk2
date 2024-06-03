<template>
  <q-card flat>
    <div class="" >
      <div class="d-flex p-2 flex-wrap justify-content-between align-items-center bg-white border-bottom">

        <div class="font-weight-bold flex-grow-0 session-call-status lex-0 ml-2"
             style="max-width: 176px">
          <q-chip color="grey-50"
                  class="p-0">
            <div :class="`text-15 text-lowercase text-capitalize px-2`"
                 v-html="statusDisplayText">
            </div>
          </q-chip>
        </div>

        <div class="d-flex p-0 flex-grow-1">
          <div class="text-18 font-weight-bold">
            {{ fullName }}
            <span class="text-15 text-subtitle1">
            {{ phoneNumber }}
          </span>
          </div>
        </div>

        <div class="d-flex p-0 flex-grow-1">
          Dispositions
        </div>

        <q-btn class="my-1"
               size="sm"
               unelevated
               no-wrap
               no-caps
               :outline="!sessionPaused"
               :color="pauseButtonColor"
               :disabled="toggleEnd"
               :class="pauseButtonClass"
               @click="onTogglePause">

          <PauseIcon class="mr-2"
                     :color="pauseIconColor"/>

          <div :class="pauseButtonTextClass">
            {{ pauseButtonText }}
          </div>
        </q-btn>

        <q-btn class="my-1 sessions-button free-width ml-1"
               size="sm"
               no-wrap
               outline
               no-caps
               :disable="isEndSessionDisabled"
               :color="endSessionButtonColor"
               :class="endSessionButtonClass"
               @click="onToggleEnd">

          <EndCallIcon class="mr-2"
                       color="#62666E"/>

          <div class="text-body2 text-black">
            {{ endSessionText }}
          </div>
        </q-btn>

        <q-btn class="sessions-button free-width ml-1"
               size="sm"
               color="grey-4"
               outline
               no-wrap
               no-caps
               :disabled="isRecordDisabled"
               @click="onToggleRecording">

          <StopIcon class="mr-2"
                    color="#62666E"
                    v-if="toggleRecording"/>

          <RecordIcon class="mr-2"
                      color="red"
                      v-else/>

          <div class="text-body2 text-black">
            {{ recordText }}
          </div>
        </q-btn>

        <q-btn class="sessions-button my-1 ml-1"
               size="sm"
               style="width: 75.72px;"
               no-wrap
               no-caps
               unelevated
               outline
               :color="!isHoldDisabled ? 'grey-4' : 'grey-8'"
               :disabled="isHoldDisabled"
               @click="onToggleHold">
          <UnHoldIcon class="mr-1"
                      color="#F2997A"
                      v-if="toggleHold"/>
          <PauseIcon class="mr-1"
                     color="#62666E"
                     v-else/>
          <div class="text-body2 text-black">
            {{ holdText }}
          </div>
        </q-btn>

        <q-btn class="sessions-button free-width my-1 ml-1"
               size="sm"
               no-wrap
               unelevated
               no-caps
               :disabled="!canNextTask "
               :color="canNextTask  ? 'red-7' : 'grey-8'"
               @click="onNextTask(false, true)">
          <CallDropIcon class="mr-1"
                        color="white"/>
          <div class="text-body2">Next</div>
        </q-btn>
      </div>

      <div class="d-flex align-items-center p-0 justify-content-between flex-wrap px-3">
        <div class="flex-grow-1 text-14 text-subtitle1 text-capitalize py-0 m-1"
             v-if="timezone">
          <DropIcon width="18px"
                    height="18px"
                    class="mr-0 py-0"
                    style="position:relative;top:-2px;"/>
          {{ timezone }} - {{ getTimeZone }}
        </div>
      </div>
    </div>

    <q-dialog persistent
              v-model="reRouteModal">
      <q-card class="px-4">
        <q-card-section>
          <div class="text-h6"/>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <p v-if="!hasQueuedTaskLists">
            No remaining tasks found...
          </p>
          <p>
            You will be redirected to PowerDialer <strong>{{ selectedList.name }}</strong> list. Please wait...
          </p>
        </q-card-section>

        <q-card-actions align="right">
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-card>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import DropIcon from 'components/icons/drop-location-icon'
import PauseIcon from 'components/icons/pause-icon-2'
import UnHoldIcon from 'components/icons/pause-icon-3'
import CallDropIcon from 'components/icons/call-drop-icon'
import StopIcon from 'components/icons/stop-icon'
import EndCallIcon from 'components/icons/stop-icon-2'
import RecordIcon from 'components/icons/record-icon'
import * as AutoDialTaskStatus from 'src/constants/power-dialer/task-status'
import * as UserOutboundCallingModes from 'src/constants/user-outbound-calling-modes'
import * as OutboundCallRecordingModes from 'src/constants/outbound-call-recording-modes'
import {
  sessionCallStatusMixin,
  dialerWrapUpMixin, aclMixin
} from 'src/plugins/mixins'
import { isEmpty, cloneDeep, get, debounce } from 'lodash'
import moment from 'moment-timezone'
import * as CommunicationStatus from 'src/constants/communication-status'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'

export default {
  name: 'SessionCallMinimizedDetails',

  components: {
    DropIcon,
    PauseIcon,
    UnHoldIcon,
    CallDropIcon,
    StopIcon,
    EndCallIcon,
    RecordIcon
  },

  mixins: [
    aclMixin,
    sessionCallStatusMixin,
    dialerWrapUpMixin
  ],

  data () {
    return {
      prevRoute: null,
      shouldRedirect: false,
      loading: false,
      autoDialer: {
        outbound_campaign_id: null,
        ratio: 1
      },
      redirectDelay: 3000,
      redirectNotification: false,
      hangUpInterval: null,
      hangUpIntervalCounter: 0,
      loadingHold: false,
      loadingUnhold: false,
      isRedialClicked: false,
      isProcessingDNC: false,
      redialedTask: {}
    }
  },

  computed: {
    ...mapFields([
      'sessionPhoneExpansion'
    ]),

    ...mapFields('powerDialer', [
      'countdownTimer',
      'sessionPaused',
      'activeTask',
      'hubspot'
    ]),

    ...mapState([
      'campaigns'
    ]),

    ...mapState('cache', [
      'currentCompany'
    ]),

    ...mapState('auth', [
      'profile'
    ]),

    ...mapGetters('contacts', [
      'contact',
      'listItems',
      'selectedList'
    ]),

    forcedWrapUpAccount () {
      return this.profile.company.force_wrap_up
    },

    wrapUpSeconds () {
      if (this.forcedWrapUpAccount) {
        return this.profile.company.wrap_up_seconds
      }

      return this.profile.wrap_up_seconds
    },

    currentSessionStatus () {
      return this.dialer?.currentStatus || ''
    },

    address () {
      if (isEmpty(this.taskToCall)) {
        return 'N/A'
      }

      if (this.taskToCall?.cnam_city &&
        !this.taskToCall?.cnam_state) {
        return this.taskToCall?.cnam_city || ''
      }

      if (!this.taskToCall?.cnam_city &&
        this.taskToCall?.cnam_state) {
        return this.taskToCall?.cnam_state || ''
      }

      const cityName = this.taskToCall?.cnam_city || ''
      const stateName = this.taskToCall?.cnam_state || ''

      return `${cityName} ${stateName}`
    },

    companyName () {
      return this.taskToCall?.company_name || 'Company: N/A'
    },

    toggleRecording () {
      if (this.dialer.recordingStatus === 'in-progress' &&
        this.dialer.communication &&
        this.dialer.communication.should_record === true) {
        return true
      }

      if (this.dialer.recordingStatus === 'paused' &&
        this.dialer.communication &&
        this.dialer.communication.should_record === true) {
        return false
      }

      return false
    },

    toggleHold: {
      get () {
        return this.sessionCallStatuses.hold
      },

      set (val) {
        this.sessionCallStatuses.hold = val
      }
    },

    status () {
      return AutoDialTaskStatus.STATUSES
    },

    timezone () {
      return this.taskToCall?.timezone
    },

    getTimeZone () {
      const timezone = this.taskToCall?.timezone
      return moment.tz(moment.tz(timezone).format('HH:mm:ss'), 'HH:mm:ss', timezone).format('hh:mm A')
    },

    statusCallConnected () {
      return this.dialer.currentStatus === 'CALL_CONNECTED'
    },

    isRecordDisabled () {
      return this.statusCallConnected ||
        this.profile.outbound_call_recording_mode === OutboundCallRecordingModes.OUTBOUND_CALL_RECORDING_MODE_NEVER ||
        (this.profile.company.force_outbound_recording && this.profile.company.outbound_call_recording_mode === OutboundCallRecordingModes.OUTBOUND_CALL_RECORDING_MODE_NEVER)
    },

    isCallCompleted () {
      const dispositionNotInprogress = this.dialer.communication &&
        this.dialer.communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW
      const disconnectedCallStatuses = ['HANGING_UP_CALL', 'CALL_DISCONNECTED', 'WRAP_UP']

      return dispositionNotInprogress || disconnectedCallStatuses.includes(this.dialer.currentStatus)
    },

    isHoldDisabled () {
      const inprogressStatuses = [
        CommunicationStatus.STATUS_INPROGRESS_NEW,
        CommunicationStatus.STATUS_RINGING_NEW
      ]
      const conferencingDisabled = this.currentCompany &&
        !this.currentCompany.conferencing_enabled
      const inprogressCommunication = this.dialer.communication?.legc_uuid &&
        inprogressStatuses.includes(this.dialer.communication?.legc_status)
      const isSameSid = this.dialer.communication?.legz_uuid &&
        this.dialer.call.callSid === this.dialer.communication.legz_uuid

      return !this.dialer.communication ||
        this.loadingHold ||
        this.loadingUnhold ||
        this.isCallCompleted ||
        conferencingDisabled ||
        inprogressCommunication ||
        isSameSid
    },

    statusOnACall () {
      switch (this.dialer.currentStatus) {
        case 'WRAP_UP':
        case 'MAKING_CALL':
        case 'ANSWERING_CALL':
        case 'CALL_CONNECTED':
        case 'HANGING_UP_CALL':
          return true
        default:
          return false
      }
    },

    integrationsHubspot () {
      return this.activeTask?.integrations?.hubspot
    },

    options () {
      return this.$options.auto_dialer_interval
    },

    hasQueuedTaskLists () {
      return this.powerDialerTasks.in_queue.length > 0
    },

    allTasksAreSkipped () {
      if (this.powerDialerTasks.in_queue.length > 0) {
        return this.skippedTasks.length === this.powerDialerTasks.in_queue.length
      }

      return false
    },

    canNextTask () {
      // should be able to next task even if wrap-up is not paused and
      // status is on warm up period and no manual skip (clicked next task) is in-progress
      const canNextStatuses = ['WRAP_UP', 'READY']
      const canNext = this.statusCallConnected ||
        canNextStatuses.includes(this.dialer.currentStatus)

      return !this.wrapUpPaused && !this.loadingNext && canNext
    },

    canRedialLater () {
      return this.canRedialNow &&
        this.powerDialerTasks.in_queue.length >= 1
    },

    canRedialNow () {
      return this.dialer.currentStatus === 'CALL_CONNECTED' &&
        !this.redialed.includes(this.activeTask.id) &&
        !this.isRedialClicked
    },

    pauseButtonText () {
      if (this.togglePause) {
        return 'Unpause Session'
      }

      if (this.togglePause && this.sessionPaused) {
        return 'Resume Session'
      }

      return 'Pause Session'
    },

    holdText () {
      return this.toggleHold ? 'Unhold' : 'Hold'
    },

    recordText () {
      return this.toggleRecording ? 'Stop Rec.' : 'Record'
    },

    pauseButtonColor () {
      const sessionPausedClass = this.sessionPaused ? 'primary' : 'red-3'

      return this.togglePause ? sessionPausedClass : 'grey-4'
    },

    pauseButtonClass () {
      const sessionPausedClass = this.sessionPaused ? 'btn-btn-primary' : 'bg-btn-red'
      const pauseClass = this.togglePause ? sessionPausedClass : ''

      return [
        pauseClass,
        'sessions-button',
        'free-width',
        'mx-1'
      ]
    },

    pauseIconColor () {
      return this.sessionPaused ? '#fff' : '#62666E'
    },

    pauseButtonTextClass () {
      const textClass = this.sessionPaused ? 'text-white' : 'text-black'

      return [
        'text-body2',
        textClass
      ]
    },

    endSessionText () {
      return this.toggleEnd ? 'Ending Session...' : 'End Session'
    },

    isEndSessionDisabled () {
      return this.toggleEnd || this.wrapUpPaused
    },

    endSessionButtonColor () {
      return this.toggleEnd ? 'red-3' : 'grey-4'
    },

    endSessionButtonClass () {
      const backgroundClass = this.toggleEnd ? 'bg-btn-red' : ''

      return [backgroundClass]
    }
  },

  created () {
    this.ongoingSession.listId = this.$route.params.id
    this.resetSession()

    if (!this.profile.auto_dialer_enabled) {
      this.reRoute()
    }

    if (this.campaigns) {
      this.findDefaultOutboundCampaign()
    }

    this.$VueEvent.listen('initiate_session', this.onInitiateSession)
    this.$VueEvent.listen('initiate_wrapup', this.onInitiateWrapUp)
    this.$VueEvent.listen('initiate_session_no_tasks', this.closePowerDialerNoTasks)
    this.$VueEvent.listen('endWrapUpPDSession', this.onEndWrapUp)
    this.$VueEvent.listen('phoneExpansionReset', this.onPhoneExpansionReset)
    this.$VueEvent.listen('redial_task', this.requeueTask)
    this.$VueEvent.listen('holdFailed', this.onHoldFailed)
    this.$VueEvent.listen('unholdFailed', this.onUnholdFailed)

    this.isSessionRunning = false
  },

  methods: {
    ...mapActions(['setShowPhone']),

    ...mapActions('contacts', [
      'setContactClone'
    ]),

    ...mapActions('powerDialer', [
      'reQueuePowerDialerTask',
      'removeFirstInQueueTask'
    ]),

    processRemoveFirstInQueueTask: debounce(function () {
      this.removeFirstInQueueTask()
    }, 500),

    processHangup () {
      this.$VueEvent.fire('hangupCall')

      if (this.wrapUpSeconds === -1) {
        this.$VueEvent.fire('resetCall')
      }
    },

    findDefaultOutboundCampaign () {
      this.autoDialer.outbound_campaign_id = null

      // Default PowerDialer outbound line
      if (this.currentCompany &&
        this.currentCompany.default_power_dialer_campaign_id) {
        this.autoDialer.outbound_campaign_id = this.currentCompany.default_power_dialer_campaign_id
        return
      }

      // Force outbound line on all users
      if (this.currentCompany &&
        this.currentCompany.default_outbound_campaign_id &&
        this.currentCompany.force_outbound_line) {
        this.autoDialer.outbound_campaign_id = this.currentCompany.default_outbound_campaign_id
        return
      }

      // Outbound line is set to use account default and account has a default
      if (this.currentCompany &&
        this.currentCompany.default_outbound_campaign_id &&
        this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT &&
        !this.profile.default_outbound_campaign_id) {
        this.autoDialer.outbound_campaign_id = this.currentCompany.default_outbound_campaign_id
        return
      }

      // User has a default outbound line
      if (this.profile.default_outbound_campaign_id &&
        this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT) {
        this.autoDialer.outbound_campaign_id = this.profile.default_outbound_campaign_id
        return
      }

      // User has to choose outbound line every time
      if (this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ALWAYS_ASK) {
        this.autoDialer.outbound_campaign_id = null
      }
    },

    startWarmUpCountDown (resetCountdownTimer = false) {
      if (this.countdownStarted || !this.isSessionRunning || this.reRouteModal) {
        return
      }

      this.countdownStarted = true

      if (resetCountdownTimer) {
        this.resetTimer()
      }

      clearInterval(this.countdownInterval)

      const wasInWrapUpStatusAndPaused = this.dialer.currentStatus === 'WRAP_UP' &&
        this.wrapUpPaused

      this.countdownInterval = setInterval(() => {
        // if status in wrap-up and has wrap-up seconds but wrap up is paused due to
        // forced call or contact disposition, we should not continue the countdown
        if (this.wrapUpSeconds !== -1 && this.dialer.currentStatus === 'WRAP_UP' &&
          this.wrapUpPaused) {
          return
        }

        // end countdown if previously in wrap-up status and paused due to forced
        // call and contact disposition and status changed and is no longer in wrap-up
        if (wasInWrapUpStatusAndPaused && this.dialer.currentStatus !== 'WRAP_UP') {
          this.countdownTimer = 0
        }

        // reset next task loading flag
        if (this.loadingNext) {
          this.loadingNext = false
        }

        this.countdownTimer--
        this.onTimerIsOver()
      }, 1000)
    },

    onTimerIsOver () {
      if (this.timerIsOver) {
        this.clearWarmUpCountDown()

        const hasEnded = this.toggleEnd || !this.hasQueuedTaskLists
        const noActiveTask = !this.hasActiveTask || !this.activeTask

        if (hasEnded && noActiveTask) {
          this.reRoute()
          return
        }

        if (!this.togglePause && !this.wrapUp) {
          this.runTask()
        }

        if (this.wrapUp) {
          this.initialize()
        }

        // end wrap-up if wrap-up seconds
        // is not indefinite
        if (this.wrapUp && this.wrapUpSeconds !== 0) {
          this.wrapUp = false
          this.isSessionRunning = false
        }

        if (this.togglePause) {
          this.sessionPaused = true
        }
      }
    },

    resetSession () {
      this.activeTask = {}
      this.taskToCall = {}
      this.hasActiveTask = false
      this.sessionCallStatuses = {
        pause: false,
        end: false,
        recording: false,
        hold: false,
        next: false,
        mute: false
      }
    },

    start () {
      this.resetSession()
      this.initialize()

      // Force pause if session is started after being manually paused (it might happen when internet is restablished)
      if (this.sessionPaused) {
        this.onTogglePause()
      }
    },

    async initialize () {
      if (!this.isSessionRunning) {
        this.TOGGLE_SESSION_LOADER(true)
      }

      if (this.toggleEnd && this.timerIsOver) {
        this.reRoute()
        return
      }

      if (this.allTasksAreSkipped) {
        this.clearWarmUpCountDown()
        this.$emit('on-all-tasks-are-skipped')

        setTimeout(() => {
          this.reRoute()
        }, 1000)
        return
      }

      const task = get(this.powerDialerTasks.in_queue, '0', null)

      // skip assigning the next task if
      // there is still an active task and
      // wrap up seconds is indefinite
      if (!isEmpty(this.activeTask) && this.wrapUpSeconds === 0) {
        return
      }

      // end session if no more active call,
      // no tasks in queue, no active task,
      // and wrap up seconds is not indefinite
      if (!this.statusCallConnected && !this.hasQueuedTaskLists &&
        !task && this.wrapUpSeconds !== 0) {
        this.reRoute()
        return
      }

      // process the next task if no in-progress call
      if (!this.statusOnACall && !this.wrapUp) {
        this.loadingNext = true
        this.taskToCall = cloneDeep(task)

        if (this.taskToCall) {
          this.processRemoveFirstInQueueTask()
        }

        this.activeTask = this.taskToCall
        this.hasActiveTask = true
        this.setContact(this.taskToCall)
        this.TOGGLE_SESSION_LOADER(true)
        this.resetTimer()

        if (!this.isSessionRunning) {
          this.isSessionRunning = true
        }

        setTimeout(() => {
          this.startWarmUpCountDown()
        }, 1000)
      }

      // end power dialer session if:
      // power dialer has no tasks left in queue,
      // countdown timer is 0,
      // and session is still running
      if (!this.hasQueuedTaskLists &&
        !this.statusCallConnected &&
        this.timerIsOver &&
        this.isSessionRunning) {
        this.closePowerDialerNoTasks()
      }

      this.TOGGLE_SESSION_LOADER(false)
    },

    closePowerDialerNoTasks () {
      // continue the session if there is still
      // an active task
      if (this.hasActiveTask) {
        return
      }

      this.reRoute(false)

      if (this.redirectNotification) {
        this.$emit('no-tasks-found')
      }
    },

    onToggleHold () {
      this.toggleHold = !this.toggleHold

      if (this.dialer.isHeld) {
        this.loadingUnhold = true
      } else {
        this.loadingHold = true
      }

      this.$VueEvent.fire('toggleHold')
      this.$options.holdIntervalCount = 0

      this.$options.holdInterval = setInterval(() => {
        if (this.loadingHold && this.dialer.isHeld) {
          this.loadingHold = false
          clearInterval(this.$options.holdInterval)
        }

        if (this.loadingUnhold && !this.dialer.isHeld) {
          this.loadingUnhold = false
          clearInterval(this.$options.holdInterval)
        }

        this.$options.holdIntervalCount++

        if (this.$options.holdIntervalCount >= 120) {
          clearInterval(this.$options.holdInterval)
        }
      }, 500)
    },

    onToggleRecording () {
      this.$VueEvent.fire('toggleRecordingStatus')
    },

    onTogglePause () {
      this.togglePause = !this.togglePause

      if (this.togglePause) {
        this.sessionPaused = true
        return
      }

      this.resetTimer()
      this.sessionPaused = false

      if (this.taskToCall && !this.statusOnACall) {
        setTimeout(() => {
          this.startWarmUpCountDown()
        }, 1000)
      }
    },

    onToggleEnd () {
      this.togglePause = true
      this.toggleEnd = !this.toggleEnd
      this.reRoute()
    },

    resetTimer () {
      if (this.ongoingSession.finishedPdSession || this.countdownTimer <= -1) {
        const warmUpPeriod = get(this.sessionSettings, 'warmup_period_in_seconds', 0)
        this.countdownTimer = this.wrapUp ? this.wrapUpSeconds : warmUpPeriod

        return
      }

      if (!this.wrapUp) {
        this.countdownTimer = this.sessionSettings.warmup_period_in_seconds
      }
    },

    reRoute (isForced = false) {
      if (isForced) {
        this.redirectNotification = isForced
      }

      this.reRouteModal = true
      this.isSessionRunning = false

      // we force the wrap-up to end once the power dialer session has ended
      // and that call/contact disposition is not forced
      if (this.dialer.currentStatus !== 'READY' && !this.isNotDisposed) {
        this.hangUpIntervalCounter = 0

        this.hangUpInterval = setInterval(() => {
          if (this.dialer.currentStatus === 'WRAP_UP') {
            this.$VueEvent.fire('forceEndWrapUp')
          }

          this.hangUpIntervalCounter++

          if (this.hangUpIntervalCounter >= 120) {
            clearInterval(this.hangUpInterval)
          }
        }, 500)
      }

      this.clearRedialedTasks()
      clearInterval(this.countdownInterval)

      setTimeout(() => {
        this.$emit('on-redirect', this.selectedList)
      }, this.redirectDelay)
    },

    managingSessionFlows (status = '') {
      switch (status) {
        // If Status is READY
        case 'READY':
          if (!this.statusCallConnected &&
            this.timerIsOver &&
            this.isSessionRunning) {
            this.resetTimer()
          }

          // automate next task only if no wrap-up, no in-progress redial,
          // and no manual skip (clicked next task) is in-progress
          if (this.isSessionRunning &&
            this.wrapUpSeconds === -1 &&
            !this.loadingNext &&
            !this.isRedialClicked) {
            this.onNextTask()
          }

          break
        case 'WRAP_UP':
          // if task is manually skipped through the
          // Next button, end the wrap up
          if (this.skipWrapUp) {
            // we need to clear the wrap-up (set agent status to available)
            // after the session ended
            if (this.powerDialerTasks.in_queue.length === 0) {
              this.$VueEvent.fire('forceEndWrapUp')
            } else { // just end the wrap-up
              this.$VueEvent.fire('endWrapUp')
            }

            this.wrapUp = false
            this.skipWrapUp = false
            return
          }

          this.wrapUp = true
          this.countdownTimer = this.wrapUpSeconds

          // if status is wrap-up and wrap-up seconds
          // is "no wrap-up", then skip wrap-up countdown timer
          // and proceed immediately to the next task
          if (this.isSessionRunning && this.wrapUpSeconds === -1) {
            this.onNextTask(true)
          }

          break
        case 'HANGING_UP_CALL':
          if (!this.togglePause) {
            this.resetTimer()
          }

          break
      }
    },

    processSession (noWrapUp = false) {
      this.onPhoneExpansionReset()

      if (!noWrapUp) {
        this.$VueEvent.fire('endWrapUp')
      }

      this.activeTask = this.taskToCall
      this.hasActiveTask = true
      this.setContact(this.taskToCall)

      if (!this.isSessionRunning) {
        this.isSessionRunning = true
      }

      this.resetTimer()

      setTimeout(() => {
        this.startWarmUpCountDown()
      }, 1000)
    },

    async onNextTask (forceSkip = false, skipWrapUp = false) {
      let noWrapUp = false
      this.loadingNext = true

      // when there is wrap up, skip wrap
      if (this.wrapUpSeconds !== -1) {
        this.skipWrapUp = skipWrapUp
      }

      // when user clicks on Next button we also need to check if agent is on call
      if (!forceSkip && skipWrapUp) {
        this.verifyAgentOnCall = true
      }

      this.onPhoneExpansionReset()

      // end wrap up
      if (this.dialer.currentStatus === 'WRAP_UP') {
        this.$VueEvent.fire('endWrapUp')
        noWrapUp = true
      }

      // hangup in-progress call
      if (this.callInProgress && this.dialer.currentStatus !== 'WRAP_UP') {
        this.processHangup()
      }

      if (this.dialer.currentStatus !== 'CALL_CONNECTED' || forceSkip) {
        this.wrapUp = false
        this.hasActiveTask = false
        const task = get(this.powerDialerTasks.in_queue, '0', null)

        this.taskToCall = cloneDeep(task)

        if (isEmpty(task)) {
          this.hasActiveTask = false
          this.reRoute()
          return
        }

        this.processRemoveFirstInQueueTask()
        this.processSession(noWrapUp)
        // Add task to skipped list when users clicks on the Next button
        if (!forceSkip && skipWrapUp && this.sessionPaused) {
          this.powerDialerTasks.skipped.push(cloneDeep(this.taskToCall))
        }
        return
      }

      if (this.dialer.currentStatus === 'CALL_CONNECTED') {
        this.processHangup()
      }
    },

    onInitiateSession (session) {
      this.activeTask = {}
      this.hasActiveTask = false
      this.initialize()
    },

    onInitiateWrapUp (session) {
      this.hasActiveTask = false
      this.initialize()
    },

    onEndWrapUp () {
      this.wrapUp = false
      this.taskToCall = cloneDeep(this.powerDialerTasks.in_queue[0])

      if (this.taskToCall && this.isSessionRunning) {
        setTimeout(() => {
          this.processRemoveFirstInQueueTask()
          this.processSession(true)
        }, 200)

        return
      }

      this.hasActiveTask = false
      this.reRoute()
    },

    onPhoneExpansionReset () {
      this.sessionPhoneExpansion = ''
    },

    requeueTask () {
      if (isEmpty(this.redialedTask)) {
        return
      }

      const task = this.$jsonClone(this.redialedTask)

      if (!task.redialed_now) {
        this.reQueuePowerDialerTask({
          task: task,
          id: task.contact_list_item_id
        })
      }

      this.redialedTask = {}
    },

    onHoldFailed () {
      this.loadingHold = false
      this.toggleHold = false
    },

    onUnholdFailed () {
      this.loadingUnhold = false
      this.toggleHold = true
    },

    manageTaskTransition () {
      const task = this.powerDialerTasks.in_queue.shift()
      this.taskToCall = cloneDeep(task)

      if (isEmpty(task)) {
        this.hasActiveTask = false
        this.reRoute()
        return
      }

      this.processSession(false)
    }
  },

  watch: {
    currentCompany () {
      if (!this.autoDialer.outbound_campaign_id && this.togglePause) {
        this.findDefaultOutboundCampaign()
      }
    },

    toggleEnd (value) {
      const timerStopped = (value && this.timerIsOver)

      if (timerStopped && !this.statusCallConnected) {
        setTimeout(() => {
          this.reRoute()
        }, 2000)
      }
    },

    'powerDialerTasks.in_queue': {
      handler (tasks) {
        // end the session if:
        // there's no tasks in queue
        // and there's no active task
        if (tasks.length === 0 && !this.hasActiveTask) {
          this.shouldRedirect = true
          return
        }

        if (tasks.length === 0 && !this.togglePause) {
          this.shouldRedirect = true
        }

        if (tasks.length > 0 && !this.isSessionRunning) {
          this.shouldRedirect = false
          if (!this.wrapUp) {
            // Calls this function the first time the page loads
            this.start()
          }
        }
      },
      deep: true
    },

    contact (value) {
      const phoneNumber = this.$options.filters.fixPhone(value.phone_number)
      const outboundCampaing = this.campaigns.find(campaign => campaign.id === this.sessionSettings.campaign_id)
      // Skip contact since we are trying to make a self call
      if (outboundCampaing && outboundCampaing.incoming_number === phoneNumber) {
        const newTask = this.powerDialerTasks.skipped.find(task => task.id === value.id)
        // Move the contact/task to the list of skipped ones
        if (!newTask) {
          this.powerDialerTasks.skipped.push(value)
        }

        // Continue with next task/contact
        if (this.dialer.currentStatus !== 'CALL_CONNECTED') {
          this.wrapUp = false
          this.hasActiveTask = false
          this.manageTaskTransition()
        }
      }
    },

    currentSessionStatus (status) {
      this.managingSessionFlows(status)
    },

    integrationsHubspot (obj) {
      if (obj?.contact_id) {
        this.hubspot = obj
      }
    },

    wrapUp (value) {
      if (value) {
        this.startWarmUpCountDown()
        return
      }

      // re-run/re-initialize only if no manual skip wrap-up
      if (!this.skipWrapUp) {
        this.initialize()
      }
    },

    'dialer.isReady': function () {
      // session is not ready if session failed to call the contact
      // because dialer is not ready. If dialer reconnects and status
      // goes to ready, then we can continue running the task
      if (!this.sessionNotReady) {
        this.runTask()
        this.sessionNotReady = false
      }
    },

    'dialer.isHeld': function (value) {
      this.toggleHold = value
    }
  },

  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.prevRoute = from
    })
  },

  beforeDestroy () {
    this.clearWarmUpCountDown()
    clearInterval(this.hangUpInterval)
    clearInterval(this.countdownInterval)
    clearInterval(this.$options.holdInterval)

    this.$VueEvent.stop('initiate_session', this.onInitiateSession)
    this.$VueEvent.stop('initiate_wrapup', this.onInitiateWrapUp)
    this.$VueEvent.stop('initiate_session_no_tasks', this.closePowerDialerNoTasks)
    this.$VueEvent.stop('endWrapUpPDSession', this.onEndWrapUp)
    this.$VueEvent.stop('phoneExpansionReset', this.onPhoneExpansionReset)
    this.$VueEvent.stop('redial_task', this.requeueTask)
    this.$VueEvent.stop('holdFailed', this.onHoldFailed)
    this.$VueEvent.stop('unholdFailed', this.onUnholdFailed)
  }
}
</script>
