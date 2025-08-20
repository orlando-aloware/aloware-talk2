<template>
  <div class="position-relative h-100">
    <div class="calendar d-flex h-100 flex-column">
      <b-overlay class="h-100 w-100 position-absolute"
                 rounded="sm"
                 :show="loading"
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
          <b-button size="sm"
                    variant="light"
                    class="btn-white btn-rounded px-3 btn-calendar-today"
                    v-if="view !== 'month'"
                    @click.prevent="showAllEvents(gotoDate)">
            {{ isMobile ? 'Events' : 'List all events' }}
            <q-tooltip anchor="top middle">
              Show all events
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
        <div class="scheduler__header flex-grow-0 row">
          <table :class="['scheduler__header__table', `scheduler__header__table--${view}`]">
            <tr v-if="view === WEEK_VIEW">
              <td
                  style="min-width: 200px;"
                  :class="d.today ? 'today': ''"
                  :key="d.dayOfWeek"
                  v-for="d in formattedWeekDays">
                <a
                  href="#"
                  class="day-label"
                  @click.prevent="goToDayView(d.date)"
                >
                  <span class="day-of-week">{{ d.dayOfWeek }}</span>
                  <span class="day">{{ d.day }}</span>
                </a>
              </td>
            </tr>

            <tr v-if="view === 'month'">
              <td :key="d"
                  v-for="d in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']">
                <span class="day-of-week">{{d}}</span>
              </td>
            </tr>
          </table>
        </div>
        <div class="flex-grow-1 h-100 overflow-hidden-y"
             :class="['scheduler__body', view]">
          <scheduler ref="scheduler"
                     :class="['actual-scheduler h-100', view + '-view']"
                     :events="eventsConvertedToTheRightTimezone"
                     :loading="loading"
                     :view="view"
                     @edit-schedule="editSchedule"
                     @add-schedule="addSchedule"
                     @render-events="renderFromEvent"
                     @update-current-date="updateCurrentDate"
                     @toggle-goto-date="onToggleGotoDate"
                     @expand-day-events="showAllEvents"
                     @expand-hour-events="showEventsForHour">
          </scheduler>
        </div>
      </div>
      <manager ref="manager"
               @render-schedule="renderSchedule"
               @close-filters-menu="closeEventModal">
      </manager>
    </div>

    <calendar-event-list :is-mobile="isMobile"
                         :events-modal-mode="eventsModalMode"
                         :selected-date="selectedDate"
                         :selected-hour="selectedHour"
                         :events="eventsConvertedToTheRightTimezone"
                         :time-format="timeFormat"
                         :view-mode="view"
                         :current-date="currentDate"
                         v-model="isEventsModalOpen"
                         @open-event-modal="openEventModal" />
  </div>
</template>

<script>

import CalendarIcon from '../../components/icons/calendar-icon.vue'
import DateSelector from '../../components/date-selector.vue'
import Filters from '../../components/calendar/calendar-filters.vue'
import Helper from '../../components/calendar/calendar-helper.vue'
import Manager from '../../components/calendar/calendar-event-manager.vue'
import Scheduler from '../../components/calendar/calendar-scheduler.vue'
import CalendarEventList from 'components/calendar/calendar-event-list.vue'
import moment from 'moment'
import { mapActions, mapState } from 'vuex'
import api from 'src/plugins/api/api'
import { aclMixin } from 'src/plugins/mixins'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import { getBrowserTimeZone } from 'src/utils'
import { CALENDAR_VIEWS, HOUR_VIEW, DAY_VIEW, WEEK_VIEW, MONTH_VIEW, DEFAULT_VIEW } from 'src/constants/calendar'

export default {
  name: 'Calendar',

  mixins: [aclMixin],

  components: {
    CalendarIcon,
    DateSelector,
    Filters,
    Helper,
    Manager,
    Scheduler,
    CalendarEventList
  },

  data () {
    return {
      WEEK_VIEW,
      events: [],
      filters: {
        appointments: true,
        reminders: true,
        calendar_users: [],
        calendar_mode: null,
        calendar_min_date: moment.utc().startOf('day').toISOString(),
        calendar_max_date: moment.utc().endOf('day').toISOString(),
        calendar_status: [],
        limit: 2500,
        page: 1
      },
      loading: true,
      gotoDate: moment.utc().toDate(),
      view: DEFAULT_VIEW,
      stepMap: {
        'day': 'd',
        'week': 'w',
        'month': 'M'
      },
      views: [
        { 'id': DAY_VIEW, name: 'Day' },
        { 'id': WEEK_VIEW, name: 'Week' },
        { 'id': MONTH_VIEW, name: 'Month' }
      ],
      timeFormat: 1,
      timeFormats: [
        { id: 1, format: 'AM/PM' },
        { id: 2, format: '24-hour' }
      ],
      cancel_token: this.$axios.CancelToken,
      source: null,
      loadingStates: {},
      requestQueue: [],
      currentRequestId: null,
      selectedDate: '',
      selectedHour: '',
      isShowingEventEditModal: false,
      CommunicationDispositionStatus,
      isEventsModalOpen: false,
      eventsModalMode: null // 'hour' or 'list'
    }
  },

  computed: {
    ...mapState('auth', ['profile']),
    ...mapState(['isMobile']),

    currentDate () {
      let d = ''
      const m = moment(this.gotoDate)

      switch (this.view) {
        case DAY_VIEW:
          d = m.format('D MMM YYYY')
          break
        case WEEK_VIEW:
          const start = moment(this.gotoDate).startOf('isoWeek') // first day of current week
          const end = moment(this.gotoDate).endOf('isoWeek') // last day of current week

          // if both dates are inside same month, omits month from first date
          d = start.format('MMM') === end.format('MMM')
            ? start.format('D') + ' - ' + end.format('D MMM YYYY')
            : start.format('D MMM') + ' - ' + end.format('D MMM YYYY')
          break
        case MONTH_VIEW:
          d = m.format('MMMM YYYY')
          break
      }

      return d
    },

    eventsConvertedToTheRightTimezone () {
      const browserTZ = getBrowserTimeZone()

      return this.events.map(event => {
        const startDateInRightTimezone = moment.tz(event.start_date, event.contact_timezone)
        const endDateInRightTimezone = moment.tz(event.end_date, event.contact_timezone)

        const convertedStartDate = moment(startDateInRightTimezone.utc()).tz(browserTZ)
        const convertedEndDate = moment(endDateInRightTimezone.utc()).tz(browserTZ)

        return {
          ...event,
          start_date_original: event.start_date,
          end_date_original: event.end_date,
          start_date: convertedStartDate.format('YYYY-MM-DD HH:mm'),
          end_date: convertedEndDate.format('YYYY-MM-DD HH:mm')
        }
      })
    },

    formattedWeekDays () {
      const start = moment(this.gotoDate).startOf('isoWeek')

      let cd = start.clone()
      let dates = []

      for (let i = 0; i < 7; i++) {
        dates.push({
          date: cd.clone(),
          dayOfWeek: cd.format('ddd'),
          day: cd.format('D'),
          today: cd.isSame(moment(), 'day')
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

    const { view } = this.$route.query
    if (view && CALENDAR_VIEWS.includes(view)) {
      this.view = view
    }

    this.setValidDate()

    if ('communication_id' in this.$route.query) {
      this.$axios.get('/api/v1/calendar/events/show/' + this.$route.query.communication_id + '/communication').then(res => {
        this.editSchedule(res.data)
      })
    }

    this.$nextTick(() => {
      this.$refs.scheduler.setCurrentView(this.gotoDate, this.view)
    })
  },

  methods: {
    ...mapActions('auth', ['setProfile']),

    onDateSelected (date) {
      this.gotoDate = date
      this.onToggleGotoDate(date)
      this.$refs.scheduler.setCurrentView(this.gotoDate, this.view)
    },

    changeDirection (direction) {
      let date = direction === 'today'
        ? new Date()
        : moment(this.gotoDate)[direction](1, this.stepMap[this.view]).toDate()

      this.gotoDate = date
      this.onToggleGotoDate(date)

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
      const requestId = Date.now().toString()
      this.requestQueue.push(requestId)

      // Set loading state for this specific request
      this.$set(this.loadingStates, requestId, true)

      // Update the overall loading state
      this.updateOverallLoadingState()

      // Cancel the previous request if it exists
      if (this.source) {
        this.source.cancel('Calendar: Previous request cancelled.')
      }

      this.source = this.cancel_token.source()

      this.filters.calendar_mode = state.mode
      this.filters.calendar_min_date = moment.utc(state.min_date).startOf('day').toISOString()
      this.filters.calendar_max_date = moment.utc(state.max_date).endOf('day').toISOString()
      this.filters.limit = this.getLimitFilterValue()

      if (this.filters.page === 1) {
        this.events = []
        this.$refs.scheduler.clearAll()
      }

      this.$axios.get('/api/v1/calendar/events', {
        params: this.filters,
        cancelToken: this.source.token
      }).then(res => {
        this.events.push(...res.data)
        this.$refs.scheduler.customParse(this.eventsConvertedToTheRightTimezone)
        this.$refs.scheduler.setNavHeightForMultiDayEvents()

        if (res.data && res.data.length) {
          this.filters.page++
          this.reloadFromCurrentFilter()
        }
      }).catch(err => {
        if (!this.$axios.isCancel(err)) {
          console.log(err)
        }
      }).finally(() => {
        // Remove the request from the queue
        const index = this.requestQueue.indexOf(requestId)
        if (index > -1) {
          this.requestQueue.splice(index, 1)
        }

        // Set loading state for this specific request to false
        this.$set(this.loadingStates, requestId, false)

        // Update the overall loading state
        this.updateOverallLoadingState()
      })
    },

    updateOverallLoadingState () {
      // If any request is still loading, keep the overall loading state true
      this.loading = Object.values(this.loadingStates).some(state => state === true)
    },

    getLimitFilterValue () {
      if (this.view === MONTH_VIEW) {
        return 2500
      }

      if (this.view === WEEK_VIEW) {
        return 1000
      }

      if (this.view === DAY_VIEW) {
        return 500
      }

      return 2500
    },

    reloadFromCurrentFilter () {
      let state = {
        mode: this.filters.calendar_mode,
        min_date: this.filters.calendar_min_date,
        max_date: this.filters.calendar_max_date
      }

      if (this.view === MONTH_VIEW) {
        const startOfMonth = moment.utc(this.gotoDate).startOf('month')
        const endOfMonth = moment.utc(this.gotoDate).endOf('month')
        state.min_date = startOfMonth.toISOString()
        state.max_date = endOfMonth.toISOString()
      }

      if (this.view === WEEK_VIEW) {
        const startOfWeek = moment.utc(this.gotoDate).startOf('isoWeek')
        const endOfWeek = moment.utc(this.gotoDate).endOf('isoWeek')
        state.min_date = startOfWeek.toISOString()
        state.max_date = endOfWeek.toISOString()
      }

      if (this.view === DAY_VIEW) {
        state.min_date = moment.utc(this.gotoDate).startOf('day').toISOString()
        state.max_date = moment.utc(this.gotoDate).endOf('day').toISOString()
      }

      this.loadCalendarData(state)
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
      let data = engagement.data
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

      if (this.isShowingEventEditModal) {
        this.isShowingEventEditModal = false
        this.isEventsModalOpen = true
      }

      this.$refs.scheduler.customParse(this.eventsConvertedToTheRightTimezone)
    },

    viewChange (mode, newDate) {
      this.view = mode
    },

    updateTimeFormat () {
      const payload = Object.assign({ ...this.profile }, { time_format: this.timeFormat })
      api.V1.user.update(this.profile.id, payload)
        .then(res => {
          this.setProfile(res.data)
          this.$refs.scheduler.reInit(this.gotoDate, this.view)
        })
    },

    goToDayView (date) {
      this.view = DAY_VIEW
      this.gotoDate = date.toDate()
      this.$refs.scheduler.setCurrentView(this.gotoDate, this.view)

      const newQuery = {
        ...this.$route.query,
        view: this.view,
        date: moment(this.gotoDate).format('YYYY-MM-DD')
      }

      this.updateRouteQuery(newQuery)
    },

    onToggleGotoDate (date, view) {
      const formattedDate = moment(date).format('YYYY-MM-DD')

      if (view) {
        this.view = view
      }

      const newQuery = {
        ...this.$route.query,
        date: formattedDate
      }

      this.updateRouteQuery(newQuery)
    },

    updateRouteQuery (newQuery) {
      // Compare the new query with the current route's query to prevent unnecessary navigation which causes errors
      if (JSON.stringify(newQuery) !== JSON.stringify(this.$route.query)) {
        this.$router.push({ query: newQuery })
      }
    },

    setValidDate (shouldSetCurrentView = false) {
      const { date } = this.$route.query
      if (date) {
        const parsedDate = moment(date)
        if (parsedDate.isValid()) {
          this.gotoDate = parsedDate.toDate()
          return shouldSetCurrentView ? this.$refs.scheduler.setCurrentView(this.gotoDate, this.view) : null
        }

        // If date is invalid, set gotoDate to today
        this.gotoDate = moment().toDate()
        const newQuery = {
          ...this.$route.query,
          date: moment(this.gotoDate).format('YYYY-MM-DD')
        }

        this.updateRouteQuery(newQuery)
        return shouldSetCurrentView ? this.$refs.scheduler.setCurrentView(this.gotoDate, this.view) : null
      }

      // If no date provided, default to today
      this.gotoDate = moment().toDate()
      const newQuery = {
        ...this.$route.query,
        date: moment(this.gotoDate).format('YYYY-MM-DD')
      }

      this.updateRouteQuery(newQuery)
      return shouldSetCurrentView ? this.$refs.scheduler.setCurrentView(this.gotoDate, this.view) : null
    },

    showAllEvents (date) {
      this.selectedDate = moment(date).format('YYYY-MM-DD')
      this.eventsModalMode = 'list'
      this.isEventsModalOpen = true
    },

    showEventsForHour (selectedDate) {
      this.selectedHour = selectedDate
      this.eventsModalMode = HOUR_VIEW
      this.isEventsModalOpen = true
    },

    openEventModal (event) {
      this.editSchedule(event)
      this.isEventsModalOpen = false
      this.isShowingEventEditModal = true
    },

    closeEventModal () {
      if (this.isShowingEventEditModal) {
        this.isShowingEventEditModal = false
        this.isEventsModalOpen = true
      }
    }
  },

  watch: {
    view () {
      const newQuery = {
        ...this.$route.query,
        view: this.view
      }

      this.updateRouteQuery(newQuery)

      this.$refs.scheduler.setCurrentView(this.gotoDate, this.view)
    },
    '$route.query': {
      handler (newQuery) {
        const { view } = newQuery

        if (view && CALENDAR_VIEWS.includes(view)) {
          this.view = view
        }

        this.setValidDate(true)
      },
      deep: true
    }
  }
}
</script>
