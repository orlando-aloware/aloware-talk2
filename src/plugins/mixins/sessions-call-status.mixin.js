import { mapFields } from 'vuex-map-fields'
import { mapGetters, mapActions, mapState } from 'vuex'
import * as AutoDialTaskStatus from 'src/constants/power-dialer/task-status'
import moment from 'moment-timezone'

const DIRECTION = {
  top: 1,
  bottom: 2
}

export default {
  data () {
    return {
      callInProgress: false
    }
  },
  computed: {
    ...mapState('powerDialer', ['powerDialerTasks']),
    ...mapFields('powerDialer', [
      'sessionPaused',
      'activeTask',
      'ongoingSession',
      'countdownTimer'
    ]),
    ...mapGetters('contacts', [
      'selectedList'
    ]),
    status () {
      return AutoDialTaskStatus.STATUSES
    },
    statusDisplayButton () {
      if (!this.dialer.isReady) {
        return 'Offline'
      }

      switch (this.dialer?.currentStatus) {
        case 'READY':
          if (this.timerIsOver) {
            return 'Ready'
          }
          if (this.wrapUp) {
            return `Wrap up <span class="text-weight-bold text-grey-7 text-lowercase">${this.countdownTimer >= 0 ? this.countdownTimer : 0}s</span>`
          }
          if (this.sessionPaused) {
            return 'Up Next'
          } else {
            if (this.countdownTimer > 0) {
              return `Will call in <span class="text-weight-bold text-grey-7 text-lowercase">${this.countdownTimer > 0 ? this.countdownTimer : 0}s</span>`
            } else {
              if (this.toggleEnd || this.togglePause) {
                return 'Ready'
              }
              return `Dialing...`
            }
          }
        case 'WRAP_UP':
          return `Wrap Up <span class="text-weight-bold text-grey-7 text-lowercase">${this.countdownTimer >= 0 ? this.countdownTimer : 0}s</span>`
        case 'MAKING_CALL':
          return `Dialing...`
        case 'ANSWERING_CALL':
          return 'Answering Call'
        case 'REJECTING_CALL':
          return 'Rejecting Call'
        case 'CALL_CONNECTED':
          return `Connected <span class="text-weight-bold text-grey-7 text-lowercase">${this.dialer.timer}</span>`
        case 'HANGING_UP_CALL':
          return 'Hanging Up Call'
        case 'CALL_DISCONNECTED':
          return 'Call Disconnected'
        case 'OFFLINE':
        default:
          return 'Offline'
      }
    },
    moveDirection () {
      return DIRECTION
    }
  },
  methods: {
    ...mapActions('contacts', ['setContact']),
    ...mapActions(['setShowPhone']),
    ...mapActions('powerDialer', [
      'moveContactItems',
      'getSessionTaskByFilter'
    ]),

    async fetchContact (taskId = null) {
      if (!taskId) {
        this.isSessionRunning = false
        return
      }

      this.TOGGLE_SESSION_LOADER(true)
      await this.getContact({ id: taskId })
      if (!this.isSessionRunning) {
        this.isSessionRunning = true
      }
    },

    async runTask () {
      let timezone = this.taskToCall?.timezone
      // If there is no contact TZ then
      // Use the company TZ
      if (this.shouldSkip && !timezone) {
        // Implement: Should skip single task
        this.skipSingleTask(this.taskToCall, 'Task is skipped because timezone has not been set for this contact. Pushed the task to the bottom of the list.')
        // this.moveTask(this.taskToCall, this.moveDirection.bottom)
        return
      }
      // Check if it's outside working hours or not
      if (this.shouldSkip && timezone) {
        // Time without timezone
        const startDay = moment.tz(this.powerDialerSettings.open_time, 'HH:mm:ss', timezone)
        const endDay = moment.tz(this.powerDialerSettings.close_time, 'HH:mm:ss', timezone)
        const contactLocalTime = moment.tz(moment.tz(timezone).format('HH:mm:ss'), 'HH:mm:ss', timezone)

        if (!contactLocalTime.isBetween(startDay, endDay)) {
          // Implement: Should skip single task
          this.skipSingleTask(this.taskToCall, 'Task is skipped because it\'s outside day times. Pushed the task to the bottom of the list.')
          // this.moveTask(this.taskToCall, this.moveDirection.bottom)
          return
        }
      }

      if (this.taskToCall?.contact_list_item_id) {
        // Fires an event to make a call
        this.hasActiveTask = true
        this.$VueEvent.fire('makeCall', {
          currentNumber: this.$options.filters.fixPhone(`power_dialer_task:${this.taskToCall?.contact_list_item_id}`), // we know this already based on the list (Required)
          outboundCampaignId: this.sessionSettings.campaign_id, // this.session.campaignId, // ID of the line that you are calling from (Required)
          contactName: `${this.taskToCall?.first_name} ${this.taskToCall?.last_name}`, // this.contactListItem.name, // the name of the contact that you are calling (Optional but it's best to have it)
          companyName: this.taskToCall?.company_name, // this.contactListItem.company_name, // the name of the company of the contact (Optional but it's best to have it)
          contactId: this.taskToCall?.id // this.contactListItem.contact_id // the ID of the contact (Optional but it's best to have it)
        })
        this.callInProgress = true
      } else {
        // this.$generalNotification('A missing detail in contact is found. Unable to make a call.', 'error')
        this.callInProgress = false
      }
    },

    skipSingleTask (autoDialTask, message, skipTask = false) {
      if (!autoDialTask.contact_list_item_id) {
        return
      }

      this.loading_skip = true
      return this.$axios.post(`/api/v2/power-dialer-list-items/${autoDialTask.contact_list_item_id}/skip`)
        .then(res => {
          if (!this.skippedTasks.includes(autoDialTask.contact_list_item_id)) {
            this.skippedTasks.push(autoDialTask.contact_list_item_id)
          }
          // if (autoDialTask.status !== AutoDialTaskStatus.STATUS_QUEUED) {
          //   // add to bottom of list
          //   // autoDialTask.direction = PowerDialer.DIRECTION_BOTTOM
          //   this.addTaskToList(autoDialTask)
          // }
          // this.skipped_list.push(autoDialTask.id)
          // this.loading_skip = false
          this.$generalNotification(message, 'warning')
          return Promise.resolve(res)
        }).catch(err => {
          // this.$root.handleErrors(err.response)
          // this.loading_skip = false
          return Promise.reject(err)
        })
    },

    clearWarmUpCountDown () {
      this.countdownTimer = -1
      clearInterval(this.countdownInterval)
      setTimeout(() => {
        this.countdownStarted = false
      }, 1000)
    },

    skipTask () {
      if (!this.activeTask) {
        return
      }
      if (this.callInProgress) {
        this.$VueEvent.fire('hangupCall')
      }
    },

    addTaskToList () {
      // TODOs: Add task to list
    },

    removeTaskFromList () {
      // TODOs: Remove task from list
    }
  }
}
