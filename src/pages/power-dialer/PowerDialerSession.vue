<template>
  <div class="contacts mx-0 content-row d-flex overflow-hidden h-100">
    <div
      class="pt-0 pl-0 pr-0 mb-0 h-100 bordered-right contacts-left-sidebar sidebar-1"
      :class="`${sessionSidebarExpanded ? 'minimized' : ''}`">
      <SessionSidebar />
    </div>
    <div
      :class="`${sessionSidebarExpanded ? 'minimized' : ''} bg-grey-1 px-0 pr-1 mb-0`"
      class="sessions-main-page px-0 mb-0 main flex-1"
      :style="`${sessionSidebarExpanded ? 'padding-left:0px !important;' : ''}`">
      <div class="t-flex-group">

        <!-- Session Header -->
        <div class="d-flex bg-white">
          <div class="col-7 p-0 bordered-right">
            <CallDisposition />
          </div>
          <div class="col-5 p-0">
            <CallStatus
              @on-redirect="redirectRoute"
              @no-tasks-found="onNoTasksFound"
              @on-all-tasks-are-skipped="onAllTasksAreSkipped" />
          </div>
        </div>

        <!-- Session Main Page -->
        <SessionPage />
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters, mapActions, mapMutations } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import SessionSidebar from 'src/components/power-dialer/sessions/session-sidebar'
import CallDisposition from 'src/components/power-dialer/sessions/session-call-disposition'
import CallStatus from 'src/components/power-dialer/sessions/session-call-status'
import SessionPage from 'src/components/power-dialer/sessions/session-main-page'
import * as AutoDialTaskStatus from 'src/constants/power-dialer/task-status'
import { DEFAULT_FILTER_LIST } from 'src/constants/power-dialer/power-dialer-list'
import sessionsMixins from 'src/plugins/mixins/sessions'
import broadcast from 'src/plugins/mixins/broadcast.mixin'

export default {
  name: 'PowerDialerSession',
  components: {
    SessionSidebar,
    CallDisposition,
    CallStatus,
    SessionPage
  },
  mixins: [
    sessionsMixins,
    broadcast
  ],
  computed: {
    ...mapGetters('contacts', [
      'listItems',
      'contact',
      'selectedList'
    ]),
    ...mapGetters('powerDialer', [
      'sessionSidebarExpanded'
    ]),
    ...mapFields('powerDialer', [
      'powerDialerTasks',
      'powerDialerTaskFilters',
      'activeList',
      'activeMetrics',
      'myQueue',
      'hasActiveTask'
    ]),
    list () {
      return this.listItems[this.selectedList.id].data || []
    },
    listFilters () {
      return DEFAULT_FILTER_LIST
    },
    isValidList () {
      if (this.selectedList.id !== this.$route.params.id) {
        return false
      }
      return this.selectedList.name.length > 0
    }
  },
  async created () {
    await this.fetchCurrentList()
    await this.fetchTasks(1)
    this.hasActiveTask = false
  },
  async mounted () {
    this.TOGGLE_SESSION_LOADER(true)
    this.resetPowerDialerTasks()
    if (!this.myQueue) {
      await this.getMyQueueList()
    }
    await this.fetchTasks()

    this.verifyOpenTasks()
  },
  methods: {
    ...mapActions('powerDialer', [
      'resetPowerDialerTasks',
      'getSessionTaskByFilter',
      'getPowerDialerList',
      'setSelectedPDList',
      'getMyQueueList'
    ]),
    ...mapMutations('powerDialer', [
      'TOGGLE_SESSION_LOADER'
    ]),
    async fetchTasks (status) {
      let res = null
      if (status) {
        res = await this.getSessionTaskByFilter({ id: this.selectedList.id, task_status: 1 })
        this.powerDialerTasks['in_queue'] = res.data.data
        this.powerDialerTaskFilters['in_queue'] = res.data

        if (this.powerDialerTasks['in_queue'].length === 0) {
          this.$VueEvent.fire('initiate_session_no_tasks')
        }
      } else {
        Object.keys(AutoDialTaskStatus.STATUSES_POSTLOAD).forEach(async stat => {
          let params = {}
          let taskStatus = AutoDialTaskStatus[this.listFilters[AutoDialTaskStatus.STATUSES[stat]].status]
          if (stat === 'all') {
            params = { id: this.selectedList.id }
          } else {
            params = { id: this.selectedList.id, task_status: taskStatus }
          }
          res = await this.getSessionTaskByFilter(params)
          this.powerDialerTasks[stat] = res.data.data
          this.powerDialerTaskFilters[stat] = res.data
        })
      }
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
    }
  }
}
</script>
