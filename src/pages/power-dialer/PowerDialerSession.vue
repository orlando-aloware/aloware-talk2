<template>
  <b-overlay class="h-100"
             :show="sessionLoader">
    <div class="contacts mx-0 content-row d-flex overflow-hidden h-100">
      <div class="pt-0 pl-0 pr-0 mb-0 h-100 bordered-right contacts-left-sidebar sidebar-1"
           :class="`${sessionSidebarExpanded ? 'minimized' : ''}`">
        <session-sidebar/>
      </div>

      <div class="sessions-main-page px-0 mb-0 main flex-1 bg-grey-1 px-0 mb-0 h-100"
           :class="`${sessionSidebarExpanded ? 'minimized' : ''}`"
           :style="`${sessionSidebarExpanded ? 'padding-left:0px !important;' : ''}`">
        <div class="d-flex flex-column h-100">
          <!-- Session Header -->
          <div class="bg-white flex-grow-0 d-flex">
            <div class="col-6 p-0 bordered-right" :class="isStatusMinimized ? 'd-none' : ''">
              <session-call-disposition/>
            </div>
            <div class="p-0 d-flex "
                 :class="isStatusMinimized ? 'd-flex w-100 flex-direction-row' : 'col-6'">
              <div class="flex-grow-1">
                <session-call-status :isMinimized="isStatusMinimized"
                                     @on-redirect="redirectRoute"
                                     @no-tasks-found="onNoTasksFound"
                                     @on-all-tasks-are-skipped="onAllTasksAreSkipped"/>
              </div>

              <div class="flex-grow-0"
                   :class="!isStatusMinimized ? 'd-none' : ''">
                <b-button size="sm"
                          variant="light mr-2"
                          class="btn-white btn-contact-prev-next flex-grow-0"
                          style="margin-top: 12px"
                          @click="onToggleStatusMinimized"
                >
                  <i class="material-icons">keyboard_arrow_down</i>
                </b-button>
              </div>
            </div>
          </div>
          <b-button size="sm"
                    variant="light"
                    class="btn-white btn-contact-prev-next m-auto power-dialer-session-toggle-button"
                    style="height: 32px"
                    :class="isStatusMinimized ? 'd-none' : ''"
                    @click="onToggleStatusMinimized"
          >
            <i class="material-icons">keyboard_arrow_up</i>
          </b-button>

          <!-- Session Main Page -->
          <session-contact-page class="flex-grow-1 overflow-hidden"/>
        </div>
      </div>
    </div>
    <template #overlay>
      <div class="text-center">
        <q-spinner-bars color="primary"
                        size="2em"/>
        <div>Preparing session...</div>
      </div>
    </template>
    <appointment-form-modal :contact="contact">
    </appointment-form-modal>
    <contact-add-reminder-modal/>
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
import * as TaskType from 'src/constants/task-types'
import { sessionCallStatusMixin, powerDialerMixin } from 'src/plugins/mixins'
import broadcast from 'src/plugins/mixins/broadcast.mixin'
import qs from 'qs'
import { get } from 'lodash'

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
    powerDialerMixin,
    broadcast
  ],

  computed: {
    ...mapState(['dialer']),

    ...mapGetters('contacts', [
      'contact',
      'selectedList'
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
      minNumberOfInQueueTasks: 5,
      isStatusMinimized: false
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
      this.fetchTasks(AutoDialTaskStatus.STATUS_QUEUED)
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
        let taskType = ''
        switch (status) {
          case AutoDialTaskStatus.STATUS_COMPLETED:
            taskType = TaskType.CALLED
            break
          case AutoDialTaskStatus.STATUS_FAILED:
            taskType = TaskType.FAILED
            break
          case AutoDialTaskStatus.STATUS_SCHEDULED:
            taskType = TaskType.SCHEDULED
            break
          case AutoDialTaskStatus.STATUS_QUEUED:
          default:
            taskType = TaskType.IN_QUEUE
        }

        let params = {
          id: this.selectedList.id,
          task_status: status,
          per_page: 50
        }

        params.page = this.powerDialerTaskFilters[taskType] ? this.powerDialerTaskFilters[taskType].current_page : 1
        const isInProgress = get(this.inProgressFetchTasks, taskType, false)

        // skip if there's an in-progress tasks fetching for the specific type
        if (isInProgress) {
          return
        }

        this.inProgressFetchTasks[taskType] = true

        // Check if the number of tasks in the IN QUEUE list is equal
        // to the minimum number of tasks required to check/increment the page for pagination
        const lastItemsInCurrentQueue = this.powerDialerTasks[TaskType.IN_QUEUE]?.length === this.minNumberOfInQueueTasks
        const hasSkippedTasks = this.powerDialerTasks[TaskType.SKIPPED]?.length > 0
        const remainingInQueueTasks = this.powerDialerTaskFilters[TaskType.IN_QUEUE] ? this.powerDialerTaskFilters[TaskType.IN_QUEUE].total_queued > this.inQueueFetchTasks.fetchedTasks : false

        // Increment the pagination when the last items in the current list of IN QUEUE taks are reached
        // AND we have skipped tasks, so we need to fetch the next page of IN QUEUE tasks.
        // Otherwise we don't increment the page since the API response will change after a call is completed.
        if (lastItemsInCurrentQueue && hasSkippedTasks && remainingInQueueTasks) {
          params.page = this.inQueueFetchTasks.currentPage + 1
        }

        this.getTaskByFilter(params)
          .then(res => {
            this.powerDialerTaskFilters[taskType] = this.$jsonClone(res.data)
            delete this.powerDialerTaskFilters[taskType].data

            if (status === AutoDialTaskStatus.STATUS_QUEUED && !refreshData) {
              const newInQueueList = this.filterNewInQueueTasks(res.data.data, taskType, true, true)

              if (newInQueueList?.length) {
                this.powerDialerTasks[taskType] = newInQueueList
              }
            } else {
              const retrievedTasks = res.data.data
              const newTasks = retrievedTasks.filter(element => !this.powerDialerTasks[taskType].some(item => item.id === element.id))
              const tempSet = new Set([...this.powerDialerTasks[taskType], ...newTasks].map(JSON.stringify)) // Convert each element to JSON to ensure correct comparison
              this.powerDialerTasks[taskType] = Array.from(tempSet).map(JSON.parse) // Convert elements back to their original types
            }

            // no more queued tasks
            if (this.powerDialerTasks?.in_queue?.length === 0 && status === AutoDialTaskStatus.STATUS_QUEUED) {
              this.$VueEvent.fire('initiate_session_no_tasks')
            }

            this.inProgressFetchTasks[taskType] = false
          })

        return
      }

      // load non-queue tasks
      Object.keys(AutoDialTaskStatus.STATUSES_POSTLOAD).forEach(stat => {
        let taskStatus = AutoDialTaskStatus[this.listFilters[AutoDialTaskStatus.STATUSES[stat]].status]

        let params = stat === 'all' ? { id: this.selectedList.id } : {
          id: this.selectedList.id,
          task_status: taskStatus
        }
        params.per_page = 50

        this.getTaskByFilter(params).then(res => {
          this.powerDialerTasks[stat] = res.data.data
          this.powerDialerTaskFilters[stat] = res.data
        })
      })
    },

    async fetchCurrentList () {
      let id = ''

      if (this.isValidList) {
        id = this.selectedList.id
      } else {
        id = this.$route.params.id
      }

      Promise.all([
        this.getPowerDialerList(id),
        this.$axios.get(`/api/v2/power-dialer-lists/${id}/session-metrics`)
      ])
        .then(([listResponse, sessionMetricsResponse]) => {
          console.log('sessionMetricsResponse: ', sessionMetricsResponse)
          this.activeList = listResponse
          this.activeMetrics = sessionMetricsResponse.data.session_metrics

          this.setSelectedPDList({
            id: listResponse.id,
            name: listResponse.name,
            type: listResponse.type
          })
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
      // fetch IN QUEUE tasks through the API every time the active task changes (could be skipped, completed, or failed)
      this.fetchTasks(AutoDialTaskStatus.STATUS_QUEUED)
      this.$VueEvent.fire('redial_task')
    },

    onToggleStatusMinimized () {
      this.isStatusMinimized = !this.isStatusMinimized
    }
  },

  watch: {
    activeTask: {
      handler (newValue, oldValue) {
        const newContactListItemId = get(newValue, 'contact_list_item_id', null)
        const oldContactListItemId = get(oldValue, 'contact_list_item_id', null)

        // check if current and previous active task are not the same,
        // then fetch more tasks
        if (oldContactListItemId && newContactListItemId !== oldContactListItemId) {
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
