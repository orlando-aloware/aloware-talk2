<template>
  <div class="teaminbox-date-picker-container">
    <date-range-picker
      ref="picker"
      control-container-class="teaminbox-datepicker-control"
      closeOnEsc
      :class="[dateHasChanges ? 'daterange-picker-highlighted' : '']"
      opens="right"
      :ranges="ranges"
      always-show-calendars
      auto-apply
      v-model="dateRange"
      @toggle="pickerToggle"
      @finish-selection="onFinishSelection"
    >
      <template v-slot:input>
        <q-btn flat
               round
               dense
               title="Filter by Date"
               id="teaminbox-datepicker-btn"
               class="date-picker-trigger">
          <calendar-icon height="16" width="16" color="#256eff" />
          <b-tooltip custom-class="talk-table__tooltip teaminbox-tooltip"
                     placement="right"
                     boundary="window"
                     triggers="hover"
                     target="teaminbox-datepicker-btn">
            Click to filter by date
          </b-tooltip>
        </q-btn>
      </template>
    </date-range-picker>
  </div>
</template>

<script>
import { mapFields } from 'vuex-map-fields'
import CalendarIcon from 'components/icons/calendar-icon.vue'
import DateRangePicker from 'vue2-daterange-picker'
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css'
import moment from 'moment'

export default {
  components: {
    CalendarIcon,
    DateRangePicker
  },

  mounted () {
    this.initializeDateRanges()
    this.initializeDatePicker()
  },

  computed: {
    ...mapFields('TeamInbox', ['activeFilters']),

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

  methods: {
    openPicker () {
      this.$refs.picker.togglePicker()
    },

    pickerToggle (isOpen) {
      if (isOpen) {
        this.$nextTick(() => {
          const pickerElement = this.$refs.picker.$el
          const listItems = pickerElement.querySelectorAll('li')

          listItems.forEach((li) => {
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

    onFinishSelection () {
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
        'This Month to Date': [this.parseDatePicker(moment().tz(timezone).startOf('month').format(DATE_FORMAT)), this.parseDatePicker(moment().tz(timezone).endOf('day').format(DATE_FORMAT))],
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
.teaminbox-date-picker-container {
  display: flex;
  margin-left: 3px;
  margin-right: -6px;
  position: relative;

  .vue-daterange-picker {
    min-width: auto;
    width: 32px;
  }

  .daterangepicker.opensright {
    left: initial;
    right: 0;

    @media screen and (min-width: 785px) {
      left: -225px;
      right: initial;
    }

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
.daterange-picker-highlighted {
  border-color: #256eff !important;
}
</style>
