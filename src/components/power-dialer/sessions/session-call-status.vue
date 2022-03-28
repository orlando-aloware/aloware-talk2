<template>
  <q-card flat :disabled="sessionLoader">
    <div class="t-menu-2 no-border">
      <div class="d-flex align-items-center pt-2 pb-0">
        <div class="font-weight-bold pl-3 flex-grow-1">
          <q-chip color="grey-50" class="p-0">
            <div
              :class="`text-15 text-lowercase text-capitalize px-2`"
              v-html="statusDisplayButton">
              <!-- {{ countdownTimer > 0 ? 'Will call in' : 'Connected: ' }}
              <span
                class="text-weight-bold text-grey-7 text-lowercase"
                v-if="countdownTimer > 0">
                {{ countdownTimer }}s
              </span>
              <span
                class="text-weight-bold text-grey-7 text-lowercase"
                v-else>
                {{ dialer.timer }}
              </span> -->
            </div>
          </q-chip>
        </div>
        <q-btn
          @click="onToggleHold"
          no-wrap no-caps size="sm"
          unelevated
          outline
          :color="statusCallConnected ? 'grey-4' : 'grey-8'"
          class="sessions-button free-width mx-1"
          :disabled="!statusCallConnected">
          <UnholdIcon v-if="toggleHold" class="mr-2" color="#F2997A" />
          <PauseIcon v-else class="mr-2" color="#62666E" />
          <div class="text-body2 text-black">
            {{ toggleHold ? 'Unhold' : 'Hold' }}
          </div>
        </q-btn>
        <q-btn
          @click="nextContact"
          no-wrap unelevated no-caps
          :disabled="!statusCallConnected"
          size="sm"
          :color="statusCallConnected ? 'red-7' : 'grey-8'"
          class="sessions-button free-width mx-1">
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
          class="text-18 font-weight-bold pl-3 pt-2 flex-grow-1"
          v-html="fullname">
          <span class="text-15 text-subtitle1">
            {{ phoneNumber | fixPhone('NATIONAL', true) }}
          </span>
        </div>
      </div>
      <!-- <div class="d-flex align-items-center p-0">
        <div class="text-14 pl-3 text-subtitle1 text-capitalize">
          {{ companyName }}
          <span
            v-if="companyName"
            class="text-13 text-subtitle2 text-grey"> | {{ companyName }}</span>
        </div>
      </div> -->
      <div class="d-flex align-items-center p-0">
        <div
          v-if="timezone"
          class="flex-grow-1 text-14 text-subtitle1 text-capitaliz pl-3 py-0">
          <DropIcon
            width="18px"
            height="18px"
            class="mr-0 py-0"
            style="position:relative;top:-2px;" />
          {{ timezone }} - {{ getTimeZone }}
        </div>
        <!-- <q-btn
          @click="onToggleMute"
          no-wrap outline no-caps
          size="sm" color="grey-4"
          :disabled="!statusCallConnected"
          class="sessions-button free-width mx-1">
          <MuteIcon height="13px" class="mr-2" color="#62666E" />
          <div class="text-body2 text-black">
            {{ toggleMute ? 'Unmute' : 'Mute' }}
          </div>
        </q-btn> -->
        <q-btn
          @click="onToggleRecording"
          no-wrap outline no-caps
          size="sm" color="grey-4"
          :disabled="!statusCallConnected"
          class="sessions-button free-width mx-1">
          <StopIcon v-if="toggleRecording" class="mr-2" color="#62666E" />
          <RecordIcon v-else class="mr-2" color="red" />
          <div class="text-body2 text-black">
            {{ toggleRecording ? 'Stop Rec.' : 'Record' }}
          </div>
        </q-btn>
      </div>
      <div class="d-flex align-items-center p-0 pt-2 pb-2">
        <div class="flex-grow-1 text-16 text-capitalize pl-3 text-weight-normal">
          {{ selectedListName }}
          <span class="text-subtitle2 text-grey"></span>
          <div class="text-10 pt-1">
            <HeadphoneIcon width="12px" height="12px" class="mr-0 py-0" style="position:relative;top:-2px;" />
            {{ lineName }}
          </div>
        </div>
        <q-btn
          v-if="toggleEnd"
          @click="resumeSession"
          color="primary"
          unelevated
          no-wrap no-caps size="sm"
          class="btn-btn-primary sessions-button free-width mx-1">
          <PauseIcon
            class="mr-2"
            color="white" />
          <div class="text-body2 text-white">
            Resume
          </div>
        </q-btn>
        <q-btn
          v-else
          @click="onTogglePause"
          :color="`${togglePause ? sessionPaused ? 'primary' : 'red-3' : 'grey-4'}`"
          unelevated :outline="!sessionPaused"
          no-wrap no-caps size="sm"
          :disabled="toggleEnd"
          :class="`${togglePause ? sessionPaused ? 'btn-btn-primary' : 'bg-btn-red' : ''} sessions-button free-width mx-1`">
          <PauseIcon
            class="mr-2"
            :color="`${sessionPaused ? '#fff' : '#62666E'}`" />
          <div
            :class="`text-body2 ${sessionPaused ? 'text-white' : 'text-black'}`">
            {{ togglePause ? sessionPaused ? 'Resume Session' : 'Unpause Session' : 'Pause Session' }}
          </div>
        </q-btn>
        <q-btn
          @click="onToggleEnd"
          no-wrap outline no-caps
          size="sm"
          :color="`${toggleEnd ? 'red-3' : 'grey-4'}`"
          :class="`${toggleEnd ? 'bg-btn-red' : ''} sessions-button free-width mx-1`">
          <EndCallIcon class="mr-2" color="#62666E" />
          <div class="text-body2 text-black">
            {{ toggleEnd ? 'Ending Session' : 'End Session'}}
          </div>
        </q-btn>
      </div>
    </div>
  </q-card>
</template>

<script>

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import DialPadIcon from 'components/icons/dialpad-icon'
import TransferIcon from 'components/icons/transfer-icon-2'
import AddUserIcon from 'components/icons/add-user-icon-2'
import CalendarIcon from 'components/icons/calendar-icon'
import DropIcon from 'components/icons/drop-location-icon'
import HeadphoneIcon from 'components/icons/headphone-icon'
import PauseIcon from 'components/icons/pause-icon-2'
import UnholdIcon from 'components/icons/pause-icon-3'
import CallDropIcon from 'components/icons/call-drop-icon'
import StopIcon from 'components/icons/stop-icon'
import EndCallIcon from 'components/icons/stop-icon-2'
import RecordIcon from 'components/icons/record-icon'
import * as AutoDialTaskStatus from 'src/constants/power-dialer/task-status'
import * as UserOutboundCallingModes from 'src/constants/user-outbound-calling-modes'
import sessionsMixins from 'src/plugins/mixins/sessions'
import { isEmpty } from 'lodash'
import moment from 'moment-timezone'

export default {
  name: 'SessionCallStatus',
  components: {
    CalendarIcon,
    TransferIcon,
    DialPadIcon,
    AddUserIcon,
    DropIcon,
    HeadphoneIcon,
    PauseIcon,
    UnholdIcon,
    CallDropIcon,
    StopIcon,
    EndCallIcon,
    RecordIcon
  },
  mixins: [ sessionsMixins ],
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.prevRoute = from
    })
  },
  beforeDestroy () {
    this.clearWarmUpCountDown()
  },
  computed: {
    ...mapFields([
      'sessionPhoneExpansion'
    ]),
    ...mapFields('powerDialer', [
      'sessionPaused',
      'activeTask',
      'hubspot'
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
    listObject () {
      return this.listItems[this.selectedList?.id]
    },
    list () {
      return this.listObject.data || []
    },
    companyName () {
      return this.taskToCall?.company_name || 'Company: N/A'
    },
    fullname () {
      let { taskToCall } = this
      return `${taskToCall?.first_name || '&nbsp;'} ${taskToCall?.last_name || '&nbsp;'}`
    },
    keyIndex () {
      let keyCtr = 0
      this.list.forEach((item, key) => {
        if (item?.id === this.contact?.id) {
          keyCtr = key
        }
      })
      if (keyCtr + 1 < this.list.length) {
        return ++keyCtr
      }
      return keyCtr
    },
    hasDefaultContact () {
      if (this.taskToCall?.id) {
        return false
      }
      return true
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
        return this.statuses.pause
      },
      set (val) {
        this.statuses.pause = val
      }
    },
    toggleHold: {
      get () {
        return this.statuses.hold
      },
      set (val) {
        this.statuses.hold = val
      }
    },
    toggleEnd: {
      get () {
        return this.statuses.end
      },
      set (val) {
        this.statuses.end = val
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
      return this.taskToCall?.phone_number || ''
    },
    timezone () {
      return this.taskToCall?.timezone
    },
    getTimeZone () {
      let timezone = this.taskToCall?.timezone
      const contactLocalTime = moment.tz(moment.tz(timezone).format('HH:mm:ss'), 'HH:mm:ss', timezone).format('HH:mm')
      // const contactLocalTime = moment().tz(timezone).format('HH:mm:ss')
      return contactLocalTime
    },
    statusCallConnected () {
      return this.dialer.currentStatus === 'CALL_CONNECTED'
    },
    statusReady () {
      return this.dialer.currentStatus === 'READY'
    },
    timerIsOver () {
      return this.countdownTimer === 0 || this.countdownTimer === -1
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
    }
  },
  created () {
    if (!this.profile.auto_dialer_enabled) {
      this.reRoute()
    }
    if (this.campaings) {
      this.findDefaultOutboundCampaign()
    }
    this.$VueEvent.listen('initiate_session', (session) => {
      console.log('4325435435 :>> ', 4325435435)
      this.initialize()
    })
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
    async checkAutoDialer () {
      console.log('Checking PowerDialer for tasks')

      // make sure the dialer is not active before making another call
      if (!this.on_call && !this.is_running) {
        if (this.in_progress_tasks.length < this.auto_dialer.ratio && !this.isPause && this.queued_tasks.length > 0) {
          let numberOfTasks = this.auto_dialer.ratio - this.in_progress_tasks.length
          let tasks = this.queued_tasks.filter(task => !this.isSkipped(task.id)).slice(0, numberOfTasks)

          for (let task of tasks) {
            // don't run the same task twice
            if (this.last_task && task.id === this.last_task.id) {
              continue
            }

            await this.selectTask(task)

            if (this.warm_up_seconds > 0) {
              this.startWarmUpCountDown(task)
            } else {
              this.runTask(task)
            }
          }

          // if there are no more unskipped tasks
          if (tasks.length === 0) {
            this.fetchAutoDialTasks(AutoDialTaskStatus.STATUS_QUEUED)
            this.$notify({
              duration: 5000,
              offset: 175,
              title: 'PowerDialer',
              message: 'All remaining tasks are skipped.',
              type: 'warning',
              showClose: true
            })
            this.stop()
            return
          }

          return
        }
      }

      if (this.queued_tasks.length === 0 && this.in_progress_tasks.length === 0) {
        console.log('Stopping PowerDialer: No more tasks found')
        this.stop()
      }
    },

    async selectTask (autoDialTask) {
      // exit function when autoDialTask is not set
      if (!autoDialTask) {
        return
      }
      // load selected contact once
      if (!this.selected_contact || this.selected_contact.id !== autoDialTask.contact_id) {
        await this.fetchContactInfo(autoDialTask.contact_id)
      }
      this.selectedAutoDialTask = autoDialTask
    },

    findDefaultOutboundCampaign () {
      this.autoDialer.outbound_campaign_id = null

      // Default PowerDialer outbound line
      if (this.currentCompany && this.currentCompany.default_power_dialer_campaign_id) {
        this.auto_dialer.outbound_campaign_id = this.currentCompany.default_power_dialer_campaign_id
        return
      }

      // Force outbound line on all users
      if (this.currentCompany && this.currentCompany.default_outbound_campaign_id && this.currentCompany.force_outbound_line) {
        this.auto_dialer.outbound_campaign_id = this.currentCompany.default_outbound_campaign_id
        return
      }

      // Outbound line is set to use account default and account has a default
      if (this.currentCompany && this.currentCompany.default_outbound_campaign_id && this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT && !this.profile.default_outbound_campaign_id) {
        this.auto_dialer.outbound_campaign_id = this.currentCompany.default_outbound_campaign_id
        return
      }

      // User has a default outbound line
      if (this.profile.default_outbound_campaign_id && this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT) {
        this.auto_dialer.outbound_campaign_id = this.profile.default_outbound_campaign_id
        return
      }

      // User has to choose outbound line every time
      if (this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ALWAYS_ASK) {
        this.auto_dialer.outbound_campaign_id = null
      }
    },
    runTimer () {
      if (this.timerIsOver) {
        clearInterval(this.countdownTimer)
        return
      }

      this.countdownTimer = setInterval(() => {
        this.countdownTimer--
      }, 1000)
    },
    startWarmUpCountDown (task) {
      if (this.warm_up_seconds === 0 || this.countdownStarted) {
        return
      }

      this.countdownStarted = true
      this.countdownTimer = this.sessionSettings.warmup_period_in_seconds
      this.countdownInterval = setInterval(() => {
        this.countdownTimer--
        // console.log(`Counting down: ${this.countdownTimer}`)
        if (this.countdownTimer === 0) {
          this.clearWarmUpCountDown()
          if (!this.togglePause) {
            this.runTask(task)
          }
        }
      }, 1000)
    },

    async initialize () {
      console.log('Initializing needed data...')
      this.TOGGLE_SESSION_LOADER(true)
      if (this.allTasksAreSkipped) {
        this.clearWarmUpCountDown()
        this.reRoute()
        this.$generalNotification('All remaining tasks are skipped. Redirecting to Power Dialer list.', 'warning')
        return
      }
      if ((!this.statusCallConnected && this.hasQueuedTaskLists) && !this.togglePause) {
        this.taskToCall = this.powerDialerTasks.in_queue[0]
        this.activeTask = this.taskToCall
        await this.fetchContact(this.taskToCall.id)
        if (!this.wrapUp) {
          this.resetTimer()
          setTimeout(() => {
            this.startWarmUpCountDown()
          }, 1000)
        }
      }

      if (!this.hasQueuedTaskLists && !this.statusCallConnected) {
        this.reRoute()
        this.$emit('no-tasks-found')
      }
      // if (!this.togglePause) {
      //   this.resetTimer()
      // }
      this.TOGGLE_SESSION_LOADER(false)
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
      if (this.sessionPaused) {
        this.reRoute()
      }
      this.toggleEnd = !this.toggleEnd
    },
    resumeSession () {
      this.toggleEnd = false
      if (!this.statusCallConnected) {
        this.resetTimer()
      }
    },
    resetTimer () {
      setTimeout(() => {
        this.countdownTimer = this.sessionSettings.warmup_period_in_seconds
      }, 500)
    },
    reRoute () {
      this.$emit('on-redirect', this.selectedList)
    },
    // resetTransfer () {
    //   this.transfer.userId = null
    //   this.transfer.ringGroupId = null
    //   this.transfer.phoneNumber = ''
    //   this.transfer.mode = 'user'
    // },
    managingSessionFlows (status = '') {
      let {
        togglePause,
        statusCallConnected,
        timerIsOver,
        flagged
      } = this
      switch (status) {
        // If Status is READY
        case 'READY':
          // if (this.toggleEnd) {
          //   this.reRoute()
          // }
          if (!statusCallConnected && timerIsOver && flagged) {
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
      console.log('Opening transfer on dialer...')
      // this.resetTransfer()
      // this.expansionEnabled = true
      // this.bottomExpansion = 'transfer'
      // setTimeout(() => {
      //   this.expanded = true
      // }, 50)
    },
    async onPreRunTask () {
      if (this.allTasksAreSkipped) {
        this.reRoute()
        return
      }
      await this.runTask()
    }
  },
  mounted () {
    this.$options.auto_dialer_interval = 'lfdsfsd'
  },
  watch: {
    countdownTimer () {
      if (this.timerIsOver) {
        if (this.wrapUp) {
          this.resetTimer()
          this.wrapUp = false
        }
        if (this.togglePause) {
          this.sessionPaused = true
        }
      }
    },
    currentCompany () {
      if (!this.autoDialer.outbound_campaign_id && this.togglePause) {
        // find default outbound campaign
        this.findDefaultOutboundCampaign()
      }
    },
    autoDialerTimerEnabled (val) {
      if (this.autoDialerTimerEnabled === true) {
        this.checkAutoDialer()
        // Check every 2 seconds
        this.$options.auto_dialer_interval = setInterval(this.checkAutoDialer, 2000)
      } else {
        clearInterval(this.$options.auto_dialer_interval)
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
    'powerDialerTasks.in_queue' (tasks) {
      if (tasks.length === 0 && !this.togglePause) {
        this.shouldRedirect = true
      }
      if (tasks.length > 0 && !this.flagged) {
        this.shouldRedirect = false
        this.initialize()
      }
      // setTimeout(() => {
      //   if (!this.hasQueuedTaskLists) {
      //     this.$generalNotification('Stopping PowerDialer: No more tasks found. You\'ve been redirected to PowerDialer main page.', 'error')
      //     this.reRoute()
      //   }
      // }, 2000)
    },
    currentSessionStatus (status) {
      // console.log(' %c CURRENT SESSION STATUS : ', 'background: red; color: white;', status)
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
      }
    }
  },
  data () {
    return {
      countdownStarted: false,
      countdownTimer: -1,
      countdownInterval: null,
      skippedTasks: [],
      autoDialerTimerEnabled: false,
      prevRoute: null,
      shouldRedirect: false,
      wrapUp: false,
      loading: false,
      statuses: {
        pause: false,
        end: false,
        recording: false,
        hold: false,
        next: false,
        mute: false
      },
      stats: {
        first_name: 'Jimmy',
        last_name: 'Raynor',
        phone_number: '(888) 217 1436',
        position: 'Sales Manager',
        company: 'AI Learning',
        address: 'Albany, New York',
        time: '6:15 PM',
        group: 'Google Map List',
        line: 'Bently Personal'
      },
      taskToCall: {},
      flagged: false,
      autoDialer: {
        outbound_campaign_id: null,
        ratio: 1
      }
    }
  }
}
</script>
