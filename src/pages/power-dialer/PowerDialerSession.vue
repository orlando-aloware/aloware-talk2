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

import { mapGetters, mapActions } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import SessionSidebar from 'src/components/power-dialer/sessions/session-sidebar'
import CallDisposition from 'src/components/power-dialer/sessions/session-call-disposition'
import CallStatus from 'src/components/power-dialer/sessions/session-call-status'
import SessionPage from 'src/components/power-dialer/sessions/session-main-page'
import * as AutoDialTaskStatus from 'src/constants/power-dialer/task-status'
import { DEFAULT_FILTER_LIST } from 'src/constants/power-dialer/power-dialer-list'

export default {
  name: 'PowerDialerSession',
  components: {
    SessionSidebar,
    CallDisposition,
    CallStatus,
    SessionPage
  },
  computed: {
    ...mapGetters('contacts', [
      'listItems',
      'selectedList',
      'contact'
    ]),
    ...mapGetters('powerDialer', [
      'sessionSidebarExpanded'
    ]),
    ...mapFields('powerDialer', [
      'powerDialerTasks'
    ]),
    list () {
      return this.listItems[this.selectedList.id].data || []
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
    status () {
      return AutoDialTaskStatus.STATUSES
    }
  },
  mounted () {
    this.resetPowerDialerTasks()
  },
  methods: {
    ...mapActions('powerDialer', [
      'resetPowerDialerTasks'
    ]),
    prepareTasks () {
      /**
       * Preparing power dialer tasks
       * Converting selected contacts list to vuex sessions-ready objects
       */
      let { list, powerDialerTasks } = this
      list.forEach(lst => {
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
    }
  },
  watch: {
    listItems (val) {
      this.prepareTasks()
    }
  }
}
</script>
