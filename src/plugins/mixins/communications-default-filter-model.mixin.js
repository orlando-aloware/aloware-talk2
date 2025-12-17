import { mapState, mapGetters } from 'vuex'
const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export default {
  computed: {
    ...mapState(['currentTimezone']),

    ...mapState('auth', [
      'profile'
    ]),

    ...mapGetters('communications',
      {
        baseModel: 'channelDefaultFilterModel'
      }
    ),

    channelDefaultFilterModel () {
      const profilePreference = this.profile?.default_report_period || 'day'

      return {
        ...this.baseModel,
        filter: {
          ...this.baseModel.filter,
          from_date: this.getDefaultFilterFromDate(profilePreference),
          to_date: this.getDefaultFilterToDate()
        }
      }
    }
  },
  methods: {
    getDefaultFilterToDate () {
      const toDate = window.moment().tz(this.currentTimezone).endOf('day').format(DATE_FORMAT)
      return toDate
    },

    getDefaultFilterFromDate (range) {
      if (range === 'day') {
        return window.moment().tz(this.currentTimezone).startOf('day').format(DATE_FORMAT)
      }

      if (range === 'week') {
        return window.moment().tz(this.currentTimezone).subtract(7, 'days').startOf('day').format(DATE_FORMAT)
      }

      if (range === 'month') {
        return window.moment().tz(this.currentTimezone).subtract(30, 'days').startOf('day').format(DATE_FORMAT)
      }
    }

  }
}
