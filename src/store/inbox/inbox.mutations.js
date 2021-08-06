export default {
  SET_CONTACT_ID: (state, id) => {
    state.selectedContactId = id
  },
  SET_SELECTED_COMMUNICATION: (state, communication) => {
    state.selectedCommunication = communication
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
  }
}
