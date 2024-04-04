<template>
  <b-overlay class="h-100"
             :show="sessionLoader">
    <div class="contacts mx-0 content-row d-flex overflow-hidden h-100">
      <div class="pt-0 pl-0 pr-0 mb-0 h-100 bordered-right contacts-left-sidebar sidebar-1"
           :class="`${sessionSidebarExpanded ? 'minimized' : ''}`">
        <session-sidebar />
      </div>
      <div :class="`sessions-main-page px-0 mb-0 main flex-1 ${sessionSidebarExpanded ? 'minimized' : ''} bg-grey-1 px-0 mb-0 h-100`"
           :style="`${sessionSidebarExpanded ? 'padding-left:0px !important;' : ''}`">
        <div class="d-flex flex-column h-100">
          <!-- Session Header -->
          <div class="d-flex bg-white flex-grow-0">
            <div class="col-7 p-0 bordered-right">
              <session-call-disposition />
            </div>
            <div class="col-5 p-0">
              <session-call-status @on-redirect="redirectRoute"
                                   @no-tasks-found="onNoTasksFound"
                                   @on-all-tasks-are-skipped="onAllTasksAreSkipped" />
            </div>
          </div>
          <!-- Session Main Page -->
          <session-contact-page class="flex-grow-1 overflow-hidden" />
        </div>
      </div>
    </div>
    <template #overlay>
      <div class="text-center">
        <q-spinner-bars color="primary"
                        size="2em" />
        <div>Preparing session...</div>
      </div>
    </template>
    <appointment-form-modal :contact="contact">
    </appointment-form-modal>
    <contact-add-reminder-modal />
  </b-overlay>
</template>

<script>

import { mapGetters, mapActions, mapMutations, mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import SessionSidebar from 'src/components/power-dialer/sessions/session-sidebar'
import SessionCallDisposition from 'src/components/power-dialer/sessions/session-call-disposition'
import SessionCallStatus from 'src/components/power-dialer/sessions/session-call-status'
import SessionContactPage from 'src/components/power-dialer/sessions/session-contact-page'
import AppointmentFormModal from 'src/components/appointments/appointment-form-modal'
import ContactAddReminderModal from 'src/components/contacts/contact-add-reminder-modal'
import * as AutoDialTaskStatus from 'src/constants/power-dialer/task-status'
import { DEFAULT_FILTER_LIST } from 'src/constants/power-dialer/power-dialer-list'
import { sessionCallStatusMixin } from 'src/plugins/mixins'
import broadcast from 'src/plugins/mixins/broadcast.mixin'
import qs from 'qs'
import { get, isEmpty } from 'lodash'

export default {
  name: 'PowerDialerSession',

  components: {
    SessionSidebar,
    SessionCallDisposition,
    SessionCallStatus,
    SessionContactPage,
    AppointmentFormModal,
    ContactAddReminderModal
  },

  mixins: [
    sessionCallStatusMixin,
    broadcast
  ],

  computed: {
    ...mapState(['dialer']),

    ...mapGetters('contacts', [
      'contact',
      'selectedList',
      'currentListFilters',
      'selectedContacts',
      'search'
    ]),

    ...mapGetters('powerDialer', [
      'sessionSidebarExpanded',
      'sessionLoader'
    ]),

    ...mapFields('powerDialer', [
      'powerDialerTaskFilters',
      'activeList',
      'activeMetrics',
      'myQueue',
      'hasActiveTask'
    ]),

    listFilters () {
      return DEFAULT_FILTER_LIST
    },

    isValidList () {
      if (this.selectedList.id !== this.$route.params.id) {
        return false
      }

      return this.selectedList.name.length > 0
    },

    totalTasksInQueue () {
      return this.powerDialerTasks.in_queue.length
    }
  },

  data () {
    return {
      listeners: {},
      cancelToken: null,
      source: null,
      tasksProcessed: 0,
      inProgressFetchTasks: {},
      pagesFetched: 0
    }
  },

  async created () {
    await this.fetchCurrentList()
    this.TOGGLE_SESSION_LOADER(true)
    await this.fetchTasks(AutoDialTaskStatus.STATUS_QUEUED)
    this.hasActiveTask = false

    this.listeners.endWrapUp = () => {
      if (this.$route.name === 'Power Dialer') {
        this.fetchTasks(AutoDialTaskStatus.STATUS_COMPLETED)
        this.fetchTasks(AutoDialTaskStatus.STATUS_FAILED)
      }
    }

    this.listeners.contactListBulkCreated = (event) => {
      this.fetchTasks(AutoDialTaskStatus.STATUS_QUEUED, false, true)
    }

    this.$VueEvent.listen('endWrapUp', this.listeners.endWrapUp)
    this.$VueEvent.stop('contact_list_bulk_created', this.listeners.contactListBulkCreated)
    this.$VueEvent.listen('contact_list_bulk_created', this.listeners.contactListBulkCreated)
  },

  async mounted () {
    this.resetPowerDialerTasks()

    if (!this.myQueue) {
      await this.getMyQueueList()
    }

    await this.fetchTasks()
  },

  methods: {
    ...mapActions('powerDialer', [
      'resetPowerDialerTasks',
      'getPowerDialerList',
      'setSelectedPDList',
      'getMyQueueList'
    ]),

    ...mapMutations('powerDialer', [
      'TOGGLE_SESSION_LOADER'
    ]),

    getTaskByFilter (params = {}) {
      const listId = params.id === 'all'
        ? 'my-queue'
        : params.id
      delete params.name
      delete params.id

      // prepare extra filters
      params = this.prepareFilters(params, listId)

      return window.axios.get(
        `api/v2/power-dialer-lists/${listId}/items`,
        {
          params,
          paramsSerializer: qs.stringify
        }
      )
    },

    fetchTasks (status, isNextPage = false, refreshData = false) {
      if (status) {
        const taskType = { data: '' }
        switch (status) {
          case AutoDialTaskStatus.STATUS_COMPLETED:
            taskType.data = 'called'
            break
          case AutoDialTaskStatus.STATUS_FAILED:
            taskType.data = 'failed'
            break
          case AutoDialTaskStatus.STATUS_SCHEDULED:
            taskType.data = 'scheduled'
            break
          case AutoDialTaskStatus.STATUS_QUEUED:
          default:
            taskType.data = 'in_queue'
        }

        let params = {
          id: this.selectedList.id,
          task_status: status
        }

        params.page = isNextPage ? 2 : 1
        const isInProgress = get(this.inProgressFetchTasks, taskType.data, false)

        // skip if there's an in-progress tasks fetch
        if (isInProgress) {
          return
        }

        this.inProgressFetchTasks[taskType.data] = true

        this.getTaskByFilter(params)
          .then(res => {
            this.powerDialerTaskFilters[taskType.data] = JSON.parse(JSON.stringify(res.data))
            delete this.powerDialerTaskFilters[taskType.data].data

            if (status === AutoDialTaskStatus.STATUS_QUEUED && !refreshData) {
              this.pagesFetched += 1
              this.powerDialerTaskFilters[taskType.data].current_page = this.pagesFetched
              // const inQueueTaskIds = this.powerDialerTasks[taskType.data].map(task => task.contact_list_item_id)
              // const uniqueData = res.data.data.filter(task => !inQueueTaskIds.includes(task.id))
              this.powerDialerTasks[taskType.data].push(...res.data.data)
            } else {
              this.powerDialerTasks[taskType.data] = res.data.data
            }

            if (this.powerDialerTasks.in_queue.length === 0 &&
              status === AutoDialTaskStatus.STATUS_QUEUED) {
              this.$VueEvent.fire('initiate_session_no_tasks')
            }

            this.inProgressFetchTasks[taskType.data] = false
          })

        return
      }

      Object.keys(AutoDialTaskStatus.STATUSES_POSTLOAD).forEach(stat => {
        let taskStatus = AutoDialTaskStatus[this.listFilters[AutoDialTaskStatus.STATUSES[stat]].status]

        let params = stat === 'all' ? { id: this.selectedList.id } : { id: this.selectedList.id, task_status: taskStatus }

        this.getTaskByFilter(params).then(res => {
          this.powerDialerTasks[stat] = res.data.data
          this.powerDialerTaskFilters[stat] = res.data
        })
      })
    },

    async fetchCurrentList () {
      let response = null
      let id = ''

      if (this.isValidList) {
        id = this.selectedList.id
        response = await this.getPowerDialerList(id)
      } else {
        id = this.selectedList?.name?.length === 0 || this.selectedList?.name === 'My Queue' ? 'my-queue' : this.selectedList?.id
        response = await this.getPowerDialerList(this.$route.params.id)
      }

      this.activeList = response
      this.activeMetrics = response.session_metrics

      this.setSelectedPDList({
        id: response.id,
        name: response.name,
        type: response.type
      })
    },

    redirectRoute (route) {
      this.$VueEvent.fire('call_sessions_ended')
      let isMyQueueList = this.selectedList.name === 'My Queue'
      let routePath = '/power-dialer'

      if (!isMyQueueList) {
        routePath += `/list/${route.id}`
      }

      this.$router.push(routePath)
    },

    onNoTasksFound () {
      this.$generalNotification('Stopping PowerDialer: No more tasks found', 'warning')
    },

    onAllTasksAreSkipped () {
      this.$generalNotification('All remaining tasks are skipped. Redirecting to Power Dialer list.', 'warning')
    },

    fetchQueuedTasks () {
      // fetch tasks only if:
      // total queued tasks for the next task is more than
      // current total tasks in queue + the active task,
      // and if current total tasks in queue is less than
      // the number of tasks per page
      const totalTasksInQueueWithActiveCall = (this.totalTasksInQueue + 1)
      const powerDialerTaskInQueueTotalQueued = get(this.powerDialerTaskFilters.in_queue, 'total_queued', null)
      const powerDialerTaskInQueuePerPage = get(this.powerDialerTaskFilters.in_queue, 'per_page', 20)

      if (powerDialerTaskInQueueTotalQueued &&
        powerDialerTaskInQueueTotalQueued > totalTasksInQueueWithActiveCall &&
        this.totalTasksInQueue < powerDialerTaskInQueuePerPage) {
        this.fetchTasks(AutoDialTaskStatus.STATUS_QUEUED, true)
        // decrement the total number of queued tasks only on the
        // 3rd page and up
        if (this.pagesFetched >= 3) {
          this.powerDialerTaskFilters.in_queue.total_queued -= 1
        }

        return
      }

      if (!isEmpty(this.powerDialerTaskFilters.in_queue)) {
        this.powerDialerTaskFilters.in_queue.total_queued -= 1
      }

      this.$VueEvent.fire('redial_task')
    },

    prepareFilters (params, listId) {
      // add current filters to the params
      const currentFilters = this.$jsonClone(this.currentListFilters)
      // exclude contact_lists from the filters, since it will always be present
      delete currentFilters.contact_lists

      if (!isEmpty(currentFilters)) {
        params.filter_groups = currentFilters
      }

      // add selected contacts to the params, when they arent empty
      if (this.selectedContacts[listId] && Array.isArray(this.selectedContacts[listId])) {
        const contactIds = this.selectedContacts[listId].map(contact => contact.id)

        if (contactIds.length) {
          params.contact_ids = contactIds
        }
      }

      // add current search to the params
      if (this.search.trim()) {
        params.keyword = this.search.trim()
      }

      return params
    }
  },

  watch: {
    activeTask: {
      handler (newValue, oldValue) {
        const newContactListItemId = get(newValue, 'contact_list_item_id', null)
        const oldContactListItemId = get(oldValue, 'contact_list_item_id', null)

        // check if current and previous active task are not the same,
        // then check if we can fetch more tasks
        if (newContactListItemId !== oldContactListItemId) {
          this.fetchQueuedTasks()
        }
      },
      deep: true
    }
  },

  beforeDestroy () {
    this.powerDialerTaskFilters.in_queue = []
    this.$VueEvent.stop('endWrapUp', this.listeners.endWrapUp)
    this.$VueEvent.stop('contact_list_bulk_created', this.listeners.contactListBulkCreated)
  }
}
</script>
