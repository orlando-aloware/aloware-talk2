
export default {
  methods: {
    thirtyDaysAgo () {
      if (window.timezone) {
        return this.$moment.utc().tz(window.timezone).subtract(30, 'days').startOf('day')
      } else {
        return this.$moment.utc().local().subtract(30, 'days').startOf('day')
      }
    },

    localizedMoment (dt, format) {
      if (dt) {
        if (window.timezone) {
          return this.$moment(dt, format).utc().tz(window.timezone)
        } else {
          return this.$moment(dt, format).utc().local()
        }
      } else {
        if (window.timezone) {
          return this.$moment.tz(window.timezone)
        } else {
          return this.$moment.locale()
        }
      }
    }
  }
}
