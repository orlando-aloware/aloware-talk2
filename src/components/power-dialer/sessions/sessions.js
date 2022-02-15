import { mapFields } from 'vuex-map-fields'
import * as AutoDialTaskStatus from 'src/constants/power-dialer/task-status'

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
    }
  },
  methods: {
    async runTask () {
      let data = {
        currentNumber: this.$options.filters.fixPhone(`power_dialer_task:${this.taskToCall?.contact_list_item_id}`), // we know this already based on the list (Required)
        // currentNumber: this.$options.filters.fixPhone(`${this.activeTask?.phone_number}`), // we know this already based on the list (Required)
        outboundCampaignId: this.sessionSettings.campaign_id, // this.session.campaignId, // ID of the line that you are calling from (Required)
        contactName: `${this.taskToCall?.first_name} ${this.taskToCall?.last_name}`, // this.contactListItem.name, // the name of the contact that you are calling (Optional but it's best to have it)
        companyName: this.taskToCall?.company_name, // this.contactListItem.company_name, // the name of the company of the contact (Optional but it's best to have it)
        contactId: this.taskToCall?.id // this.contactListItem.contact_id // the ID of the contact (Optional but it's best to have it)
      }
      console.log(' %c Making a call from --> ', 'background: #000; color: #fff000;', data)
      if (this.taskToCall?.contact_list_item_id) {
        // this.$VueEvent.fire('makeCall', data)
        this.callInProgress = true
      } else {
        this.$generalNotification('A missing detail in contact is found. Unable to make a call.', 'error')
        this.callInProgress = false
      }
    },
    skipTask () {
      if (!this.activeTask) {
        return
      }
      console.log(`Manually skipped ${this.activeTask.id}`)
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
      switch (task.task_status) {
        case AutoDialTaskStatus.STATUS_IN_PROGRESS:
          this.activeTask = this.list.find(lst => lst.id === task.contact_id)
          this.powerDialerTasks.in_queue = this.powerDialerTasks.in_queue.filter(lst => lst.id !== task.contact_id)
          break
        case AutoDialTaskStatus.STATUS_COMPLETED:
          this.powerDialerTasks.called.push(this.activeTask)
          this.activeTask = {}
          break
        case AutoDialTaskStatus.STATUS_FAILED:
          this.powerDialerTasks.failed.push(this.activeTask)
          this.activeTask = {}
          break
        case AutoDialTaskStatus.STATUS_QUEUED:
          this.powerDialerTasks.in_queue.push(this.activeTask)
          break
        case AutoDialTaskStatus.STATUS_SCHEDULED:
          this.powerDialerTasks.scheduled.push(this.activeTask)
          break
        default:
      }
    }
  }
}
