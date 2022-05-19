import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import { mapActions, mapState } from 'vuex'

export default {
  computed: {
    ...mapState([
      'loadingParkedCalls',
      'parkedCalls'
    ])
  },

  created () {
    this.$VueEvent.listen('update_communication', (data) => {
      if (data.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW) {
        this.removeParkedCall(data.id)
        return
      }

      if (data.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW) {
        this.addParkedCall(data)
      }
    })
  },

  methods: {
    ...mapActions([
      'setParkedCalls',
      'setLoadingParkedCalls',
      'addParkedCall',
      'removeParkedCall'
    ]),

    fetchAllParkedCalls () {
      this.setLoadingParkedCalls(false)
      return this.$axios
        .post('/api/v1/contact-center/parked-calls')
        .then((res) => {
          console.log(res)
          this.setParkedCalls(res.data)
          this.setLoadingParkedCalls(false)
          return Promise.resolve()
        })
        .catch((error) => {
          const {
            message,
            html
          } = extractErrorMessage(error)
          console.log(html)
          this.$generalNotification(message, 'error')
          this.setLoadingParkedCalls(false)
          return Promise.reject()
        })
    }
  }
}
