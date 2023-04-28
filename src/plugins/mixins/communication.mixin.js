import * as AgentStatus from 'src/constants/agent-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationTypes from 'src/constants/communication-types'

export default {
  computed: {
    isAnAgentPermittedToBargeAndWhisperOnCall () {
      return this.hasRole('Company Agent') && this.hasPermissionTo('barge and whisper on call')
    }
  },

  methods: {
    isCallInProgress (dispositionStatus, currentStatus) {
      return dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW &&
             currentStatus === CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW
    },

    userCanBargeAndWhisper (communication) {
      return (this.hasRole('Company Admin') || this.isAnAgentPermittedToBargeAndWhisperOnCall) &&
      this.agentStatus !== AgentStatus.AGENT_STATUS_ON_CALL &&
      communication.type === CommunicationTypes.CALL &&
      this.isCallInProgress(communication.disposition_status2, communication.current_status2) &&
      this.profile.id !== communication.user_id
    }
  }
}
