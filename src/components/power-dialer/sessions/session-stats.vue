<template>
  <div class="t-menu">
    <div class="t-menu__header no-border d-flex align-items-center pr-3">
      <div class="header__header__title font-weight-bold pl-3 text-13 flex-grow-1">
        SESSION
      </div>
      <!-- <b-dropdown
        size="xs"
        variant="link"
        toggle-class="text-decoration-none"
        no-caret>
        <template
          class="p-0 m-0 text-black"
          style="color:black; font-size:10px;"
          #button-content>
          <div class="text-caption text-black">
            Power Sort
            <i class="fa fa-chevron-down fa-xs text-black"></i>
          </div>
        </template>
        <b-dropdown-item
          @click="{}"
          class="text-capitalize text-body2"
          href="#">
          Item 1
        </b-dropdown-item>
        <b-dropdown-item
          class="text-capitalize text-body2"
          href="#">
          Item 2
        </b-dropdown-item>
      </b-dropdown> -->

      <StartDialing
        :list="activeList"
        :default-trigger="false"
        @update="updateSettings" />

    </div>
    <div class="t-menu__header d-flex align-items-center">
      <div class="header__header__title font-weight-bold pl-3 text-13 flex-grow-1">
        STATS
      </div>
    </div>
    <div class="d-flex t-menu__content flex-column pb-0 pl-2">
      <q-card class="py-0 my-0 pl-1" flat>
        <summary-info-labels
          :prefetched-items="defaultStats"
          metric-type="1" />
      </q-card>
    </div>
  </div>
</template>

<script>

import { mapActions } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import StartDialing from '../session-settings/start-dial-sessions-settings'
import SummaryInfoLabels from '../details/summary-info-labels'
import moment from 'moment'

export default {
  name: 'SessionStats',
  components: {
    StartDialing,
    SummaryInfoLabels
  },
  beforeMount () {
    if (this.ongoingSession.finishedPdSession) {
      this.updateOngoingSession()
    } else {
      this.updateSessionTimer(this.ongoingSession.totalSeconds + 1)
    }
  },
  computed: {
    ...mapFields('powerDialer', [
      'activeList',
      'powerDialerTasks',
      'powerDialerTaskFilters',
      'ongoingSession'
    ]),
    completedTasks () {
      return this.powerDialerTaskFilters?.called?.total_called || 0 + this.powerDialerTaskFilters?.failed?.total_failed || 0
    },
    allTasks () {
      return this.powerDialerTaskFilters?.all?.total_found || this.powerDialerTaskFilters?.all?.total_queued || 0
    },
    timer () {
      return this.ongoingSession.totalSeconds
    },
    defaultStats () {
      return [
        {
          completed_contacts_count: this.$options.filters.secondsInMinutes(this.timer),
          name: 'Duration',
          percentage: 0,
          type: 0
        },
        {
          completed_contacts_count: this.completedTasks,
          name: 'Contacts',
          percentage: this.allTasks,
          type: 0
        }
      ]
    },
    hasReachedHour () {
      return this.ongoingSession.totalSeconds === 3600
    }
  },
  filters: {
    secondsInMinutes: function (seconds) {
      if (seconds) {
        if (this.hasReachedHour) {
          return moment('2015-01-01')
            .startOf('day')
            .seconds(seconds)
            .format('HH:mm:ss')
        }
        return moment('2015-01-01')
          .startOf('day')
          .seconds(seconds)
          .format('mm:ss')
      }
      return 0
    }
  },
  watch: {
    'ongoingSession.totalSeconds': function (val) {
      setTimeout(() => {
        this.updateSessionTimer(this.ongoingSession.totalSeconds + 1)
      }, 1000)
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      'setFinishedPowerDialerSession',
      'updateSessionTimer',
      'updateOngoingSession'
    ]),
    updateSettings (obj) {
      this.activeList = obj.data
      this.$generalNotification('Session settings has been updated.', 'success')
    }
  }
}
</script>
