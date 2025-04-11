import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['dialer']),

    isCallInProgressStatus () {
      return this.dialer?.communication?.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW
    }
  }
}
