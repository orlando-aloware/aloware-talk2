<template>
  <div>
    <div v-if="shouldShowCalendar" class="calendar position-relative h-100 d-flex flex-column">
      <b-overlay class="h-100 w-100 position-absolute"
                rounded="sm"
                :show="true"
                v-show="loading">
        <template #overlay>
          <q-spinner-bars color="primary"
                          size="40px" />
        </template>
      </b-overlay>

      <!-- header -->
      <div class="calendar__header flex-grow-0">
        <div class="calendar__header__action-left">
          <b-button size="sm"
                    variant="light"
                    class="btn-white btn-calendar-prev-next btn-contact-prev-next"
                    @click.prevent="changeDirection('subtract')">
            <i class="material-icons">keyboard_arrow_left</i>
            <q-tooltip anchor="top middle">
              Previous {{ view }}
            </q-tooltip>
          </b-button>
          <date-selector date-only
                        noValueToCustomElem
                        :value="gotoDate"
                        @dateSelected="onDateSelected">
            <b-button size="sm"
                      variant="light"
                      class="btn-white btn-rounded px-3 mx-2 d-flex align-items-center">
              <calendar-icon class="mr-2"/>
              {{ currentDate }}
              <q-tooltip anchor="top middle">
                Select date
              </q-tooltip>
            </b-button>
          </date-selector>
          <b-button size="sm"
                    variant="light"
                    class="btn-white btn-calendar-prev-next btn-contact-prev-next"
                    @click.prevent="changeDirection('add')">
            <i class="material-icons">keyboard_arrow_right</i>
            <q-tooltip anchor="top middle">
              Next {{ view }}
            </q-tooltip>
          </b-button>
          <b-button size="sm"
                    variant="light"
                    class="btn-white btn-rounded px-3 mx-2 btn-calendar-today"
                    @click.prevent="changeDirection('today')">
            Today
            <q-tooltip anchor="top middle">
              Go to today
            </q-tooltip>
          </b-button>
        </div>
        <div class="calendar__header__action-right">
          <filters :filters="convertedFilters"
                  @save="onSaveFilters"/>
          <q-select class="mx-2"
                    options-selected-class="text-primary"
                    color="primary"
                    option-value="id"
                    option-label="format"
                    input-debounce="0"
                    emit-value
                    map-options
                    dense
                    outlined
                    :options="timeFormats"
                    v-model="timeFormat"
                    @input="updateTimeFormat" />
          <q-select class="mr-2"
                    options-selected-class="text-primary"
                    color="primary"
                    option-value="id"
                    option-label="name"
                    input-debounce="0"
                    emit-value
                    map-options
                    dense
                    outlined
                    :options="views"
                    v-model="view" />
          <helper/>
        </div>
      </div>

      <!-- scheduler -->
      <div class="scheduler d-flex flex-column flex-grow-1 h-100 overflow-hidden-y">
        <div class="scheduler__header flex-grow-0">
          <table :class="['scheduler__header__table', `scheduler__header__table--${view}`]">
            <tr v-if="view === 'week'">
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
        <div class="flex-grow-1 h-100 overflow-hidden-y"
            :class="['scheduler__body', view]">
          <scheduler ref="scheduler"
                    :class="['actual-scheduler h-100', view + '-view']"
                    :events="events"
                    @edit-schedule="editSchedule"
                    @add-schedule="addSchedule"
                    @render-events="renderFromEvent"
                    @update-current-date="updateCurrentDate"
                    @view-change="viewChange">
          </scheduler>
        </div>
      </div>
      <manager ref="manager"
              @render-schedule="renderSchedule">
      </manager>
    </div>
    <upgrade-now image-link="/assets/images/Calendar.svg"
                 text="Calendar is not included in your current plan. To use it, please contact us to upgrade today!"
                 title-text="Calendar"
                 kb-link="https://support.aloware.com/en/articles/6797909-the-aloware-talk-calendar"
                 class="mt-5"
                 v-if="!shouldShowCalendar && shouldShowUpgradeNow">
    </upgrade-now>
  </div>
</template>

<script>
import _ from 'lodash'
import CalendarIcon from '../../components/icons/calendar-icon.vue'
import DateSelector from '../../components/date-selector.vue'
import Filters from '../../components/calendar/calendar-filters.vue'
import Helper from '../../components/calendar/calendar-helper.vue'
import Manager from '../../components/calendar/calendar-event-manager.vue'
import Scheduler from '../../components/calendar/calendar-scheduler.vue'
import UpgradeNow from '../../components/upgrade-now.vue'
import moment from 'moment'
import { mapActions, mapState } from 'vuex'
import api from 'src/plugins/api/api'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'Calendar',

  components: {
    CalendarIcon,
    DateSelector,
    Filters,
    Helper,
    Manager,
    Scheduler,
    UpgradeNow
  },

  mixins: [
    aclMixin
  ],

  data () {
    return {
      events: [],
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
      loading: true,
      gotoDate: new Date(),
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
      timeFormat: 1,
      timeFormats: [
        { id: 1, format: 'AM/PM' },
        { id: 2, format: '24-hour' }
      ],
      cancel_token: this.$axios.CancelToken,
      source: null
    }
  },

  computed: {
    ...mapState('auth', ['profile']),

    currentDate () {
      let d = ''
      const m = moment(this.gotoDate)

      switch (this.view) {
        case 'day':
          d = m.format('D MMM YYYY')
          break
        case 'week':
          const start = moment(this.gotoDate).startOf('isoWeek') // first day of current week
          const end = moment(this.gotoDate).endOf('isoWeek') // last day of current week

          // if both dates are inside same month, omits month from first date
          d = start.format('MMM') === end.format('MMM')
            ? start.format('D') + ' - ' + end.format('D MMM YYYY')
            : start.format('D MMM') + ' - ' + end.format('D MMM YYYY')
          break
        case 'month':
          d = m.format('MMMM YYYY')
          break
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
    },

    convertedFilters () {
      return {
        appointments: this.filters.appointments,
        reminders: this.filters.reminders,
        users: this.filters.calendar_users,
        status: this.filters.calendar_status
      }
    }
  },

  mounted () {
    this.timeFormat = this.profile.time_format

    if ('communication_id' in this.$route.query) {
      this.$axios.get('/api/v1/calendar/events/show/' + this.$route.query.communication_id + '/communication').then(res => {
        this.editSchedule(res.data)
      })
    }
  },

  methods: {
    ...mapActions('auth', ['setProfile']),

    onDateSelected (date) {
      this.gotoDate = date
      this.$refs.scheduler.setCurrentView(this.gotoDate, this.view)
    },

    changeDirection (direction) {
      let date = direction === 'today'
        ? new Date()
        : moment(this.gotoDate)[direction](1, this.stepMap[this.view]).toDate()

      if (this.view === 'day') {
        this.gotoDate = date
      }

      this.$refs.scheduler.setCurrentView(date, this.view)
    },

    editSchedule (event) {
      this.$refs.manager.editSchedule(event)
    },

    addSchedule (date) {
      // dont allow add past events
      if (moment(date).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD')) {
        return
      }

      this.$refs.manager.addSchedule(date)
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
      }).catch(err => {
        console.log(err)

        this.loading = false
      })
    },

    reloadFromCurrentFilter () {
      this.loadCalendarData({
        mode: this.filters.calendar_mode,
        min_date: this.filters.calendar_min_date,
        max_date: this.filters.calendar_max_date
      })
    },

    renderFromEvent (state) {
      this.cancelRequestToken()
      this.resetPage()
      this.loadCalendarData(state)
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
    },

    onSaveFilters (data) {
      this.filters.appointments = data.appointments
      this.filters.reminders = data.reminders
      this.filters.calendar_users = data.users || []
      this.filters.calendar_status = data.status || []

      // reload calendar with new filters
      this.$refs.scheduler.setCurrentView(this.gotoDate, this.view)
    },

    renderSchedule (engagement) {
      let data = _.cloneDeep(engagement.data)
      let action = engagement.action

      if (action === 'add') {
        this.events.push(data)
      }

      if (action === 'update') {
        let index = this.events.findIndex(ev => ev.id === data.id)

        if (index > -1) {
          this.events.splice(index, 1, data)
        }
      }

      if (action === 'delete') {
        let index = this.events.findIndex(ev => ev.id === data.id)

        if (index > -1) {
          this.events.splice(index, 1)

          // remove the event directly from the scheduler
          this.$refs.scheduler.deleteEvent(data.id)
        }
      }

      this.$refs.scheduler.customParse(this.events)
    },

    viewChange (mode) {
      this.view = mode
    },

    updateTimeFormat () {
      const payload = Object.assign({ ...this.profile }, { time_format: this.timeFormat })
      api.V1.user.update(this.profile.id, payload)
        .then(res => {
          this.setProfile(res.data)
          this.$refs.scheduler.reInit(this.gotoDate, this.view)
        })
    }
  },

  watch: {
    view () {
      this.$refs.scheduler.setCurrentView(this.gotoDate, this.view)
    }
  }
}
</script>
