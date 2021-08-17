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
  SET_TASK_COUNT: (state, payload) => {
    state.taskCounts = { ...state.taskCounts, ...payload }
  },
  SET_OPEN_TASK_COUNT: (state, count) => {
    state.taskCounts = { ...state.taskCounts, open: count }
  },
  SET_PENDING_TASK_COUNT: (state, count) => {
    state.taskCounts = { ...state.taskCounts, pending: count }
  },
  SET_NEW_TASK_COUNT: (state, count) => {
    state.taskCounts = { ...state.taskCounts, new: count }
  },
  SET_CLOSED_TASK_COUNT: (state, count) => {
    state.taskCounts = { ...state.taskCounts, closed: count }
  },
  SET_CONTACTS: (state, contacts) => {
    state.contacts = contacts
  },
  SET_SELECTED_CONTACT: (state, contact) => {
    state.selectedContact = contact
  },
  UPDATE_CONTACT: (state, contact) => {
    state.selectedContact = contact
  }
}
