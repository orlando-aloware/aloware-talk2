<template>
  <q-card flat :disabled="sessionLoader || hasDefaultContact">
    <div class="t-menu-2 no-border">
      <div class="d-flex align-items-center pt-2 pb-0">
        <div class="font-weight-bold pl-3 flex-grow-1">
          <q-chip color="grey-50" class="p-0">
            <div
              :class="`text-15 text-lowercase text-capitalize px-2`"
              v-html="currentCallStatusDisplay">
              <!-- {{ timerCount > 0 ? 'Will call in' : 'Connected: ' }}
              <span
                class="text-weight-bold text-grey-7 text-lowercase"
                v-if="timerCount > 0">
                {{ timerCount }}s
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
          :color="togglePause ? 'grey-5' : 'grey-4'"
          class="sessions-button free-width mx-1"
          :disabled="togglePause">
          <UnholdIcon v-if="toggleHold" class="mr-2" color="#F2994A" />
          <PauseIcon v-else class="mr-2" color="#62666E" />
          <div class="text-body2 text-black">
            {{ toggleHold ? 'Unhold' : 'Hold' }}
          </div>
        </q-btn>
        <q-btn
          @click="nextContact"
          no-wrap unelevated no-caps
          :disabled="(timerCount !== 0 || togglePause) || !statusCallConnected"
          size="sm" :color="togglePause ? 'grey-7' : 'red-7'"
          class="sessions-button free-width mx-1">
          <CallDropIcon class="mr-2" color="white" />
          <div class="text-body2">Next</div>
        </q-btn>
        <b-dropdown
          text="..."
          no-caret
          right size="sm"
          variant="white"
          class="m-1 b-compact-dropdown-button text-bold dropdown-white contacts-options-dropdown">
          <template #button-content>
            <i class="fa fa-ellipsis-h"></i>
          </template>
          <b-dropdown-item href="#">
            <DialPadIcon />
            Dial Pad
          </b-dropdown-item>
          <b-dropdown-item href="#">
            <AddUserIcon color="#62666E" />
            Add
          </b-dropdown-item>
          <b-dropdown-item href="#">
            <TransferIcon color="#62666E" />
            Transfer
          </b-dropdown-item>
          <b-dropdown-item href="#">
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
        <div class="flex-grow-1 text-14 text-subtitle1 text-capitaliz pl-3 py-0">
          <DropIcon
            width="18px"
            height="18px"
            class="mr-0 py-0"
            style="position:relative;top:-2px;" />
          {{ address }} - {{ taskCreatedAt | fixTime }}
        </div>
        <q-btn
          @click="onToggleMute"
          no-wrap outline no-caps
          size="sm" color="grey-4"
          :disabled="timerCount !== 0"
          class="sessions-button free-width mx-1">
          <MuteIcon height="13px" class="mr-2" color="#62666E" />
          <div class="text-body2 text-black">
            {{ toggleMute ? 'Unmute' : 'Mute' }}
          </div>
        </q-btn>
        <q-btn
          @click="onToggleRecording"
          no-wrap outline no-caps
          size="sm" color="grey-4"
          :disabled="timerCount !== 0"
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
          @click="togglePause = !togglePause"
          :color="`${togglePause ? 'red-3' : 'grey-4'}`"
          unelevated outline
          no-wrap no-caps size="sm"
          :disabled="timerCount !== 0"
          :class="`${togglePause ? 'bg-btn-red' : ''} sessions-button free-width mx-1`">
          <PauseIcon class="mr-2" color="#62666E" />
          <div class="text-body2 text-black">
            {{ togglePause ? 'Unpause Session' : 'Pause Session' }}
          </div>
        </q-btn>
        <q-btn
          no-wrap outline no-caps
          size="sm" color="grey-4"
          :disabled="timerCount !== 0"
          class="sessions-button free-width mx-1">
          <EndCallIcon class="mr-2" color="#62666E" />
          <div class="text-body2 text-black">End Session</div>
        </q-btn>
      </div>
    </div>
  </q-card>
</template>

<script>

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
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
import MuteIcon from 'components/icons/mute-icon'
import * as AutoDialTaskStatus from 'src/constants/power-dialer/task-status'
import sessionsMixins from './sessions'
import { isEmpty } from 'lodash'

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
    RecordIcon,
    MuteIcon
  },
  mixins: [ sessionsMixins ],
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.prevRoute = from
    })
  },
  computed: {
    ...mapState([
      'campaigns',
      'dialer'
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
    hasExistingTaskList () {
      return this.powerDialerTasks.in_queue.length > 0
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
      return this.campaigns.find((line) => line.id === this.currentTask?.communication?.campaign_id)
    },
    togglePause: {
      get () {
        return this.statuses.pause
      },
      set (val) {
        this.statuses.pause = val
      }
    },
    toggleRecording: {
      get () {
        return this.statuses.recording
      },
      set (val) {
        this.statuses.recording = val
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
    toggleMute: {
      get () {
        return this.statuses.mute
      },
      set (val) {
        this.statuses.mute = val
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
    taskCreatedAt () {
      return this.taskToCall?.created_at || ''
    },
    statusCallConnected () {
      return this.dialer.currentStatus === 'CALL_CONNECTED'
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      'getContact'
    ]),
    ...mapMutations('powerDialer', [
      'TOGGLE_SESSION_LOADER'
    ]),
    async nextContact () {
      this.TOGGLE_SESSION_LOADER(true)
      this.$VueEvent.fire('hangupCall')
      this.taskToCall = this.powerDialerTasks.in_queue[0]
      await this.getContact({ id: this.taskToCall.id })
      this.TOGGLE_SESSION_LOADER(false)
      // this.runTask()
    },
    async tickTimer () {
      if (this.hasExistingTaskList) {
        if (this.timerCount > 0) {
          setTimeout(() => {
            this.timerCount--
          }, 1000)
        } else if (this.timerCount === 0) {
          if (!this.togglePause) {
            setTimeout(async () => {
              await this.runTask()
            }, 1000)
          }
        }
      }
    },
    initialize () {
      this.TOGGLE_SESSION_LOADER(false)
      if (this.hasExistingTaskList) {
        this.taskToCall = this.powerDialerTasks.in_queue[0]
      }
      this.timerCount = this.sessionSettings.warmup_period_in_seconds
    },
    onToggleMute () {
      this.toggleMute = !this.toggleMute
      this.$VueEvent.fire('toggleMute')
    },
    onToggleHold () {
      this.toggleHold = !this.toggleHold
      this.$VueEvent.fire('toggleHold')
    },
    onToggleRecording () {
      this.toggleRecording = !this.toggleRecording
      this.$VueEvent.fire('toggleRecordingStatus')
    }
  },
  watch: {
    async activeTask (task) {
      if (!task?.id && !this.hasExistingTaskList) {
        let routePath = '/power-dialer'
        if (this.selectedList.name !== 'My Queue') {
          routePath += `/${this.selectedList.id}`
        }
        this.$router.push(routePath)
      }
      if (task?.id) {
        await this.getContact({ id: task.id })
      }
      // if (obj?.id) {
      //   setTimeout(() => {
      //     this.timerCount = this.sessionSettings.warmup_period_in_seconds
      //   }, this.timerCount)
      //   setTimeout(async () => {
      //     await this.getContact({ id: obj[this.keyIndex].id })
      //   }, 500)
      // }
      // setTimeout(async () => {
      //   await this.getContact({ id: obj[this.keyIndex].id })
      // }, 500)
    },
    timerCount: {
      async handler (value) {
        await this.tickTimer()
      },
      deep: true
      // immediate: true // This ensures the watcher is triggered upon creation
    },
    async hasExistingTaskList (isTrue) {
      if (isTrue) {
        await this.tickTimer()
      }
    },
    'dialer.currentStatus' (callStatus) {
      console.log('Status: ', callStatus)
      switch (callStatus) {
        case 'HANGING_UP_CALL':
          this.taskToCall = this.powerDialerTasks.in_queue[0]
          this.timerCount = this.sessionSettings.warmup_period_in_seconds
          break
        default:
      }
    },
    'powerDialerTasks.in_queue' (tasks) {
      if (tasks.length > 0) {
        this.initialize()
      }
    }
  },
  data () {
    return {
      prevRoute: null,
      currentTask: {},
      timerCount: -1,
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
      taskToCall: {}
    }
  }
}
</script>
