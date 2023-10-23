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
        console.log('value?.current_status2: ', value?.current_status2)
        console.log('typeof value.current_status2: ', typeof value?.current_status2)
        console.log('typeof CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW: ', typeof CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW)
        console.log('value && value.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW: ', (value && value.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW))
        if (value && value.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW) {
          this.isCallInProgressStatus = true

          return
        }

        this.isCallInProgressStatus = false
      }
    }
  }
}
