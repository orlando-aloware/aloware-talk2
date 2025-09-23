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
      const hasPermission = this.hasRole('Company Admin') || this.hasPermissionTo('barge and whisper on call')
      const isCall = communication.type === CommunicationTypes.CALL
      const isCallInProgress = this.isCallInProgress(communication.disposition_status2, communication.current_status2)
      const isAgentOnCall = [AgentStatus.AGENT_STATUS_ON_CALL, AgentStatus.AGENT_STATUS_SENTRY].includes(this.agentStatus)
      const isAgentNotTheCaller = this.profile.id !== communication.user_id

      return isCall && // is a call
        hasPermission && // has permission to barge and whisper on call
        isCallInProgress && // is call in progress
        isAgentNotTheCaller && // communication user is not the current user
        !isAgentOnCall // user is not on a call
    },

    canUnparkCommunication (communication) {
      return communication.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW &&
        this.agentStatus !== AgentStatus.AGENT_STATUS_ON_CALL &&
        communication.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW
    }
  }
}
