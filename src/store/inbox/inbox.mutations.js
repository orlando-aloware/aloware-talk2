export default {
  SET_CONTACT_ID: (state, id) => {
    state.selectedContactId = id
  },
  RESET_INBOX_VUEX: (state) => {
    state.selectedContactId = null
  },
  GETTING_TASKS_LIST: (state, isGetting) => {
    state.isGettingTasksList = isGetting
  }
}
