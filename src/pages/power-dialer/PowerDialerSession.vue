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
            <CallStatus />
          </div>
        </div>

        <!-- Session Main Page -->
        <SessionPage />
      </div>
    </div>
  </div>
</template>

<script>

import { mapState, mapGetters, mapActions } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import SessionSidebar from 'src/components/power-dialer/sessions/session-sidebar'
import CallDisposition from 'src/components/power-dialer/sessions/session-call-disposition'
import CallStatus from 'src/components/power-dialer/sessions/session-call-status'
import SessionPage from 'src/components/power-dialer/sessions/session-main-page'
import * as AutoDialTaskStatus from 'src/constants/power-dialer/task-status'
import { DEFAULT_FILTER_LIST } from 'src/constants/power-dialer/power-dialer-list'
import sessionsMixins from 'src/components/power-dialer/sessions/sessions'
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
      'contact'
    ]),
    ...mapGetters('powerDialer', [
      'sessionSidebarExpanded'
    ]),
    ...mapState('powerDialer', [
      'selectedPdList'
    ]),
    ...mapFields('powerDialer', [
      'powerDialerTasks'
    ]),
    list () {
      return this.listItems[this.selectedPdList.id].data || []
    },
    activeList () {
      if (this.list.length) {
        return this.list[0]
      }
      return {}
    },
    listFilters () {
      return DEFAULT_FILTER_LIST
    },
    isValidList () {
      if (this.selectedPdList.id !== this.$route.params.id) {
        return false
      }
      return this.selectedPdList.name.length > 0
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
    getTasks () {
      /**
       * Preparing power dialer tasks
       * Converting selected contacts list to vuex sessions-ready objects
       */
      let { list, powerDialerTasks } = this
      list.forEach(lst => {
        console.log('lst.task_status :>> ', lst.task_status)
        switch (lst.task_status) {
          case AutoDialTaskStatus.STATUS_QUEUED:
            powerDialerTasks.in_queue.push(lst)
            break
          case AutoDialTaskStatus.STATUS_COMPLETED:
            powerDialerTasks.called.push(lst)
            break
          case AutoDialTaskStatus.STATUS_FAILED:
            powerDialerTasks.failed.push(lst)
            break
          case AutoDialTaskStatus.STATUS_SCHEDULED:
            powerDialerTasks.scheduled.push(lst)
            break
        }
      })
    },
    async fetchTasks () {
      await this.fetchCurrentList()
      Object.keys(AutoDialTaskStatus.STATUSES).forEach(async stat => {
        let params = {}
        let taskStatus = AutoDialTaskStatus[this.listFilters[AutoDialTaskStatus.STATUSES[stat]].status]
        if (stat === 'all') {
          params = { id: this.selectedPdList.id }
        } else {
          params = { id: this.selectedPdList.id, task_status: taskStatus }
        }
        let res = await this.getSessionTaskByFilter(params)
        this.powerDialerTasks[stat] = res.data.data
      })
    },
    async fetchCurrentList () {
      let res = null
      let id = ''
      if (this.isValidList) {
        id = this.selectedPdList.id
        res = await this.getPowerDialerList(id)
      } else {
        id = this.selectedPdList?.name?.length === 0 || this.selectedPdList?.name === 'My Queue' ? 'my-queue' : this.selectedPdList?.id
        res = await this.getPowerDialerList(this.$route.params.id)
      }
      this.setSelectedPDList({
        id: res.id,
        name: res.name,
        type: res.type
      })
      console.log('RES -------- :>> ', res)
    }
  },
  watch: {
    async listItems (val) {
      // this.getTasks()
      console.log('val :>> ', val)
    }
  }
}
</script>
