import _ from 'lodash'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'

export default {
  data () {
    return {
      parkedCalls: [],
      loadingParkedCalls: false
    }
  },

  created () {
    this.$VueEvent.listen('update_communication', (data) => {
      const found = this.parkedCalls.find(parkedCall => parkedCall.id === data.id)

      if (data.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW && found) {
        this.parkedCalls.splice(this.parkedCalls.indexOf(found), 1)
        return
      }

      if (data.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW && !found) {
        this.parkedCalls.push(data)
      }
    })
  },

  mounted () {
    this.fetchAllParkedCalls()
  },

  methods: {
    fetchAllParkedCalls: _.debounce(function () {
      this.loadingParkedCalls = true
      this.$axios
        .post('/api/v1/contact-center/parked-calls')
        .then((res) => {
          console.log(res)
          this.parkedCalls = res.data
          this.loadingParkedCalls = false
        })
        .catch((error) => {
          const {
            message,
            html
          } = extractErrorMessage(error)
          console.log(html)
          this.$generalNotification(message, 'error')
          this.loadingParkedCalls = false
        })
    })
  },

  beforeDestroy () {
    this.$VueEvent.stop('update_communication')
  }
}
