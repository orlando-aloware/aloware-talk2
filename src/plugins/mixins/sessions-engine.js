import { mapGetters, mapActions } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import * as AutoDialTaskStatus from 'src/constants/power-dialer/task-status'

export default {
  data () {
    return {}
  },
  computed: {
    ...mapFields('powerDialer', [
      'powerDialerTasks'
    ]),
    ...mapGetters('contacts', [
      'listItems'
    ])
  },
  methods: {
    ...mapActions('powerDialer', [
      'getSessionTaskByFilter'
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
      // Re-assign new items for IN QUEUE and exclude the curernt task
      this.powerDialerTasks.in_queue = this.powerDialerTasks.in_queue.filter(lst => lst.contact_list_item_id !== task.id)
    },
    onStatusCompleted (task) {
      this.powerDialerTasks.called.push(this.activeTask)
      window.VueEvent.fire('initiate_session', task)
    },
    onStatusFailed (task) {
      this.powerDialerTasks.failed.push(this.activeTask)
    },
    onStatusQueued (task) {
      // Status Queued
      let taskToMove = this.powerDialerTasks.in_queue.find(lst => lst.contact_list_item_id === task.id)
      this.powerDialerTasks.in_queue = this.powerDialerTasks.in_queue.filter(lst => lst.contact_list_item_id !== task.id)
      this.powerDialerTasks.in_queue.push(taskToMove)
      window.VueEvent.fire('initiate_session', task)
    },
    onStatusScheduled (task) {
      // Status Scheduled
      this.powerDialerTasks.scheduled.push(this.activeTask)
    }
  }
}
