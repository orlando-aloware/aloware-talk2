<template>
  <div class="position-relative"
       id="calendar">
    <b-overlay
      class="h-100 w-100 position-absolute"
      :show="loading"
      rounded="sm"
    >
      <template #overlay>
        <q-spinner-bars color="primary" size="40px" />
      </template>
    </b-overlay>

    <!-- header -->

    <!-- scheduler -->
    <div id="container-sched">
      <div id="sched-header"
           v-show="!showSearchResult">
        <table id="sched-header-table">
          <tr v-if="view === 'week'">
            <td id="td-scale"></td>
            <td :class="d.today ? 'today': ''"
                v-for="d in formattedWeekDays"
                :key="d.dayOfWeek">
                <span class="day-of-week">{{ d.dayOfWeek }}</span>
                <span class="day">{{ d.day }}</span>
            </td>
            <td style="width: 20px"></td>
          </tr>

          <tr v-if="view === 'month'">
            <td v-for="d in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
                :key="d">
              <span class="day-of-week">{{d}}</span>
            </td>
          </tr>
        </table>
      </div>
      <div id="sched-body"
           :class="view">
        <scheduler ref="scheduler"
                   class="actual-scheduler"
                   :class="view + '-view'"
                   :events="events"
                   @edit-schedule="editSchedule"
                   @add-schedule="addSchedule"
                   @filter-click="toggleFilters"
                   @render-events="renderFromEvent"
                   @toggle-goto-date="toggleGotoDate"
                   @update-current-date="updateCurrentDate">
        </scheduler>
      </div>
    </div>
  </div>
</template>

<script>
// import { mapActions, mapState } from 'vuex'
import Scheduler from '../../components/calendar/scheduler.vue'

export default {
  name: 'Calendar',

  components: {
    Scheduler
  },

  data () {
    return {
      events: [],
      // dialogVisible: false,
      filters: {
        appointments: true,
        reminders: true,
        calendar_users: [],
        calendar_mode: null,
        calendar_min_date: new Date(),
        calendar_max_date: new Date(),
        calendar_status: [],
        limit: 25,
        page: 1
      },
      // original_filters: {},
      loading: true,
      // gotoDateVisible: false,
      // gotoDate: new Date(),
      // statusNames: {},
      view: 'month',
      // stepMap: {
      //   'day': 'd',
      //   'week': 'w',
      //   'month': 'M'
      // },
      // dpOptions: {
      //   firstDayOfWeek: 1
      // },
      // legend: false,
      // searchMode: false,
      // search: {
      //     calendar_search: '',
      //     appointments: true,
      //     reminders: true,
      //     calendar_users: [],
      //     calendar_status: []
      // },
      // originalSearch: null,
      // showFilterSearch: false,
      showSearchResult: false,
      // search_loading: false,
      // searchFocused: false,
      // searchPopover: false,
      cancel_token: this.$axios.CancelToken,
      source: null
    }
  },

  computed: {
    // ...mapState('stats', ['metricGroups', 'metricLoader']),
    // ...mapState('auth', ['profile'])
  },

  methods: {
    editSchedule (event) {
      this.$refs.manager.editSchedule(event)
    },

    addSchedule (date) {
      this.$refs.manager.addSchedule(date)
    },

    toggleFilters () {
      console.log('filters toggled')
      // this.original_filters = _.clone(this.filters)
      // this.dialogVisible = true
    },

    loadCalendarData (state) {
      this.loading = true
      this.source = this.cancel_token.source()

      this.filters.calendar_mode = state.mode
      this.filters.calendar_min_date = state.min_date
      this.filters.calendar_max_date = state.max_date

      // reset only if the page is set back to one
      // it basically means that it will reload the data
      // from the beginning
      if (this.filters.page === 1) {
        this.events = []
        this.$refs.scheduler.clearAll()
      }

      this.$axios.get('/api/v1/calendar/events', {
        params: this.filters,
        cancelToken: this.source.token
      }).then(res => {
        this.events.push(...res.data)

        this.$refs.scheduler.customParse(this.events)

        if (res.data && res.data.length) {
          this.filters.page++
          this.reloadFromCurrentFilter()
        } else {
          this.loading = false
        }

        this.dialogVisible = false
      }).catch(err => {
        console.log(err)

        this.loading = false
        this.dialogVisible = false
      })
    },

    renderFromEvent (state) {
      this.cancelRequestToken()
      this.resetPage()
      this.loadCalendarData(state)
    },

    toggleGotoDate () {
      this.gotoDateVisible = true
    },

    updateCurrentDate (date) {
      this.gotoDate = date
    },

    resetPage () {
      this.filters.page = 1
    },

    cancelRequestToken () {
      if (this.source) {
        this.source.cancel('Calendar: Request Cancelled.')
      }
    }
  }
}
</script>
