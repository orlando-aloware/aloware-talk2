<template>
  <q-card flat>
    <div class="">
      <div class="d-flex p-2 flex-wrap justify-content-between align-items-center bg-white">

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

        <q-btn class="my-1 sessions-button free-width ml-2"
               size="sm"
               no-wrap
               outline
               no-caps
               :disable="true"
        >
          <div class="text-body2 text-black">
            DISPOSITIONS
          </div>

          <i class="material-icons font-weight-bold text-body2">keyboard_arrow_right</i>
        </q-btn>

        <q-btn class="my-1 ml-2"
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

        <q-btn class="sessions-button free-width ml-2"
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

        <q-btn class="sessions-button my-1 ml-2"
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
import DropIcon from 'components/icons/drop-location-icon'
import PauseIcon from 'components/icons/pause-icon-2'
import UnHoldIcon from 'components/icons/pause-icon-3'
import StopIcon from 'components/icons/stop-icon'
import EndCallIcon from 'components/icons/stop-icon-2'
import RecordIcon from 'components/icons/record-icon'
import {
  sessionCallStatusMixin,
  dialerWrapUpMixin, aclMixin
} from 'src/plugins/mixins'
import PlayBarIcon from 'components/icons/play-bar-icon'
import HangupIcon from 'components/icons/hangup-icon.vue'

export default {
  name: 'SessionCallMinimizedDetails',

  components: {
    HangupIcon,
    PlayBarIcon,
    DropIcon,
    PauseIcon,
    UnHoldIcon,
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
      loading: false,
      autoDialer: {
        outbound_campaign_id: null,
        ratio: 1
      },
      redirectDelay: 3000
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
