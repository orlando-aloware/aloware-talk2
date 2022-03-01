import { mapFields } from 'vuex-map-fields'
import { mapActions } from 'vuex'
import * as AutoDialTaskStatus from 'src/constants/power-dialer/task-status'
// import { isEmpty } from 'lodash'
export default {
  data () {
    return {
      callInProgress: false
    }
  },
  computed: {
    ...mapFields('powerDialer', [
      'activeTask',
      'powerDialerTasks'
    ]),
    status () {
      return AutoDialTaskStatus.STATUSES
    },
    statusDisplayButton () {
      switch (this.dialer?.currentStatus) {
        case 'READY':
          if (!this.toggleEnd || !this.togglePause) {
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
    async runTask () {
      let data = {
        currentNumber: this.$options.filters.fixPhone(`power_dialer_task:${this.taskToCall?.contact_list_item_id}`), // we know this already based on the list (Required)
        outboundCampaignId: this.sessionSettings.campaign_id, // this.session.campaignId, // ID of the line that you are calling from (Required)
        contactName: `${this.taskToCall?.first_name} ${this.taskToCall?.last_name}`, // this.contactListItem.name, // the name of the contact that you are calling (Optional but it's best to have it)
        companyName: this.taskToCall?.company_name, // this.contactListItem.company_name, // the name of the company of the contact (Optional but it's best to have it)
        contactId: this.taskToCall?.id // this.contactListItem.contact_id // the ID of the contact (Optional but it's best to have it)
      }
      console.log(data)
      if (this.taskToCall?.contact_list_item_id) {
        // Fires an event to make a call
        // this.$VueEvent.fire('makeCall', data)
        this.callInProgress = true
      } else {
        // this.$generalNotification('A missing detail in contact is found. Unable to make a call.', 'error')
        this.callInProgress = false
      }
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
    },
    updateTaskStatus (task) {
      this.currentTask = task
      switch (task.task_status) {
        case AutoDialTaskStatus.STATUS_IN_PROGRESS:
          // console.log(' %c Changing status to : IN_PROGRESS ', 'background: yellow; color: black;')
          this.activeTask = this.list.find(lst => lst.id === task.contact_id)
          this.powerDialerTasks.in_queue = this.powerDialerTasks.in_queue.filter(lst => lst.id !== task.contact_id)
          // console.log(`NUMBER: ${this.powerDialerTasks.in_queue.length}`, this.powerDialerTasks.in_queue)
          break
        case AutoDialTaskStatus.STATUS_COMPLETED:
          // console.log(' %c Changing status to : COMPLETED/CALLED ', 'background: yellow; color: black;')
          this.powerDialerTasks.called.push(this.activeTask)
          this.$VueEvent.fire('endWrapUp')
          this.activeTask = {}
          break
        case AutoDialTaskStatus.STATUS_FAILED:
          // console.log(' %c Changing status to : FAILED ', 'background: yellow; color: black;')
          this.powerDialerTasks.failed.push(this.activeTask)
          this.$VueEvent.fire('endWrapUp')
          this.activeTask = {}
          break
        case AutoDialTaskStatus.STATUS_QUEUED:
          // console.log(' %c Changing status to : IN_QUEUE ', 'background: yellow; color: black;')
          // this.powerDialerTasks.in_queue.push(this.activeTask)
          break
        case AutoDialTaskStatus.STATUS_SCHEDULED:
          // console.log(' %c Changing status to : SCHEDULED ', 'background: yellow; color: black;')
          this.powerDialerTasks.scheduled.push(this.activeTask)
          break
        default:
      }
      this.setShowPhone(false)
    }
  }
}
