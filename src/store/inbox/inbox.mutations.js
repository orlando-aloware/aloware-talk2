export default {
  SET_CONTACT_ID: (state, id) => {
    state.selectedContactId = id
  },
  SET_SELECTED_COMMUNICATION: (state, communication) => {
    state.selectedCommunication = communication
  },
  SET_COMMUNICATIONS: (state, communications) => {
    state.communications = communications
  },
  RESET_INBOX_VUEX: (state) => {
    state.activeChannel = null
    state.selectedContactId = null
    state.selectedCommunication = null
  },
  GETTING_TASKS_LIST: (state, isGetting) => {
    state.isGettingTasksList = isGetting
  },
  SET_ACTIVE_CHANNEL: (state, channel) => {
    state.activeChannel = channel
  },
  SET_OPEN_TASK_COUNT: (state, count) => {
    state.openTaskCount = count
  },
  SET_PENDING_TASK_COUNT: (state, count) => {
    state.pendingTaskCount = count
  }
}
