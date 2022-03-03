<template>
  <div class="mx-0 content-row d-flex overflow-hidden h-100">
    <div :class="`${sessionSidebarExpanded ? 'col-0' : 'col-2'} width-0 pt-0 pl-0 pr-0 mb-0 h-100 bordered-right`">
      <SessionSidebar />
    </div>
    <div
      :class="`${sessionSidebarExpanded ? 'col-12' : 'col-10'} bg-grey-1 px-0 pr-1 mb-0`"
      :style="`${sessionSidebarExpanded ? 'padding-left:15px !important;' : ''}`">
      <div class="t-flex-group">

        <!-- Session Header -->
        <div class="d-flex bg-white">
          <div class="col-7 p-0 bordered-right">
            <CallDisposition />
          </div>
          <div class="col-5 p-0">
            <CallStatus
              @on-redirect="redirectRoute" />
          </div>
        </div>

        <!-- Session Main Page -->
        <SessionPage />
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import SessionSidebar from 'src/components/power-dialer/sessions/session-sidebar'
import CallDisposition from 'src/components/power-dialer/sessions/session-call-disposition'
import CallStatus from 'src/components/power-dialer/sessions/session-call-status'
import SessionPage from 'src/components/power-dialer/sessions/session-main-page'
import * as AutoDialTaskStatus from 'src/constants/power-dialer/task-status'
import { DEFAULT_FILTER_LIST } from 'src/constants/power-dialer/power-dialer-list'
import sessionsMixins from 'src/components/power-dialer/sessions/sessions'
import broadcast from 'src/plugins/mixins/broadcast.mixin'
import { isEmpty } from 'lodash'

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
      'sessionSidebarExpanded',
      'selectedPdList'
    ]),
    ...mapFields('powerDialer', [
      'powerDialerTasks',
      'activeList',
      'activeMetrics'
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
    },
    test () {
      return this.$route
    }
  },
  async mounted () {
    this.resetPowerDialerTasks()
    this.$VueEvent.listen('contact_list_item_created', (task) => {
      console.log(' %c TASK was CREATED : ', 'background: green; color: #000;', task)
      // if (this.checkCommunicationMatchesUserAccessibility(task)) {
      //   this.handleDesktopVoicemailNotification(task)
      // }
    })
    this.$VueEvent.listen('contact_list_item_updated', (task) => {
      console.log(' %c TASK was UPDATED : ', 'background: green; color: #000;', task)
      this.updateTaskStatus(task)
      // if (this.checkCommunicationMatchesUserAccessibility(task)) {
      //   this.handleDesktopVoicemailNotification(task)
      // }
    })
    this.$VueEvent.listen('contact_list_item_deleting', (task) => {
      console.log(' %c TASK was DELETED : ', 'background: green; color: #000;', task)
      // if (this.checkCommunicationMatchesUserAccessibility(task)) {
      //   this.handleDesktopVoicemailNotification(task)
      // }
    })
    await this.fetchTasks()
  },
  methods: {
    ...mapActions('powerDialer', [
      'resetPowerDialerTasks',
      'getSessionTaskByFilter',
      'getPowerDialerList',
      'setSelectedPDList'
    ]),
    async fetchTasks () {
      await this.fetchCurrentList()
      Object.keys(AutoDialTaskStatus.STATUSES).forEach(async stat => {
        let params = {}
        let taskStatus = AutoDialTaskStatus[this.listFilters[AutoDialTaskStatus.STATUSES[stat]].status]
        if (stat === 'all') {
          params = { id: this.selectedList.id }
        } else {
          params = { id: this.selectedList.id, task_status: taskStatus }
        }
        let res = await this.getSessionTaskByFilter(params)
        this.powerDialerTasks[stat] = res.data.data
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
      // console.log('RES -------- :>> ', res)
    },
    redirectRoute (route) {
      console.log('THIS: route :>> ', isEmpty(route.name))
      let routePath = '/power-dialer'
      if (route.name !== 'My Queue' && !isEmpty(route.name)) {
        routePath += `/list/${route.id}`
      }
      this.$router.push(routePath)
    }
  }
}
</script>
