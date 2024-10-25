import { mapState } from 'vuex'
import moment from 'moment'

export default {
  data () {
    return {
      browserTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
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
      return date?.format('z')
    },

    getHourScaleTemplate (date, Scheduler) {
      // Get the current date being displayed in the scheduler
      const schedulerStateDate = Scheduler.getState().date // This is the date currently displayed in the scheduler

      // Create a new date using the scheduler's date but with the hour from the date parameter.
      // This is necessary because the date parameter comes with date 1980-01-01 by default and make inconsistent the timezones when needs to differ PDT and PST for example.
      const adjustedDate = this.getAdjustedDate(schedulerStateDate, date)

      const dateInBrowserTimeZone = this.getDateInBrowserTimeZone(adjustedDate)
      const localTime = this.getLocalTime(dateInBrowserTimeZone)
      const localTimeAcronym = this.getLocalTimeAcronym(dateInBrowserTimeZone)

      if (this.timezoneIsDifferentThanBrowser && !this.isMobile) {
        const dateInCurrentTimezone = moment(adjustedDate).tz(this.currentTimezone)
        const currentTimezoneTime = dateInCurrentTimezone.format(this.profile.time_format === 1 ? 'h A' : 'H:00')
        const currentTimezoneAcronym = dateInCurrentTimezone.format('z')

        return `
          <div class="hour-label" data-hour="${dateInBrowserTimeZone.hour()}">
            <div class="time-column current-time" data-hour="${dateInBrowserTimeZone.hour()}">
              ${currentTimezoneTime} ${currentTimezoneAcronym}
            </div>
            <div class="time-column local-time" data-hour="${dateInBrowserTimeZone.hour()}">
              ${localTime} ${localTimeAcronym}
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
        acronym: momentDate.format('z')
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
        currentStartTime,
        currentEndTime,
        currentTimeAcronym,
        localStartTime,
        localEndTime,
        localTimeAcronym
      } = this.getStartEndTime({ currentStart: start, currentEnd: end, browserStart: start, browserEnd: end })

      let timeString
      if (this.timezoneIsDifferentThanBrowser && !this.isMobile) {
        timeString = `${currentStartTime} - ${currentEndTime} ${currentTimeAcronym} / ${localStartTime} - ${localEndTime} ${localTimeAcronym}`
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

    getWeekStartAndEnd (date) {
      const [startStr, endStr] = date.split(' - ')
      return {
        startOfWeek: moment(startStr, 'D MMM YYYY'),
        endOfWeek: moment(endStr, 'D MMM YYYY')
      }
    },

    matchesSearch (eventText) {
      return eventText?.toLowerCase()?.includes(this.searchQuery.toLowerCase())
    },

    filterEventsForWeek (extraCondition) {
      const { startOfWeek, endOfWeek } = this.getWeekStartAndEnd(this.currentDate)
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
