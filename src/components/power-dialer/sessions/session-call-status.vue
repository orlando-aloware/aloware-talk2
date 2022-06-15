<template>
  <q-card flat>
    <div class="t-menu-2 no-border">
      <div class="d-flex align-items-center pt-3 pb-0">

        <div class="font-weight-bold pl-3 flex-grow-1">
          <q-chip color="grey-50" class="p-0">
            <div
              :class="`text-15 text-lowercase text-capitalize px-2`"
              v-html="statusDisplayButton">
            </div>
          </q-chip>
        </div>

        <q-btn
          class="sessions-button free-width mx-1"
          no-wrap no-caps size="sm"
          unelevated
          outline
          :color="statusCallConnected ? 'grey-4' : 'grey-8'"
          :disabled="!statusCallConnected"
          @click="onToggleMute">
          <mute-icon v-show="!toggleMute"
                     class="mr-2"
                     :width="12"
                     :height="12"></mute-icon>
          <unmute-icon v-show="toggleMute"
                       class="mr-2"
                       :width="12"
                       :height="12"></unmute-icon>
          <div class="text-body2 text-black">
            {{ toggleMute ? 'Unmute' : 'Mute' }}
          </div>
        </q-btn>

        <q-btn
          no-wrap no-caps size="sm"
          unelevated
          outline
          class="sessions-button free-width mx-1"
          :color="statusCallConnected ? 'grey-4' : 'grey-8'"
          :disabled="!statusCallConnected"
          @click="onToggleHold">
          <UnHoldIcon v-if="toggleHold"
                      class="mr-2"
                      color="#F2997A" />
          <PauseIcon v-else
                     class="mr-2"
                     color="#62666E" />
          <div class="text-body2 text-black">
            {{ toggleHold ? 'Unhold' : 'Hold' }}
          </div>
        </q-btn>

        <q-btn
          class="sessions-button free-width mx-1"
          size="sm"
          no-wrap unelevated no-caps
          :disabled="!canNextTask "
          :color="canNextTask  ? 'red-7' : 'grey-8'"
          @click="nextContact">
          <CallDropIcon class="mr-2" color="white" />
          <div class="text-body2">Next</div>
        </q-btn>

        <b-dropdown
          text="..."
          no-caret
          right size="sm"
          variant="white"
          :disabled="!statusCallConnected"
          class="m-1 b-compact-dropdown-button text-bold dropdown-white contacts-options-dropdown">
          <template #button-content>
            <i class="fa fa-ellipsis-h"></i>
          </template>
          <b-dropdown-item
            @click="openDialPad"
            href="#">
            <DialPadIcon />
            Dial Pad
          </b-dropdown-item>
          <b-dropdown-item
            @click="openAdd"
            href="#">
            <AddUserIcon color="#62666E" />
            Add
          </b-dropdown-item>
          <b-dropdown-item
            @click="openTransfer"
            href="#">
            <TransferIcon color="#62666E" />
            Transfer
          </b-dropdown-item>
          <b-dropdown-item disabled href="#">
            <CalendarIcon />
            Schedule Callback
          </b-dropdown-item>
        </b-dropdown>
      </div>

      <div class="d-flex align-items-center p-0">
        <div
          class="text-18 font-weight-bold pl-3 pt-2 flex-grow-1">
          {{ fullName }}
          <span class="text-15 text-subtitle1">
            {{ phoneNumber }}
          </span>
        </div>
      </div>

      <div class="d-flex align-items-center p-0">
        <div
          v-if="timezone"
          class="flex-grow-1 text-14 text-subtitle1 text-capitalize pl-3 py-0">
          <DropIcon
            width="18px"
            height="18px"
            class="mr-0 py-0"
            style="position:relative;top:-2px;" />
          {{ timezone }} - {{ getTimeZone }}
        </div>

        <q-btn
          class="sessions-button free-width mx-1"
          no-wrap outline no-caps
          size="sm" color="grey-4"
          :disabled="!statusCallConnected"
          @click="onToggleRecording">

          <StopIcon
            v-if="toggleRecording"
            class="mr-2"
            color="#62666E" />

          <RecordIcon
            v-else
            class="mr-2"
            color="red" />

          <div class="text-body2 text-black">
            {{ toggleRecording ? 'Stop Rec.' : 'Record' }}
          </div>
        </q-btn>
      </div>

      <div class="d-flex align-items-center p-0 pt-2 pb-2">
        <div
          class="flex-grow-1 text-16 text-capitalize pl-3 text-weight-normal">

          <div id="session-list-name">
            {{ selectedListName }}
          </div>

          <b-popover
            target="session-list-name"
            triggers="hover"
            placement="left">
            <template #title>
              List name
            </template>
            {{ selectedListName }}
          </b-popover>

          <span class="text-subtitle2 text-grey"></span>
          <div class="text-10 pt-1">
            <HeadphoneIcon width="12px"
                           height="12px"
                           class="mr-0 py-0"
                           style="position:relative;top:-2px;" />
            {{ lineName }}
          </div>

        </div>

        <q-btn
          unelevated :outline="!sessionPaused"
          no-wrap no-caps size="sm"
          :color="`${togglePause ? sessionPaused ? 'primary' : 'red-3' : 'grey-4'}`"
          :disabled="toggleEnd"
          :class="`${togglePause ? sessionPaused ? 'btn-btn-primary' : 'bg-btn-red' : ''} sessions-button free-width mx-1`"
          @click="onTogglePause">

          <PauseIcon
            class="mr-2"
            :color="`${sessionPaused ? '#fff' : '#62666E'}`" />

          <div
            :class="`text-body2 ${sessionPaused ? 'text-white' : 'text-black'}`">
            {{ pauseButtonText }}
          </div>
        </q-btn>

        <q-btn
          no-wrap outline no-caps
          size="sm"
          :disable="toggleEnd"
          :color="`${toggleEnd ? 'red-3' : 'grey-4'}`"
          :class="`${toggleEnd ? 'bg-btn-red' : ''} sessions-button free-width mx-1`"
          @click="onToggleEnd">

          <EndCallIcon
            class="mr-2"
            color="#62666E" />

          <div class="text-body2 text-black">
            {{ toggleEnd ? 'Ending Session...' : 'End Session'}}
          </div>
        </q-btn>
      </div>
    </div>

    <q-dialog v-model="reRouteModal">
      <q-card class="px-4">
        <q-card-section>
          <div class="text-h6"></div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <p v-if="!hasQueuedTaskLists">No remaining tasks found...</p>
          <p>You will be redirected to PowerDialer <strong>{{ selectedList.name }}</strong> list. Please wait...</p>
        </q-card-section>

        <q-card-actions align="right"></q-card-actions>
      </q-card>
    </q-dialog>

  </q-card>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import DialPadIcon from 'components/icons/dialpad-icon'
import TransferIcon from 'components/icons/transfer-icon-2'
import AddUserIcon from 'components/icons/add-user-icon-2'
import CalendarIcon from 'components/icons/calendar-icon'
import DropIcon from 'components/icons/drop-location-icon'
import HeadphoneIcon from 'components/icons/headphone-icon'
import PauseIcon from 'components/icons/pause-icon-2'
import UnHoldIcon from 'components/icons/pause-icon-3'
import CallDropIcon from 'components/icons/call-drop-icon'
import StopIcon from 'components/icons/stop-icon'
import EndCallIcon from 'components/icons/stop-icon-2'
import RecordIcon from 'components/icons/record-icon'
import * as AutoDialTaskStatus from 'src/constants/power-dialer/task-status'
import * as UserOutboundCallingModes from 'src/constants/user-outbound-calling-modes'
import { sessionCallStatusMixin } from 'src/plugins/mixins'
import { isEmpty } from 'lodash'
import moment from 'moment-timezone'
import MuteIcon from 'components/icons/mute-icon'
import UnmuteIcon from 'components/icons/unmute-icon'

export default {
  name: 'SessionCallStatus',
  components: {
    MuteIcon,
    UnmuteIcon,
    CalendarIcon,
    TransferIcon,
    DialPadIcon,
    AddUserIcon,
    DropIcon,
    HeadphoneIcon,
    PauseIcon,
    UnHoldIcon,
    CallDropIcon,
    StopIcon,
    EndCallIcon,
    RecordIcon
  },
  mixins: [ sessionCallStatusMixin ],
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.prevRoute = from
    })
  },
  beforeDestroy () {
    this.clearWarmUpCountDown()
    clearInterval(this.hangUpInterval)
  },
  computed: {
    ...mapFields([
      'sessionPhoneExpansion'
    ]),
    ...mapFields('powerDialer', [
      'sessionCallStatuses',
      'countdownTimer',
      'sessionPaused',
      'activeTask',
      'hasActiveTask',
      'taskToCall',
      'hubspot',
      'isSessionRunning'
    ]),
    ...mapState([
      'campaigns',
      'dialer'
    ]),
    ...mapState('cache', [
      'currentCompany'
    ]),
    ...mapState('auth', [
      'profile'
    ]),
    ...mapGetters('powerDialer', [
      'sessionLoader',
      'sessionSettings'
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
    shouldSkip () {
      return this.sessionSettings.skip_outside_daytime_hours === 1
    },
    address () {
      let { taskToCall } = this
      let address = ''
      if (isEmpty(this.taskToCall)) {
        return 'N/A'
      }
      if (taskToCall?.cnam_city && !taskToCall?.cnam_state) {
        address = `${taskToCall?.cnam_city || ''}`
      } else if (!taskToCall?.cnam_city && taskToCall?.cnam_state) {
        address = `${taskToCall?.cnam_state || ''}`
      } else {
        address = `${taskToCall?.cnam_city || ''} ${taskToCall?.cnam_state || ''}`
      }
      return address
    },
    companyName () {
      return this.taskToCall?.company_name || 'Company: N/A'
    },
    fullName () {
      let { taskToCall } = this
      if ((taskToCall?.first_name === null || taskToCall?.first_name === '') && (taskToCall?.last_name === null || taskToCall?.last_name === '')) {
        return `No Name`
      }
      return `${taskToCall?.first_name || ''} ${taskToCall?.last_name || ''}`
    },
    getLine () {
      return this.campaigns.find((line) => line.id === this.activeTask?.task?.communication?.campaign_id)
    },
    toggleMute () {
      return this.dialer.isMuted
    },
    toggleRecording () {
      if (this.dialer.recordingStatus === 'in-progress' && this.dialer.communication && this.dialer.communication.should_record === true) {
        return true
      }
      if (this.dialer.recordingStatus === 'paused' && this.dialer.communication && this.dialer.communication.should_record === true) {
        return false
      }
      return false
    },
    togglePause: {
      get () {
        return this.sessionCallStatuses.pause
      },
      set (val) {
        this.sessionCallStatuses.pause = val
      }
    },
    toggleHold: {
      get () {
        return this.sessionCallStatuses.hold
      },
      set (val) {
        this.sessionCallStatuses.hold = val
      }
    },
    toggleEnd: {
      get () {
        return this.sessionCallStatuses.end
      },
      set (val) {
        this.sessionCallStatuses.end = val
      }
    },
    status () {
      return AutoDialTaskStatus.STATUSES
    },
    selectedListName () {
      return this.selectedList?.name || ''
    },
    lineName () {
      return this.dialer?.communication?.campaign?.name || 'N/A'
    },
    phoneNumber () {
      return this.taskToCall?.phone_number
    },
    timezone () {
      return this.taskToCall?.timezone
    },
    getTimeZone () {
      let timezone = this.taskToCall?.timezone
      return moment.tz(moment.tz(timezone).format('HH:mm:ss'), 'HH:mm:ss', timezone).format('hh:mm A')
    },
    statusCallConnected () {
      return this.dialer.currentStatus === 'CALL_CONNECTED'
    },
    statusReady () {
      return this.dialer.currentStatus === 'READY'
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
    timerIsOver () {
      return this.countdownTimer === -1
    },
    integrationsHubspot () {
      return this.activeTask?.integrations?.hubspot
    },
    options () {
      return this.$options.auto_dialer_interval
    },
    powerDialerSettings () {
      let settings = this.profile.company.power_dialer_settings
      if (settings !== null && settings.open_time && settings.close_time) {
        return settings
      }

      return {
        open_time: '09:00:00',
        close_time: '18:00:00'
      }
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
      return (
        this.statusCallConnected ||
        ['WRAP_UP', 'READY'].includes(this.dialer.currentStatus)
      ) && this.callInProgress
    },
    pauseButtonText () {
      switch (true) {
        case this.togglePause && !this.sessionPaused && !this.toggleEnd:
          return 'Unpause Session'
        case this.togglePause && this.sessionPaused && !this.toggleEnd:
          return 'Resume Session'
        default:
          return 'Pause Session'
      }
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

    this.$VueEvent.stop('initiate_session', this.onInitiateSession)
    this.$VueEvent.listen('initiate_session', this.onInitiateSession)

    this.$VueEvent.stop('initiate_wrapup', this.onInitiateWrapUp)
    this.$VueEvent.listen('initiate_wrapup', this.onInitiateWrapUp)

    this.$VueEvent.stop('initiate_session_no_tasks', this.closePowerDialerNoTasks)
    this.$VueEvent.listen('initiate_session_no_tasks', this.closePowerDialerNoTasks)

    this.$VueEvent.stop('endWrapUpPDSession', this.onEndWrapUp)
    this.$VueEvent.listen('endWrapUpPDSession', this.onEndWrapUp)

    this.isSessionRunning = false
  },

  methods: {
    ...mapActions(['setShowPhone']),
    ...mapActions('powerDialer', [
      'getContact'
    ]),
    ...mapMutations('powerDialer', [
      'TOGGLE_SESSION_LOADER'
    ]),
    ...mapActions('contacts', [
      'setContactClone'
    ]),
    findDefaultOutboundCampaign () {
      this.autoDialer.outbound_campaign_id = null

      // Default PowerDialer outbound line
      if (this.currentCompany && this.currentCompany.default_power_dialer_campaign_id) {
        this.autoDialer.outbound_campaign_id = this.currentCompany.default_power_dialer_campaign_id
        return
      }

      // Force outbound line on all users
      if (this.currentCompany && this.currentCompany.default_outbound_campaign_id && this.currentCompany.force_outbound_line) {
        this.autoDialer.outbound_campaign_id = this.currentCompany.default_outbound_campaign_id
        return
      }

      // Outbound line is set to use account default and account has a default
      if (this.currentCompany && this.currentCompany.default_outbound_campaign_id && this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT && !this.profile.default_outbound_campaign_id) {
        this.autoDialer.outbound_campaign_id = this.currentCompany.default_outbound_campaign_id
        return
      }

      // User has a default outbound line
      if (this.profile.default_outbound_campaign_id && this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT) {
        this.autoDialer.outbound_campaign_id = this.profile.default_outbound_campaign_id
        return
      }

      // User has to choose outbound line every time
      if (this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ALWAYS_ASK) {
        this.autoDialer.outbound_campaign_id = null
      }
    },
    startWarmUpCountDown () {
      if (this.countdownStarted) {
        return
      }

      this.countdownStarted = true
      this.resetTimer()
      this.countdownInterval = setInterval(() => {
        this.countdownTimer--
        this.onTimerIsOver()
      }, 1000)
    },
    onTimerIsOver () {
      if (this.timerIsOver) {
        this.clearWarmUpCountDown()
        if ((this.toggleEnd || !this.hasQueuedTaskLists) && !this.hasActiveTask) {
          this.reRoute()
          return
        }
        if (!this.togglePause && !this.wrapUp) {
          this.runTask()
        }
        if (this.wrapUp) {
          this.initialize()
          this.wrapUp = false
          this.isSessionRunning = false
        }
        if (this.togglePause) {
          this.sessionPaused = true
          this.taskToCall = this.powerDialerTasks.in_queue[0]
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

      // TEMPORARY IMPLEMENTATION
      // if ((!this.statusCallConnected && this.hasQueuedTaskLists) && (!this.togglePause && !this.toggleEnd)) {
      if (!this.statusOnACall) {
        if (!this.wrapUp) {
          this.taskToCall = this.powerDialerTasks.in_queue[0]
          this.activeTask = this.taskToCall
          this.hasActiveTask = true
          this.setContact(this.taskToCall)

          this.TOGGLE_SESSION_LOADER(true)

          if (!this.isSessionRunning) {
            this.isSessionRunning = true
          }

          this.resetTimer()
          setTimeout(() => {
            this.startWarmUpCountDown()
          }, 1000)
        }
      }

      if (!this.hasQueuedTaskLists && !this.statusCallConnected) {
        if (this.timerIsOver && this.selectedList.id !== 'all' && this.isSessionRunning) {
          this.closePowerDialerNoTasks()
        }
      }

      this.TOGGLE_SESSION_LOADER(false)
    },
    closePowerDialerNoTasks () {
      this.reRoute(false)
      if (this.redirectNotification) {
        this.$emit('no-tasks-found')
      }
    },
    onToggleMute () {
      this.$VueEvent.fire('toggleMute')
    },
    onToggleHold () {
      this.toggleHold = !this.toggleHold
      this.$VueEvent.fire('toggleHold')
    },
    onToggleRecording () {
      this.$VueEvent.fire('toggleRecordingStatus')
    },
    onTogglePause () {
      this.togglePause = !this.togglePause
    },
    onToggleEnd () {
      this.onTogglePause()
      this.toggleEnd = !this.toggleEnd
      this.reRoute()
    },
    resumeSession () {
      this.toggleEnd = false
      if (!this.statusCallConnected) {
        this.resetTimer()
      }
    },
    resetTimer () {
      if (this.ongoingSession.finishedPdSession || this.countdownTimer <= -1) {
        this.countdownTimer = this.wrapUp ? this.wrapUpSeconds : this.sessionSettings.warmup_period_in_seconds
      }
    },
    reRoute (isForced = false) {
      if (isForced) {
        this.redirectNotification = isForced
      }

      this.reRouteModal = true

      if (this.dialer.currentStatus !== 'READY') {
        this.hangUpIntervalCounter = 0
        this.hangUpInterval = setInterval(() => {
          if (this.dialer.currentStatus === 'WRAP_UP') {
            this.$VueEvent.fire('endWrapUp')
          }

          this.hangUpIntervalCounter++

          if (this.hangUpIntervalCounter >= 120) {
            clearInterval(this.hangUpInterval)
          }
        }, 500)
      }

      setTimeout(() => {
        this.$emit('on-redirect', this.selectedList)
      }, this.redirectDelay)
    },
    managingSessionFlows (status = '') {
      let {
        togglePause,
        statusCallConnected,
        timerIsOver,
        isSessionRunning
      } = this
      switch (status) {
        // If Status is READY
        case 'READY':
          // if (this.toggleEnd) {
          //   this.reRoute()
          // }
          if (!statusCallConnected && timerIsOver && isSessionRunning) {
            this.resetTimer()
          }
          break
        case 'WRAP_UP':
          this.wrapUp = true
          this.resetTimer()
          break
        case 'MAKING_CALL':
          break
        case 'ANSWERING_CALL':
          break
        case 'REJECTING_CALL':
          break
        case 'CALL_CONNECTED':
          break
        case 'HANGING_UP_CALL':
          if (!togglePause) {
            this.resetTimer()
          }
          break
        case 'CALL_DISCONNECTED':
          break
        default:
          break
      }
    },
    openAdd () {
      this.$VueEvent.fire('togglePhone')
      this.sessionPhoneExpansion = 'add'
    },
    openDialPad () {
      this.$VueEvent.fire('togglePhone')
      this.sessionPhoneExpansion = 'dialpad'
    },
    openTransfer () {
      this.$VueEvent.fire('togglePhone')
      this.sessionPhoneExpansion = 'transfer'
      // this.resetTransfer()
      // this.expansionEnabled = true
      // this.bottomExpansion = 'transfer'
      // setTimeout(() => {
      //   this.expanded = true
      // }, 50)
    },
    processSession (noWrapUp = false) {
      if (!noWrapUp) {
        this.$VueEvent.fire('endWrapUp')
      }

      this.activeTask = this.taskToCall
      this.hasActiveTask = true
      this.setContact(this.taskToCall)
      // this.TOGGLE_SESSION_LOADER(true)

      if (!this.isSessionRunning) {
        this.isSessionRunning = true
      }

      this.resetTimer()
      setTimeout(() => {
        this.startWarmUpCountDown()
      }, 1000)
    },
    async nextContact () {
      if (this.dialer.currentStatus !== 'CALL_CONNECTED' && this.powerDialerTasks.in_queue.length) {
        this.wrapUp = false
        this.taskToCall = this.powerDialerTasks.in_queue[0]
        this.processSession()
        return
      }

      if (this.dialer.currentStatus === 'CALL_CONNECTED') {
        this.$VueEvent.fire('hangupCall')
      }

      this.wrapUp = false
      this.taskToCall = this.powerDialerTasks.in_queue[0]

      if (this.taskToCall) {
        this.activeTask = this.taskToCall
        this.hasActiveTask = true
        this.hangUpIntervalCounter = 0
        this.hangUpInterval = setInterval(() => {
          if (this.dialer.currentStatus === 'WRAP_UP') {
            this.processSession()
            clearInterval(this.hangUpInterval)
          }

          this.hangUpIntervalCounter++

          if (this.hangUpIntervalCounter >= 120) {
            clearInterval(this.hangUpInterval)
          }
        }, 500)
      } else {
        this.dialer.currentStatus === 'WRAP_UP' && this.$VueEvent.fire('endWrapUp')
        this.hasActiveTask = false
        this.reRoute()
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
      this.taskToCall = this.powerDialerTasks.in_queue[0]

      if (this.taskToCall) {
        setTimeout(() => {
          this.processSession(true)
        }, 200)
      }
    }
  },
  watch: {
    currentCompany () {
      if (!this.autoDialer.outbound_campaign_id && this.togglePause) {
        this.findDefaultOutboundCampaign()
      }
    },
    togglePause (value) {
      if (!value) {
        if (this.timerIsOver) {
          setTimeout(() => {
            this.initialize()
            this.sessionPaused = false
          }, 1000)
        }
      }
    },
    toggleEnd (value) {
      if ((value && this.timerIsOver) && !this.statusCallConnected) {
        setTimeout(() => {
          this.reRoute()
        }, 2000)
      }
    },
    'powerDialerTasks.in_queue': {
      handler (tasks) {
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
      } else {
        this.initialize()
      }
    },
    'dialer.currentStatus': function (value) {
      if (value === 'WRAP_UP') {
        this.nextContact()
      }
    }
  },
  data () {
    return {
      countdownStarted: false,
      countdownInterval: null,
      skippedTasks: [],
      prevRoute: null,
      shouldRedirect: false,
      wrapUp: false,
      loading: false,
      autoDialer: {
        outbound_campaign_id: null,
        ratio: 1
      },
      reRouteModal: false,
      redirectDelay: 3000,
      redirectNotification: false,
      hangUpInterval: null,
      hangUpIntervalCounter: 0
    }
  }
}
</script>
