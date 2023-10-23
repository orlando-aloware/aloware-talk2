import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import { mapState } from 'vuex'

export default {
  data: {
    isCallInProgressStatus: false
  },

  computed: {
    ...mapState(['dialer'])
  },

  watch: {
    'dialer.communication': {
      deep: true,
      handler (value) {
        if (value && value.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW) {
          this.isCallInProgressStatus = true

          return
        }

        this.isCallInProgressStatus = false
      }
    }
  }
}
