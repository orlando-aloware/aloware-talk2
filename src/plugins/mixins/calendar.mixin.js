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

    getStartEndTime ({ currentStart, currentEnd, browserStart, browserEnd }) {
      return {
        currentStartTime: currentStart ? moment(currentStart).tz(this.currentTimezone).format(this.timeFormat) : null,
        currentStartDate: currentStart ? moment(currentStart).tz(this.currentTimezone).format('MM-DD') : null,
        currentEndTime: currentEnd ? moment(currentEnd).tz(this.currentTimezone).format(this.timeFormat) : null,
        currentEndDate: currentEnd ? moment(currentEnd).tz(this.currentTimezone).format('MM-DD') : null,
        currentTimeAcronym: currentStart ? moment(currentStart).tz(this.currentTimezone).format('z') : null,
        localStartTime: browserStart ? moment(browserStart).tz(this.browserTimeZone).format(this.timeFormat) : null,
        localStartDate: browserStart ? moment(browserStart).tz(this.browserTimeZone).format('MM-DD') : null,
        localEndTime: browserEnd ? moment(browserEnd).tz(this.browserTimeZone).format(this.timeFormat) : null,
        localEndDate: browserEnd ? moment(browserEnd).tz(this.browserTimeZone).format('MM-DD') : null,
        localTimeAcronym: browserStart ? moment(browserStart).tz(this.browserTimeZone).format('z') : null
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
    }
  }
}
