import { mapFields } from 'vuex-map-fields'
import { mapGetters, mapActions } from 'vuex'
import * as AutoDialTaskStatus from 'src/constants/power-dialer/task-status'
import moment from 'moment-timezone'

// import { isEmpty } from 'lodash'
export default {
  data () {
    return {
      callInProgress: false
    }
  },
  computed: {
    ...mapFields('powerDialer', [
      'sessionPaused',
      'activeTask',
      'powerDialerTasks'
    ]),
    ...mapGetters('contacts', [
      'listItems',
      'selectedList'
    ]),
    list () {
      return this.listItems[this.selectedList?.id]?.data
    },
    status () {
      return AutoDialTaskStatus.STATUSES
    },
    statusDisplayButton () {
      switch (this.dialer?.currentStatus) {
        case 'READY':
          if (this.sessionPaused) {
            return 'Up Next'
          } else if ((!this.toggleEnd || !this.togglePause) && !this.wrapUp) {
            return `Will call in <span class="text-weight-bold text-grey-7 text-lowercase">${this.timerCount >= 0 ? this.timerCount : 0}s</span>`
          } else {
            return `Wrap up <span class="text-weight-bold text-grey-7 text-lowercase">${this.timerCount >= 0 ? this.timerCount : 0}s</span>`
          }
        case 'WRAP_UP':
          return `Wrap Up <span class="text-weight-bold text-grey-7 text-lowercase">${this.timerCount >= 0 ? this.timerCount : 0}s</span>`
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
        default:
          return `Will call in <span class="text-weight-bold text-grey-7 text-lowercase">${this.timerCount >= 0 ? this.timerCount : 0}s</span>`
      }
    }
  },
  methods: {
    ...mapActions(['setShowPhone']),
    async nextContact () {
      this.$VueEvent.fire('hangupCall')
    },
    async fetchNextContact () {
      this.taskToCall = this.powerDialerTasks.in_queue[0]
      if (this.taskToCall?.id) {
        await this.fetchContact(this.taskToCall?.id)
      }
    },
    async fetchContact (taskId = '') {
      this.TOGGLE_SESSION_LOADER(true)
      let res = null
      res = await this.getContact({ id: taskId })
      if (!this.flagged) {
        this.activeTask = res
        this.flagged = true
      }
      console.log(` %c Fetching contact for current task ${taskId} : `, 'color:yellow;background:black;', res)
    },
    async runTask () {
      let timezone = this.taskToCall?.timezone
      let data = {
        currentNumber: this.$options.filters.fixPhone(`power_dialer_task:${this.taskToCall?.contact_list_item_id}`), // we know this already based on the list (Required)
        outboundCampaignId: this.sessionSettings.campaign_id, // this.session.campaignId, // ID of the line that you are calling from (Required)
        contactName: `${this.taskToCall?.first_name} ${this.taskToCall?.last_name}`, // this.contactListItem.name, // the name of the contact that you are calling (Optional but it's best to have it)
        companyName: this.taskToCall?.company_name, // this.contactListItem.company_name, // the name of the company of the contact (Optional but it's best to have it)
        contactId: this.taskToCall?.id // this.contactListItem.contact_id // the ID of the contact (Optional but it's best to have it)
      }
      console.log('TIMEZONE : ', timezone)

      // If there is no contact TZ then
      // Use the company TZ
      if (this.shouldSkip && !timezone) {
        console.log(`Skipped Task #${this.taskToCall.id} because contact did not have timezone.`)
        // TODOs:
        // Implement: Should skip single task
        this.skipSingleTask(this.taskToCall, 'Task is skipped because timezone has not been set for this contact. Pushed the task to the bottom of the list.')
        return
      }
      // Check if it's outside working hours or not
      if (this.shouldSkip && timezone) {
        // Time without timezone
        const startDay = moment.tz(this.powerDialerSettings.open_time, 'HH:mm:ss', timezone)
        const endDay = moment.tz(this.powerDialerSettings.close_time, 'HH:mm:ss', timezone)
        const contactLocalTime = moment.tz(moment.tz(timezone).format('HH:mm:ss'), 'HH:mm:ss', timezone)

        console.log('contactLocalTime :>> ', contactLocalTime.isBetween(startDay, endDay))
        if (contactLocalTime.isBetween(startDay, endDay)) {
          console.log(`Skipped task #${this.taskToCall.id} in ${timezone} timezone because it was outside day times. ` + contactLocalTime.format('h:mm a') + ' is not in between ' + startDay.format('h:mm a') + ' - ' + endDay.format('h:mm a'))
          // TODOs:
          // Implement: Should skip single task
          this.skipSingleTask(this.taskToCall, 'Task is skipped because it\'s outside day times. Pushed the task to the bottom of the list.')
          return
        }
      }

      console.log('RUNNING TASK : ', data)
      if (this.taskToCall?.contact_list_item_id) {
        // Fires an event to make a call
        // this.$VueEvent.fire('makeCall', data)
        this.callInProgress = true
      } else {
        // this.$generalNotification('A missing detail in contact is found. Unable to make a call.', 'error')
        this.callInProgress = false
      }
    },
    skipSingleTask (autoDialTask, message, skipTask = false) {
      this.loading_skip = true
      return this.$axios.post(`/api/v2/power-dialer-list-items/${autoDialTask.id}/skip`)
        .then(res => {
          console.log('SKIP: res :>> ', res)
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
