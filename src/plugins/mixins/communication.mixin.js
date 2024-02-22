import * as AgentStatus from 'src/constants/agent-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationTypes from 'src/constants/communication-types'

export default {
  methods: {
    isCallInProgress (dispositionStatus, currentStatus) {
      return dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW &&
        currentStatus === CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW
    },

    userCanBargeAndWhisper (communication) {
      return (this.hasRole('Company Admin') || this.hasPermissionTo('barge and whisper on call')) &&
        ![AgentStatus.AGENT_STATUS_ON_CALL, AgentStatus.AGENT_STATUS_SENTRY].includes(this.agentStatus) &&
        communication.type === CommunicationTypes.CALL &&
        this.isCallInProgress(communication.disposition_status2, communication.current_status2) &&
        this.profile.id !== communication.user_id
    },

    canUnparkCommunication (communication) {
      return communication.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW &&
        this.agentStatus !== AgentStatus.AGENT_STATUS_ON_CALL &&
        communication.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW
    }
  }
}
