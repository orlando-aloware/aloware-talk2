import { mapGetters, mapActions } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import * as AutoDialTaskStatus from 'src/constants/power-dialer/task-status'
import { isEmpty } from 'lodash'

export default {
  data () {
    return {}
  },
  computed: {
    ...mapFields('powerDialer', [
      'powerDialerTasks',
      'activeTask',
      'taskToCall',
      'hasActiveTask',
      'sessionCallStatuses'
    ]),
    ...mapGetters('contacts', [
      'listItems'
    ])
  },
  methods: {
    ...mapActions('powerDialer', [
      'getSessionTaskByFilter',
      'reQueuePowerDialerTask'
    ]),
    ...mapActions(['setShowPhone']),
    async fetchInQueueTasks (task) {
      let res = await this.getSessionTaskByFilter({
        id: task.contact_list_id,
        task_status: 1
      })
      this.powerDialerTasks['in_queue'] = res.data.data
    },
    updateTaskStatus (task) {
      // console.log(` %c TASK UPDATED : ${task.task_status} `, 'background:red;color:white;', task)
      switch (task.task_status) {
        case AutoDialTaskStatus.STATUS_IN_PROGRESS:
          this.onStatusInProgress(task)
          break
        case AutoDialTaskStatus.STATUS_COMPLETED:
          this.onStatusCompleted(task)
          break
        case AutoDialTaskStatus.STATUS_FAILED:
          this.onStatusFailed(task)
          break
        case AutoDialTaskStatus.STATUS_QUEUED:
          this.onStatusQueued(task)
          break
        case AutoDialTaskStatus.STATUS_SCHEDULED:
          this.onStatusScheduled(task)
          break
        default:
      }
      this.setShowPhone(false)
    },
    onStatusInProgress (task) {
      if (isEmpty(task)) {
        return
      }

      // Re-assign new items for IN QUEUE and exclude the current task
      this.powerDialerTasks.in_queue = this.powerDialerTasks.in_queue.filter(lst => lst.contact_list_item_id !== task.id)
    },
    onStatusCompleted (task) {
      if (isEmpty(task)) {
        return
      }
      const contactTask = this.powerDialerTasks.all.find(item => item.id === task.contact.id)
      if (contactTask) {
        let tempSet = new Set([...this.powerDialerTasks['called'], contactTask].map(JSON.stringify)) // Convert each element to JSON to ensure correct comparison
        this.powerDialerTasks['called'] = Array.from(tempSet).map(JSON.parse) // Convert elements back to their original types
      }
      // window.VueEvent.fire('initiate_session', task)
    },
    onStatusFailed (task) {
      const contactTask = this.powerDialerTasks.all.find(item => item.id === task.contact.id)
      if (contactTask) {
        let tempSet = new Set([...this.powerDialerTasks['failed'], contactTask].map(JSON.stringify)) // Convert each element to JSON to ensure correct comparison
        this.powerDialerTasks['failed'] = Array.from(tempSet).map(JSON.parse) // Convert elements back to their original types
      }
    },
    onStatusQueued (task) {
      // if (isEmpty(task)) {
      //   return
      // }

      // Status Queued
      // this.reQueuePowerDialerTask({
      //   task: task,
      //   id: task.id
      // })
    },
    onStatusScheduled (task) {
      // Status Scheduled
      this.powerDialerTasks.scheduled.push(this.activeTask)
    },
    resetSelectedTaskAndContact () {
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
    }
  }
}
