import { mapFields } from 'vuex-map-fields'
import { mapGetters, mapActions, mapState, mapMutations } from 'vuex'
import * as AutoDialTaskStatus from 'src/constants/power-dialer/task-status'
import moment from 'moment-timezone'
import { get } from 'lodash'
import * as AgentStatus from '../../constants/agent-status'

const DIRECTION = {
  top: 1,
  bottom: 2
}

export default {
  data () {
    return {
      skippedTasks: [],
      countdownInterval: null,
      callInProgress: false,
      countdownStarted: false,
      wrapUp: false,
      reRouteModal: false,
      loadingNext: false,
      sessionNotReady: false,
      skipWrapUp: false
    }
  },

  computed: {
    ...mapState('powerDialer', [
      'powerDialerTasks',
      'redialed'
    ]),

    ...mapState([
      'dialer'
    ]),

    ...mapFields('powerDialer', [
      'sessionCallStatuses',
      'sessionPaused',
      'activeTask',
      'ongoingSession',
      'countdownTimer',
      'isSessionRunning',
      'taskToCall',
      'hasActiveTask'
    ]),

    ...mapGetters('contacts', [
      'selectedList'
    ]),

    ...mapGetters('powerDialer', [
      'sessionLoader',
      'sessionSettings'
    ]),

    status () {
      return AutoDialTaskStatus.STATUSES
    },

    statusDisplayText () {
      if (!this.dialer.isReady) {
        return 'Offline'
      }

      switch (this.dialer?.currentStatus) {
        case 'READY':
          // reset call in-progress flag
          this.callInProgress = false

          if (this.timerIsOver || !this.isSessionRunning || this.reRouteModal) {
            return 'Ready'
          }

          if (this.wrapUp) {
            return `Wrap up <span class="text-weight-bold text-grey-7 text-lowercase">${this.countdownTimer >= 0 ? this.countdownTimer : 0}s</span>`
          }

          if (this.sessionPaused) {
            return 'Up Next'
          }

          if (this.countdownTimer > 0) {
            return `Will call in <span class="text-weight-bold text-grey-7 text-lowercase">${this.countdownTimer > 0 ? this.countdownTimer : 0}s</span>`
          }

          if (this.toggleEnd || this.togglePause) {
            return 'Ready'
          }

          return `Dialing...`
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
    },

    shouldSkip () {
      return this.sessionSettings.skip_outside_daytime_hours === 1
    },

    togglePause: {
      get () {
        return this.sessionCallStatuses.pause
      },
      set (val) {
        this.sessionCallStatuses.pause = val
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

    timerIsOver () {
      return this.countdownTimer === -1
    },

    powerDialerSettings () {
      const settings = this.profile.company.power_dialer_settings

      if (settings !== null && settings.open_time && settings.close_time) {
        return settings
      }

      return {
        open_time: '09:00:00',
        close_time: '18:00:00'
      }
    }
  },

  methods: {
    ...mapActions('contacts', ['setContact']),

    ...mapActions(['setShowPhone', 'setDialerContact']),

    ...mapActions('powerDialer', [
      'moveContactItems',
      'getSessionTaskByFilter',
      'addRedialedTask',
      'clearRedialedTasks'
    ]),

    ...mapMutations('powerDialer', [
      'TOGGLE_SESSION_LOADER'
    ]),

    ...mapActions('powerDialer', [
      'getContact'
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
      const timezone = this.taskToCall?.timezone
      // Time without timezone
      const startDay = moment.tz(this.powerDialerSettings.open_time, 'HH:mm:ss', timezone)
      const endDay = moment.tz(this.powerDialerSettings.close_time, 'HH:mm:ss', timezone)
      const contactLocalTime = moment.tz(moment.tz(timezone).format('HH:mm:ss'), 'HH:mm:ss', timezone)

      // If there is no contact TZ then
      // Use the company TZ
      if (this.shouldSkip && !timezone) {
        // Implement: Should skip single task
        this.skipSingleTask(this.taskToCall, 'Task is skipped because timezone has not been set for this contact. Pushed the task to the bottom of the list.')
        // this.moveTask(this.taskToCall, this.moveDirection.bottom)
        return
      }

      // Check if it's outside working hours or not
      if (this.shouldSkip && timezone && !contactLocalTime.isBetween(startDay, endDay)) {
        // Implement: Should skip single task
        this.skipSingleTask(this.taskToCall, 'Task is skipped because it\'s outside day times. Pushed the task to the bottom of the list.')
        // this.moveTask(this.taskToCall, this.moveDirection.bottom)
        return
      }

      // Check if the contact is DNC'ed
      if (this.taskToCall?.is_dnc) {
        this.cancelSingleTask(this.taskToCall, 'Task is removed because the contact is on DNC.')
        return
      }

      this.callInProgress = false

      // only proceed if task has a contact list item id and
      // dialer's status is ready
      if (!this.taskToCall?.contact_list_item_id || !this.dialer.isReady) {
        this.sessionNotReady = true
        return
      }

      this.hasActiveTask = true
      this.skipWrapUp = false

      // check if redial is true (this.redialedTask?.redialed_now) and if agent status is on call
      // then do not continue until agent status is not on call
      if (this.redialedTask?.redialed_now && this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL) {
        await new Promise(resolve => {
          const checkAgentStatus = setInterval(() => {
            if (this.profile.agent_status !== AgentStatus.AGENT_STATUS_ON_CALL) {
              clearInterval(checkAgentStatus)
              resolve()
            }
          }, 1000)
        })
      }

      // Fires an event to make a call
      this.$VueEvent.fire('makeCall', {
        currentNumber: this.$options.filters.fixPhone(`power_dialer_task:${this.taskToCall?.contact_list_item_id}`), // we know this already based on the list (Required)
        outboundCampaignId: this.sessionSettings.campaign_id, // this.session.campaignId, // ID of the line that you are calling from (Required)
        contactName: `${this.taskToCall?.first_name} ${this.taskToCall?.last_name}`, // this.contactListItem.name, // the name of the contact that you are calling (Optional but it's best to have it)
        companyName: this.taskToCall?.company_name, // this.contactListItem.company_name, // the name of the company of the contact (Optional but it's best to have it)
        contactId: this.taskToCall?.id // this.contactListItem.contact_id // the ID of the contact (Optional but it's best to have it)
      })

      this.setDialerContact(this.activeTask)
      this.callInProgress = true
    },

    skipSingleTask (autoDialTask, message, skipTask = false) {
      const contactListItemId = get(autoDialTask, 'contact_list_item_id', null)

      if (!contactListItemId) {
        return
      }

      return this.$axios.post(`/api/v2/power-dialer-list-items/${contactListItemId}/skip`)
        .then(res => {
          if (!this.skippedTasks.includes(contactListItemId)) {
            this.skippedTasks.push(contactListItemId)
          }
          // if (autoDialTask.status !== AutoDialTaskStatus.STATUS_QUEUED) {
          //   // add to bottom of list
          //   // autoDialTask.direction = PowerDialer.DIRECTION_BOTTOM
          //   this.addTaskToList(autoDialTask)
          // }
          // this.skipped_list.push(autoDialTask.id)
          this.$generalNotification(message, 'warning')
          this.onNextTask()
          return Promise.resolve(res)
        }).catch(err => {
          // this.$handleErrors(err.response)
          return Promise.reject(err)
        })
    },

    cancelSingleTask (autoDialTask, message) {
      const contactListItemId = get(autoDialTask, 'contact_list_item_id', null)

      if (!contactListItemId) {
        return
      }

      return this.$axios.post(`/api/v2/power-dialer-list-items/${contactListItemId}/cancel`, { reason: message })
        .then(res => {
          this.$generalNotification(message, 'warning')
          this.onNextTask(true, true)
          return Promise.resolve(res)
        }).catch(err => {
          // this.$handleErrors(err.response)
          return Promise.reject(err)
        })
    },

    redialTask (autoDialTask, redial) {
      const contactListItemId = get(autoDialTask, 'contact_list_item_id', null)

      if (!contactListItemId) {
        return
      }

      return this.$axios.post(`/api/v2/power-dialer-list-items/${contactListItemId}/skip`, { redial })
        .then(res => {
          this.addRedialedTask(autoDialTask.id)

          const position = redial ? 'top' : 'bottom'
          this.$generalNotification(`Success: contact is at the ${position} of the current list`)
          return Promise.resolve(res)
        }).catch(err => {
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
