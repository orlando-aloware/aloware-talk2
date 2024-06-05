<template>
  <q-card flat>
    <div class="t-menu-2 no-border">
      <div class="d-flex align-items-center pt-3 px-3 pb-0 flex-wrap justify-content-between">

        <div class="font-weight-bold flex-grow-1 session-call-status w-100"
             style="max-width: 176px;">
          <q-chip color="grey-50"
                  class="p-0">
            <div :class="`text-15 text-lowercase text-capitalize px-2`"
                 v-html="statusDisplayText">
            </div>
          </q-chip>
        </div>

        <div class="w-100"
             style="max-width: 370px;">
          <q-btn class="sessions-button my-1 ml-1"
                 size="sm"
                 style="width: 79.55px;"
                 no-wrap
                 no-caps
                 unelevated
                 outline
                 :color="statusCallConnected ? 'grey-4' : 'grey-8'"
                 :disabled="!statusCallConnected"
                 @click="onToggleMute">
            <mute-icon class="mr-1"
                       :width="12"
                       :height="12"
                       v-show="!toggleMute">
            </mute-icon>
            <unmute-icon class="mr-1"
                         :width="12"
                         :height="12"
                         v-show="toggleMute">
            </unmute-icon>
            <div class="text-body2 text-black">
              {{ muteText }}
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

          <q-btn-dropdown
            class="sessions-button free-width my-1 ml-1"
            size="sm"
            no-wrap
            unelevated
            no-caps
            left
            :auto-close="true"
            :disable="!canRedialNow && !canRedialLater"
            :color="canRedialNow || canRedialLater ? 'blue-7' : 'grey-8'">
            <template v-slot:label>
              <RefreshIcon class="mr-2"
                           color="white"/>
              <div class="text-body2">
                <q-tooltip content-class="bg-grey-light11"
                           anchor="bottom middle"
                           self="center middle"
                           v-if="dialer.currentStatus === 'CALL_CONNECTED' && !canRedialNow && !canRedialLater">
                  This contact has already been redialed once
                </q-tooltip>
                Redial
              </div>
            </template>

            <q-list>
              <q-item v-for="option in redialOptions"
                      :key="option.value"
                      unelevated
                      clickable
                      v-close-popup
                      :disable="option.value === 'now' ? !canRedialNow : !canRedialLater"
                      :color="canRedialNow || canRedialLater  ? 'blue-7' : 'grey-8'"
                      @click="onRedial(option.redial)">
                <q-item-section>
                  <q-item-label class="ml-2">
                    <q-tooltip content-class="bg-grey-light11"
                               anchor="center left"
                               self="center right"
                               v-if="dialer.currentStatus === 'CALL_CONNECTED'">
                      {{ option.tooltip }}
                    </q-tooltip>
                    <i :class="option.icon"></i> {{ option.label }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-btn v-if="statusCallConnected" class="sessions-button free-width my-1 ml-1"
                 size="sm"
                 no-wrap
                 unelevated
                 no-caps
                 color="red-7"
                 @click="hangupCall">
            <HangupIcon class="mr-1"
                        color="white"/>
            <div class="text-body2">End Call</div>
          </q-btn>

          <q-btn class="sessions-button my-1 ml-1 free-width"
                 size="sm"
                 no-wrap
                 no-caps
                 unelevated
                 outline
                 :class="canNextTask ? 'border border-danger' : ''"
                 :color="canNextTask ? 'grey-4' : 'grey-8'"
                 :disabled="!canNextTask"
                 @click="onNextTask(false, true)">
            <PlayBarIcon class="mr-1"
                         :color="canNextTask ? '#FF3B3B' : '#62666E'"
            />
            <div class="text-body2" :class="canNextTask ? 'text-red-7' : 'white'">Next</div>
          </q-btn>

          <b-dropdown class="my-1 ml-1 b-compact-dropdown-button text-bold dropdown-white contacts-options-dropdown"
                      text="..."
                      right size="sm"
                      variant="white"
                      no-caret>
            <template #button-content>
              <i class="fa fa-ellipsis-h"/>
            </template>
            <b-dropdown-item v-if="hasPermissionTo('toggle block contact') && !(taskToCall?.is_dnc)"
                             href="#"
                             :disabled="isProcessingDNC"
                             @click="dncContact">
              <q-spinner-bars v-if="isProcessingDNC"
                              class="mr-1"
                              color="blue"/>
              <i class="fa fa-ban"></i>
              DNC
            </b-dropdown-item>
            <b-dropdown-item href="#"
                             :disabled="!statusCallConnected"
                             @click="openDialPad">
              <DialPadIcon/>
              Dial Pad
            </b-dropdown-item>
            <b-dropdown-item href="#"
                             :disabled="!statusCallConnected"
                             @click="openAdd">
              <AddUserIcon color="#62666E"/>
              Add
            </b-dropdown-item>
            <b-dropdown-item href="#"
                             :disabled="!statusCallConnected"
                             @click="openTransfer">
              <TransferIcon color="#62666E"/>
              Transfer
            </b-dropdown-item>
            <b-dropdown-item href="#"
                             disabled>
              <CalendarIcon/>
              Schedule Callback
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </div>

      <div class="d-flex align-items-center p-0">
        <div class="text-18 font-weight-bold pl-3 pt-2 flex-grow-1">
          {{ fullName }}
          <span class="text-15 text-subtitle1">
            {{ phoneNumber }}
          </span>
        </div>
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

        <q-btn class="sessions-button free-width ml-1"
               size="sm"
               color="grey-4"
               no-wrap
               outline
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
      </div>

      <div class="d-flex align-items-center p-0 pt-2 pb-2 justify-content-between flex-wrap px-3">
        <div class="flex-grow-1 text-16 text-capitalize text-weight-normal m-1">

          <div id="session-list-name">
            {{ selectedListName }}
          </div>

          <b-popover target="session-list-name"
                     triggers="hover"
                     placement="left">
            <template #title>
              List name
            </template>
            {{ selectedListName }}
          </b-popover>

          <span class="text-subtitle2 text-grey"/>
          <div class="text-10 pt-1">
            <HeadphoneIcon width="12px"
                           height="12px"
                           class="mr-0 py-0"
                           style="position:relative;top:-2px;"/>
            {{ lineName }}
          </div>

        </div>

        <div>
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
import DialPadIcon from 'components/icons/dialpad-icon'
import TransferIcon from 'components/icons/transfer-icon-2'
import AddUserIcon from 'components/icons/add-user-icon-2'
import CalendarIcon from 'components/icons/calendar-icon'
import DropIcon from 'components/icons/drop-location-icon'
import HeadphoneIcon from 'components/icons/headphone-icon'
import PauseIcon from 'components/icons/pause-icon-2'
import UnHoldIcon from 'components/icons/pause-icon-3'
import RefreshIcon from 'components/icons/refresh-icon'
import StopIcon from 'components/icons/stop-icon'
import EndCallIcon from 'components/icons/stop-icon-2'
import RecordIcon from 'components/icons/record-icon'
import {
  sessionCallStatusMixin,
  dialerWrapUpMixin, aclMixin
} from 'src/plugins/mixins'
import { cloneDeep } from 'lodash'
import MuteIcon from 'components/icons/mute-icon'
import UnmuteIcon from 'components/icons/unmute-icon'
import talk2Api from 'src/plugins/api/api'
import PlayBarIcon from 'components/icons/play-bar-icon.vue'
import HangupIcon from 'components/icons/hangup-icon.vue'

export default {
  name: 'SessionCallStatus',

  components: {
    HangupIcon,
    PlayBarIcon,
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
    StopIcon,
    EndCallIcon,
    RecordIcon,
    RefreshIcon
  },

  mixins: [
    aclMixin,
    sessionCallStatusMixin,
    dialerWrapUpMixin
  ],

  data () {
    return {
      loading: false,
      autoDialer: {
        outbound_campaign_id: null,
        ratio: 1
      },
      redirectDelay: 3000
    }
  },

  computed: {
    getLine () {
      return this.campaigns.find((line) => line.id === this.activeTask?.task?.communication?.campaign_id)
    },

    toggleMute () {
      return this.dialer.isMuted
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

    statusReady () {
      return this.dialer.currentStatus === 'READY'
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

    redialOptions () {
      let redialLaterTooltip = 'This contact will go to the bottom of the current session list'

      // if we can redial now but not later it means we reached the end of the list
      if (this.canRedialNow && !this.canRedialLater) {
        redialLaterTooltip = 'Can not redial later, this contact is the last one in the list'
      }

      return [
        {
          label: 'Redial Now',
          value: 'now',
          icon: 'fas fa-bolt',
          tooltip: 'This contact will stay on top of the current session list and will be redialed immediately',
          redial: true
        },
        {
          label: 'Redial Later',
          value: 'later',
          icon: 'fas fa-arrow-down',
          tooltip: redialLaterTooltip,
          redial: false
        }
      ]
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
    onToggleMute () {
      this.$VueEvent.fire('toggleMute')
    },

    openAdd () {
      this.$VueEvent.fire('togglePhone')
      this.sessionPhoneExpansion = 'add'
    },

    dncContact () {
      if (this.isProcessingDNC) {
        return
      }

      this.$bvModal.msgBoxConfirm('DNC will disable all communications to a contact and is irreversible. Do you wish to continue?', {
        okTitle: 'Yes',
        cancelTitle: 'No'
      }).then(value => {
        if (value) {
          this.isProcessingDNC = true
          talk2Api.V1.contact.update(this.taskToCall.id, { is_dnc: 1 }).then(response => {
            this.isProcessingDNC = false
            this.cancelSingleTask(this.taskToCall, 'DNC')
          })
        }
      })
    },

    openDialPad () {
      this.$VueEvent.fire('togglePhone')
      this.sessionPhoneExpansion = 'dialpad'
    },

    openTransfer () {
      this.$VueEvent.fire('togglePhone')
      this.sessionPhoneExpansion = 'transfer'
    },

    async onNextTaskWhenOnWrapUp () {
      this.onPhoneExpansionReset()
      this.wrapUp = false
      this.taskToCall = cloneDeep(this.powerDialerTasks.in_queue[0])

      if (this.taskToCall) {
        this.processRemoveFirstInQueueTask()
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

        return
      }

      if (this.dialer.currentStatus === 'WRAP_UP') {
        this.$VueEvent.fire('endWrapUp')
      }

      this.hasActiveTask = false
      this.reRoute()
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
