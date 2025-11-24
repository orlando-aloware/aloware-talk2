import Vue from 'vue'

export default {
  // Contact selection
  SET_SELECTED_CONTACT: (state, contact) => {
    state.selectedContact = contact
  },

  // Live contacts management
  SET_LIVE_CONTACTS: (state, contacts) => {
    state.liveContacts = contacts
  },
  UPDATE_LIVE_CONTACT_LAST_COMM_PROPERTIES: (state, payload) => {
    const liveContact = { data: null, index: null }
    liveContact.data = state.liveContacts.find(contact => contact.id === payload.id)

    if (!liveContact.data) {
      return
    }

    liveContact.index = state.liveContacts.indexOf(liveContact.data)

    if (liveContact.index === -1) {
      return
    }

    Object.keys(payload).forEach(key => {
      if (key !== 'id') {
        Vue.set(state.liveContacts[liveContact.index].last_communication, key, payload[key])
      }
    })
  },
  REMOVE_LIVE_CONTACT: (state, contactId) => {
    const liveContact = { data: null, index: null }
    liveContact.data = state.liveContacts.find(contact => contact.id === contactId)

    if (!liveContact.data) {
      return
    }

    liveContact.index = state.liveContacts.indexOf(liveContact.data)

    if (liveContact.index === -1) {
      return
    }

    state.liveContacts.splice(liveContact.index, 1)
  },

  // Task counts
  SET_OPEN_TASK_COUNT: (state, count) => {
    state.taskCounts = { ...state.taskCounts, open: count }
  },
  SET_PENDING_TASK_COUNT: (state, count) => {
    state.taskCounts = { ...state.taskCounts, pending: count }
  },
  SET_INBOX_OPEN_TASK_COUNT: (state, count) => {
    state.inboxTaskCounts = { ...state.inboxTaskCounts, open: count }
  },
  SET_INBOX_PENDING_TASK_COUNT: (state, count) => {
    state.inboxTaskCounts = { ...state.inboxTaskCounts, pending: count }
  },

  // Loading states
  SET_LOADING_OPEN_TASK_COUNT (state, loading) {
    state.isLoadingOpenTaskCount = loading
  },
  SET_LOADING_PENDING_TASK_COUNT (state, loading) {
    state.isLoadingPendingTaskCount = loading
  },

  // Filter preferences
  SET_DEFAULT_SHOW_MY_CONTACTS (state, value) {
    state.inboxShowMyContacts = value
  }
}
