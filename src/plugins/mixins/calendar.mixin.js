import { mapState } from 'vuex'
import moment from 'moment'
import { browserTimezone } from 'src/utils'

export default {
  data () {
    return {
      browserTimeZone: browserTimezone(),
      // Testing
      isHourScaleHeaderAdded: false
    }
  },

  computed: {
    ...mapState('auth', ['profile']),
    ...mapState(['currentTimezone']),

    timezoneIsDifferentThanBrowser () {
      return this.browserTimeZone !== this.currentTimezone
    },

    timeFormat () {
      return this.profile.time_format === 1 ? 'h:mm A' : 'HH:mm'
    },

    listViewTimeFormat () {
      return this.profile.time_format === 1 ? 'D MMM YYYY, h A' : 'D MMM YYYY, H:mm'
    }
  },

  methods: {
    getAdjustedDate (schedulerStateDate, date) {
      const adjustedDate = new Date(
        schedulerStateDate.getFullYear(),
        schedulerStateDate.getMonth(),
        schedulerStateDate.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
      )

      return adjustedDate
    },

    getDateInBrowserTimeZone (date) {
      return moment(date).tz(this.browserTimeZone)
    },

    getLocalTime (date) {
      return date?.format(this.profile.time_format === 1 ? 'h A' : 'H:00')
    },

    getLocalTimeAcronym (date) {
      return this.getTimeZoneAbbreviation(date, this.browserTimeZone)
    },

    // Testing
    getTimeZoneAbbreviation (date, timeZone) {
      if (!date) return null
      const options = { timeZoneName: 'short', timeZone }
      const formatter = new Intl.DateTimeFormat('en-US', options)
      const parts = formatter.formatToParts(date.toDate()) // Convert moment to Date object
      const timeZoneName = parts.find(part => part.type === 'timeZoneName').value
      return timeZoneName
    },

    getHourScaleTemplate (date, Scheduler) {
      // Get the current date being displayed in the scheduler
      const schedulerStateDate = Scheduler.getState().date // This is the date currently displayed in the scheduler

      // Create a new date using the scheduler's date but with the hour from the date parameter.
      // This is necessary because the date parameter comes with date 1980-01-01 by default and make inconsistent the timezones when needs to differ PDT and PST for example.
      const adjustedDate = this.getAdjustedDate(schedulerStateDate, date)

      const dateInBrowserTimeZone = this.getDateInBrowserTimeZone(adjustedDate)
      const localTime = this.getLocalTime(dateInBrowserTimeZone)
      // const localTimeAcronym = this.getLocalTimeAcronym(dateInBrowserTimeZone)

      if (this.timezoneIsDifferentThanBrowser && !this.isMobile) {
        const dateInCurrentTimezone = moment(adjustedDate).tz(this.currentTimezone)
        const currentTimezoneTime = dateInCurrentTimezone.format(this.profile.time_format === 1 ? 'h A' : 'H:00')

        return `
          <div class="hour-label" data-hour="${dateInBrowserTimeZone.hour()}">
            <div class="time-column current-time" data-hour="${dateInBrowserTimeZone.hour()}">
              ${currentTimezoneTime}
            </div>
            <div class="time-column local-time" data-hour="${dateInBrowserTimeZone.hour()}">
              ${localTime}
            </div>
          </div>
        `
      }

      return `
        <div class="hour-label" data-hour="${dateInBrowserTimeZone.hour()}">
          <div class="time-column local-time" data-hour="${dateInBrowserTimeZone.hour()}">
            ${localTime}
          </div>
        </div>
      `
    },

    addTimeZoneHeaderRow (view) {
      if (this.timezoneIsDifferentThanBrowser && !this.isMobile) {
        // Get the scheduler container
        const schedulerContainer = this.$refs.scheduler

        if (!schedulerContainer) return

        // Get a date to use for obtaining time zone abbreviations
        const date = new Date()

        // Get time zone abbreviations

        const dateInCurrentTimezone = moment(date).tz(this.currentTimezone)
        const currentTimezoneAcronym = this.getTimeZoneAbbreviation(dateInCurrentTimezone, this.currentTimezone)

        // Find the header
        const tableHeader = document.querySelector('.scheduler__header__table')

        if (tableHeader) {
          // Create the header row
          const ROW_ID = 'time-zone-header-row'

          const node = document.getElementById(ROW_ID)

          // in month view we don't need the timezone header
          if (view === 'month') {
            // remove if exists
            if (node) {
              node.remove()
            }
            return
          }

          // if the header row already exists, don't add it again
          if (node) {
            return
          }

          const headerRow = this.buildTimeZoneHeaderRow(ROW_ID, currentTimezoneAcronym)

          // Insert the timezone in the header if not exists already
          tableHeader.parentElement.insertBefore(headerRow, tableHeader)
        }
      }
    },

    buildTimeZoneHeaderRow (id, companyTimezone) {
      const headerRow = document.createElement('div')
      headerRow.id = id
      headerRow.className = 'row text-center'
      headerRow.style.height = '44px'
      headerRow.style.width = '160px'

      const currentTimeZoneDiv = document.createElement('div')
      currentTimeZoneDiv.className = 'col-6 mt-auto pb-1'
      currentTimeZoneDiv.textContent = companyTimezone || ''
      currentTimeZoneDiv.title = 'Company Timezone' || ''

      const localTimeZoneDiv = document.createElement('div')
      localTimeZoneDiv.className = 'col-6 mt-auto pb-1'
      localTimeZoneDiv.textContent = ''

      headerRow.appendChild(currentTimeZoneDiv)
      headerRow.appendChild(localTimeZoneDiv)
      return headerRow
    },

    formatDateTime (date, timezone) {
      if (!date) {
        return {
          time: null,
          date: null,
          acronym: null
        }
      }

      const momentDate = moment(date).tz(timezone)
      return {
        time: momentDate.format(this.timeFormat),
        date: momentDate.format('MM-DD'),
        // acronym: momentDate.format('z')
        acronym: this.getTimeZoneAbbreviation(momentDate, timezone)
      }
    },

    getStartEndTime ({ currentStart, currentEnd, browserStart, browserEnd }) {
      // Format current times
      const currentStartFormatted = this.formatDateTime(currentStart, this.currentTimezone)
      const currentEndFormatted = this.formatDateTime(currentEnd, this.currentTimezone)

      // Format local (browser) times
      const localStartFormatted = this.formatDateTime(browserStart, this.browserTimeZone)
      const localEndFormatted = this.formatDateTime(browserEnd, this.browserTimeZone)

      return {
        currentStartTime: currentStartFormatted.time,
        currentStartDate: currentStartFormatted.date,
        currentEndTime: currentEndFormatted.time,
        currentEndDate: currentEndFormatted.date,
        currentTimeAcronym: currentStartFormatted.acronym,
        localStartTime: localStartFormatted.time,
        localStartDate: localStartFormatted.date,
        localEndTime: localEndFormatted.time,
        localEndDate: localEndFormatted.date,
        localTimeAcronym: localStartFormatted.acronym
      }
    },

    getFormattedTime (hour, timeFormat) {
      return {
        currentTime: moment(hour).tz(this.currentTimezone).format(timeFormat),
        currentTimeAcronym: moment(hour).tz(this.currentTimezone).format('z'),
        localTime: moment(hour).tz(this.browserTimeZone).format(timeFormat),
        localTimeAcronym: moment(hour).tz(this.browserTimeZone).format('z')
      }
    },

    getEventTextTemplate (start, end, event) {
      const {
        localStartTime,
        localEndTime
      } = this.getStartEndTime({ currentStart: start, currentEnd: end, browserStart: start, browserEnd: end })

      let timeString
      if (this.timezoneIsDifferentThanBrowser && !this.isMobile) {
        timeString = `${localStartTime} - ${localEndTime}`
      } else {
        timeString = `${localStartTime} - ${localEndTime}`
      }

      return `
        <div class="event-content">
          <div class="event-time">${timeString}</div>
          <div class="event-text">${event.text}</div>
        </div>
      `
    },

    getMomentObjectForWeekStartAndEnd (date) {
      const [firstDay, lastDayMonthYear] = date.split(' - ')
      const [lastDay, month, year] = lastDayMonthYear.split(' ')
      return {
        startOfWeek: moment(`${firstDay} ${month} ${year}`, 'D MMM YYYY'),
        endOfWeek: moment(`${lastDay} ${month} ${year}`, 'D MMM YYYY')
      }
    },

    matchesSearch (eventText) {
      return eventText?.toLowerCase()?.includes(this.searchQuery.toLowerCase())
    },

    filterEventsForWeek (dateRangeString, extraCondition) {
      const { startOfWeek, endOfWeek } = this.getMomentObjectForWeekStartAndEnd(dateRangeString)

      return this.events.filter(event => {
        const eventStart = moment(event.start_date)
        const matchesSearch = this.matchesSearch(event.text)
        const isInWeek = eventStart.isBetween(startOfWeek, endOfWeek, null, '[]')
        const extra = extraCondition ? extraCondition(event) : true

        return isInWeek && matchesSearch && extra
      })
    },

    filterEventsForDate (granularity, selectedMoment) {
      return this.events.filter(event => {
        const eventStart = moment(event.start_date)
        const eventEnd = moment(event.end_date)
        const matchesSearch = this.matchesSearch(event.text)

        let isMatch = false
        if (granularity === 'hour') {
          isMatch =
            eventStart.isSame(selectedMoment, 'hour') ||
            (eventStart.isBefore(selectedMoment) && eventEnd.isAfter(selectedMoment))
        } else if (granularity === 'day') {
          isMatch = eventStart.isSame(selectedMoment, 'day')
        }

        return isMatch && matchesSearch
      })
    }

  }
}
