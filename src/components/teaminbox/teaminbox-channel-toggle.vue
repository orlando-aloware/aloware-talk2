<template>
  <div class="channel-toggle-wrapper d-flex align-items-center">
    <q-btn-toggle class="channel-toggle"
                  no-caps
                  rounded
                  unelevated
                  toggle-color="primary"
                  color="grey-3"
                  text-color="grey-8"
                  spread
                  :options="options"
                  :value="viewMode"
                  @input="onChange">
      <template #[option.slot]
                v-for="option in options">
        <div class="d-flex align-items-center"
             :key="option.slot">
          <span>{{ option.text }}</span>

          <information-circle-icon height="16"
                                   width="16"
                                   class="ml-1"
                                   :color="viewMode === option.value ? '#fff' : '#256eff'"
                                   :id="`teaminbox-channel-${option.slot}`"/>

          <b-tooltip custom-class="talk-table__tooltip"
                     :target="`teaminbox-channel-${option.slot}`">
            {{ option.description }}
          </b-tooltip>
        </div>
      </template>
    </q-btn-toggle>

    <div class="teaminbox-date-picker-container">
      <date-range-picker ref="picker"
                         control-container-class="teaminbox-datepicker-control"
                         closeOnEsc
                         :class="[dateHasChanges ? 'daterange-picker-highlighted' : '']"
                         opens="right"
                         :ranges="ranges"
                         always-show-calendars
                         auto-apply
                         v-model="dateRange"
                         @toggle="pickerToggle"
                         @finish-selection="onFinishSelection">
        <template v-slot:input>
          <q-btn flat
                 round
                 dense
                 class="date-picker-trigger">
            <calendar-icon height="16"
                          width="16"
                          color="#256eff"/>
          </q-btn>
        </template>
      </date-range-picker>
    </div>
  </div>
</template>

<script>
import { THREADED, UNTHREADED } from 'src/store/teaminbox/teaminbox.store'
import { mapActions, mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import InformationCircleIcon from 'components/icons/information-circle-icon.vue'
import CalendarIcon from 'components/icons/calendar-icon.vue'
import DateRangePicker from 'vue2-daterange-picker'
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css'
import { navigationErrorHandler } from 'src/router/routes'
import moment from 'moment'

export default {
  components: {
    InformationCircleIcon,
    CalendarIcon,
    DateRangePicker
  },

  mounted () {
    this.initializeViewModeFilter()
    this.initializeDateRanges()
    this.initializeDatePicker()
  },

  computed: {
    ...mapState('TeamInbox', [
      'viewMode'
    ]),

    ...mapFields('TeamInbox', [
      'activeFilters'
    ]),

    options () {
      return [
        {
          text: 'Threaded',
          slot: 'one',
          value: THREADED,
          description: 'View all messages and calls grouped by contact, making it easy to follow conversations in one place'
        },
        {
          text: 'Unthreaded',
          slot: 'two',
          value: UNTHREADED,
          description: 'See all messages and calls in chronological order, essentially a communication log'
        }
      ]
    },

    dateHasChanges () {
      return this.activeFilters.from_date !== null || this.activeFilters.to_date !== null
    }
  },

  data () {
    return {
      dateRange: {
        startDate: null,
        endDate: null
      },
      ranges: {}
    }
  },

  filters: {
    date (date) {
      return moment(date).format('MM/DD/YYYY')
    }
  },

  methods: {
    ...mapActions('TeamInbox', ['setViewMode']),

    onChange (value) {
      this.updateUrlViewMode(value)

      if (!this.validateViewMode(value)) {
        return
      }

      if (value === this.viewMode) {
        return
      }

      this.setViewMode(value)
      this.$emit('channel', value)
    },

    validateViewMode (value) {
      return [THREADED, UNTHREADED].includes(value)
    },

    parseUrlViewMode (viewMode) {
      return viewMode === 'Unthreaded' ? UNTHREADED : THREADED
    },

    initializeViewModeFilter () {
      // Initialize from URL if available
      const urlViewMode = this.$route.query.viewMode
      this.onChange(urlViewMode ? this.parseUrlViewMode(urlViewMode) : this.viewMode)
    },

    updateUrlViewMode (viewMode) {
      if (!this.validateViewMode(viewMode)) {
        return
      }

      const query = { ...this.$route.query }
      query.viewMode = viewMode === THREADED ? 'Threaded' : 'Unthreaded'
      this.$router.replace({ query }).catch(navigationErrorHandler)
    },

    openPicker () {
      this.$refs.picker.togglePicker()
    },

    pickerToggle (isOpen) {
      if (isOpen) {
        this.$nextTick(() => {
          const pickerElement = this.$refs.picker.$el
          const listItems = pickerElement.querySelectorAll('li')

          listItems.forEach(li => {
            li.addEventListener('click', () => {
              this.activeFilters.date_range = li.getAttribute('data-range-key')
            })

            li.classList.remove('active')

            if (li.getAttribute('data-range-key') === this.activeFilters.date_range) {
              li.classList.add('active')
            }
          })
        })
      }
    },

    onFinishSelection (dateRange) {
      this.activeFilters.date_range = 'custom'
    },

    getDateRangeInputLabel () {
      if (this.dateRange.startDate && this.dateRange.endDate) {
        return `${this.$options.filters.date(this.dateRange.startDate)} - ${this.$options.filters.date(this.dateRange.endDate)}`
      }
      return 'All Time'
    },

    parseDatePicker (date) {
      if (!date) {
        return null
      }
      return moment(date)._d
    },

    initializeDateRanges () {
      const timezone = this.$store.state.currentTimezone || 'UTC'
      const DATE_FORMAT = 'MM/DD/YYYY HH:mm:ss'

      this.ranges = {
        'Today': [this.parseDatePicker(moment().tz(timezone).startOf('day').format(DATE_FORMAT)), this.parseDatePicker(moment().tz(timezone).endOf('day').format(DATE_FORMAT))],
        'Yesterday': [this.parseDatePicker(moment().tz(timezone).subtract(1, 'days').startOf('day').format(DATE_FORMAT)), this.parseDatePicker(moment().tz(timezone).subtract(1, 'days').endOf('day').format(DATE_FORMAT))],
        'Last 7 Days': [this.parseDatePicker(moment().tz(timezone).subtract(7, 'days').startOf('day').format(DATE_FORMAT)), this.parseDatePicker(moment().tz(timezone).endOf('day').format(DATE_FORMAT))],
        'Last 30 Days': [this.parseDatePicker(moment().tz(timezone).subtract(30, 'days').startOf('day').format(DATE_FORMAT)), this.parseDatePicker(moment().tz(timezone).endOf('day').format(DATE_FORMAT))],
        'This Month So Far': [this.parseDatePicker(moment().tz(timezone).startOf('month').format(DATE_FORMAT)), this.parseDatePicker(moment().tz(timezone).endOf('day').format(DATE_FORMAT))],
        'Last Month': [this.parseDatePicker(moment().tz(timezone).subtract(1, 'months').startOf('month').format(DATE_FORMAT)), this.parseDatePicker(moment().tz(timezone).subtract(1, 'months').endOf('month').format(DATE_FORMAT))],
        'All Time': [null, null]
      }
    },

    initializeDatePicker () {
      this.$watch(
        () => [this.activeFilters.from_date, this.activeFilters.to_date],
        (value) => {
          this.dateRange.startDate = value[0]
          this.dateRange.endDate = value[1]
        }
      )

      this.dateRange.startDate = this.activeFilters.from_date
      this.dateRange.endDate = this.activeFilters.to_date
    }
  },

  watch: {
    '$route.query.viewMode' (viewMode) {
      this.onChange(viewMode ? this.parseUrlViewMode(viewMode) : this.viewMode)
    },

    dateRange: {
      deep: true,
      handler () {
        let startDate = moment(this.dateRange.startDate)
        let endDate = moment(this.dateRange.endDate)

        if (startDate.isValid() && endDate.isValid() && startDate.format('HH:mm:ss') === endDate.format('HH:mm:ss')) {
          startDate.set({ hour: 0, minute: 0, second: 0 })
          endDate.set({ hour: 23, minute: 59, second: 59 })
          this.dateRange.startDate = startDate.format('YYYY-MM-DD HH:mm:ss')
          this.dateRange.endDate = endDate.format('YYYY-MM-DD HH:mm:ss')
        }

        this.activeFilters.from_date = this.dateRange.startDate ? startDate.format('YYYY-MM-DD HH:mm:ss') : null
        this.activeFilters.to_date = this.dateRange.endDate ? endDate.format('YYYY-MM-DD HH:mm:ss') : null

        this.$emit('date-change', this.activeFilters)
      }
    }
  }
}
</script>

<style lang="scss">
.channel-toggle-wrapper {
  padding: 2px 12px;
  width: 100%;
  min-width: 200px;
  display: flex;
  align-items: center;

  .channel-toggle {
    flex: 1;

    .q-btn {
      min-height: 28px;
      padding: 2px 24px;
      font-size: 14px;
      font-weight: 500;
    }

    .q-btn[aria-pressed="false"] {
      color: #256eff !important;
    }
  }

  .teaminbox-date-picker-container {
    display: flex;
    margin-left: 3px;
    margin-right: -6px;
    position: relative;

    .vue-daterange-picker {
      min-width: auto;
      width: 32px;
    }

    .daterangepicker {
      left: initial;
      right: 0;

      @media screen and (min-width: 785px) {
        left: -225px;
        right: initial;
      }

      &.opensright {
        &:before {
          left: initial;
          right: 6px;
        }
        &:after {
          left: initial;
          right: 7px;
        }

        @media screen and (min-width: 785px) {
          &:before {
            left: 234px;
            right: initial;
          }
          &:after {
            left: 235px;
            right: initial;
          }
        }
      }
    }
  }
}

.daterange-picker-highlighted {
  border-color: #256eff !important;
}
</style>
