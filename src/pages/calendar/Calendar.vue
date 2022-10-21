<template>
  <div class="calendar position-relative">
    <b-overlay class="h-100 w-100 position-absolute"
               rounded="sm"
               :show="true"
               v-show="loading">
      <template #overlay>
        <q-spinner-bars color="primary" size="40px" />
      </template>
    </b-overlay>

    <!-- header -->
    <div class="calendar__header">
      <div class="calendar__header__action-left">
        <b-button size="sm"
                  variant="light"
                  class="btn-white btn-calendar-prev-next btn-contact-prev-next"
                  @click.prevent="changeDirection('subtract')">
          <i class="material-icons">keyboard_arrow_left</i>
          <q-tooltip>
            Previous {{ view }}
          </q-tooltip>
        </b-button>
        <date-selector date-only
                       noValueToCustomElem
                       @dateSelected="onDateSelected">
          <b-button size="sm"
                    variant="light"
                    class="btn-white btn-rounded px-3 mx-2 d-flex align-items-center">
            <calendar-icon class="mr-2"/>
            {{ currentDate }}
            <q-tooltip>
              Select date
            </q-tooltip>
          </b-button>
        </date-selector>
        <b-button size="sm"
                  variant="light"
                  class="btn-white btn-calendar-prev-next btn-contact-prev-next"
                  @click.prevent="changeDirection('add')">
          <i class="material-icons">keyboard_arrow_right</i>
          <q-tooltip>
            Next {{ view }}
          </q-tooltip>
        </b-button>
      </div>
      <div class="calendar__header__action-right">
        <filters @input="onFiltersUpdated"/>
        <q-select class="mx-2"
                  options-selected-class="text-primary"
                  color="primary"
                  option-value="id"
                  option-label="name"
                  input-debounce="0"
                  emit-value
                  map-options
                  dense
                  outlined
                  v-model="view"
                  :options="views">
        </q-select>
        <helper/>
      </div>
    </div>

    <!-- scheduler -->
    <div class="scheduler">
      <div class="scheduler__header"
           v-show="!showSearchResult">
        <table class="scheduler__header__table">
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
      <div :class="['scheduler__body', view]">
        <scheduler ref="scheduler"
                   class="actual-scheduler"
                   :class="view + '-view'"
                   :events="events"
                   @edit-schedule="editSchedule"
                   @add-schedule="addSchedule"
                   @filter-click="toggleFilters"
                   @render-events="renderFromEvent"
                   @update-current-date="updateCurrentDate">
        </scheduler>
      </div>
    </div>
  </div>
</template>

<script>
// import { mapActions, mapState } from 'vuex'
import CalendarIcon from '../../components/icons/calendar-icon.vue'
import DateSelector from '../../components/date-selector.vue'
import Helper from '../../components/calendar/calendar-helper.vue'
import Filters from '../../components/calendar/calendar-filters.vue'
import Scheduler from '../../components/calendar/calendar-scheduler.vue'
import moment from 'moment'

export default {
  name: 'Calendar',

  components: {
    CalendarIcon,
    DateSelector,
    Helper,
    Filters,
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
      gotoDate: new Date(),
      // statusNames: {},
      view: 'month',
      stepMap: {
        'day': 'd',
        'week': 'w',
        'month': 'M'
      },
      views: [
        { 'id': 'day', name: 'Day' },
        { 'id': 'month', name: 'Month' },
        { 'id': 'week', name: 'Week' }
      ],
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
    currentDate () {
      let d = ''
      const m = moment(this.gotoDate)

      if (this.view === 'day') {
        d = m.format('D MMM YYYY')
      } else if (this.view === 'week') {
        const start = moment(this.gotoDate).startOf('isoWeek')
        const end = moment(this.gotoDate).endOf('isoWeek')

        d = start.format('D MMM') + ' - ' + end.format('D MMM YYYY')
        if (start.format('MMM') === end.format('MMM')) {
          d = start.format('D') + ' - ' + end.format('D MMM YYYY')
        }
      } else if (this.view === 'month') {
        d = m.format('MMMM YYYY')
      }

      return d
    },
    formattedWeekDays () {
      const start = moment(this.gotoDate).startOf('isoWeek')

      let cd = start
      let dates = []

      for (let i = 0; i < 7; i++) {
        dates.push({
          date: cd,
          dayOfWeek: cd.format('ddd'),
          day: cd.format('D'),
          today: cd.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')
        })

        cd.add(1, 'd')
      }

      return dates
    }
  },

  methods: {
    onDateSelected (date) {
      this.gotoDate = date
      this.$refs.scheduler.setCurrentView(this.gotoDate, this.view)
    },

    changeDirection (direction) {
      let date = moment(this.gotoDate)[direction](1, this.stepMap[this.view]).toDate()

      if (this.view === 'day') {
        this.gotoDate = date
      }

      this.$refs.scheduler.setCurrentView(date, this.view)
    },

    editSchedule (event) {
      // this.$refs.manager.editSchedule(event)
    },

    addSchedule (date) {
      // this.$refs.manager.addSchedule(date)
    },

    toggleFilters () {
    //   this.original_filters = _.clone(this.filters)
    //   this.dialogVisible = true
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

    // toggleGotoDate () {
    //   this.gotoDateVisible = true
    // },

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
    },

    onFiltersUpdated (data) {
      console.log(data)
    }
  },

  watch: {
    view () {
      this.$refs.scheduler.setCurrentView(this.gotoDate, this.view)
    }
  }
}
</script>
