import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('cache', [
      'currentCompany'
    ]),

    companyBroadcastOpenDate () {
      return window.moment(this.companyDate.format('YYYY-MM-DD') + ' ' + this.currentCompany.broadcast_open)
    },

    companyBroadcastCloseDate () {
      return window.moment(this.companyDate.format('YYYY-MM-DD') + ' ' + this.currentCompany.broadcast_close)
    },

    broadcastOperatingHoursText () {
      return this.companyBroadcastOpenDate.format('h:mm A') + ' - ' + this.companyBroadcastCloseDate.format('h:mm A')
    },

    companyDate () {
      return window.moment(this.utcDate).tz(this.currentCompany.timezone)
    },

    utcDate () {
      return window.moment().tz('UTC')
    },

    companyTimezone () {
      return window.moment().tz(this.currentCompany.timezone).format('z')
    }
  }
}
