import Vue from 'vue'
import _ from 'lodash'

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
  SET_CONTACT: (state, payload) => {
    const contact = state.contacts.find(contact => contact.id === payload.contact_id)
    const lastCommunication = _.get(contact, 'last_communication', null)

    if (!lastCommunication || (lastCommunication && lastCommunication.id !== payload.id)) {
      return
    }

    const index = contact ? state.contacts.indexOf(contact) : null
    if (index !== -1 && index !== null) {
      state.contacts[index].last_communication = payload
      Vue.set(state.contacts[index], 'last_communication', payload)
    }
  },
  SET_CONTACTS: (state, contacts) => {
    state.contacts = contacts
  },
  SET_SELECTED_CONTACT: (state, contact) => {
    state.selectedContact = contact
  },
  UPDATE_CONTACT: (state, contact) => {
    state.selectedContact = contact
  },
  SET_CHANNEL_CLONED_FILTER: (state, filter) => {
    state.channelClonedFilter = { ...filter }
  },
  UPDATE_CHANNEL_CHANGED_FILTER_FIELDS: (state, { name, value }) => {
    // compensate comparing of array/object values
    let comparatorA = typeof state.channelClonedFilter[name] === 'object' ? JSON.stringify(state.channelClonedFilter[name]) : state.channelClonedFilter[name]
    let comparatorB = typeof value === 'object' ? JSON.stringify(value) : value

    if (comparatorA !== comparatorB) {
      let prop = state.channelChangedFilterFields.find(item => item.property === name)
      if (prop) {
        prop.value = value
      } else {
        state.channelChangedFilterFields.push({ property: name, value: value })
      }
    } else {
      let changedProp = [...state.channelChangedFilterFields]
      state.channelChangedFilterFields = changedProp.filter(item => item.property !== name)
    }
  },
  RESET_CHANNEL_CHANGED_FILTER_FIELDS: (state) => {
    state.channelChangedFilterFields = []
  },
  TOGGLE_FILTER_MODEL_FORM: (state, isShown = false) => {
    state.isFilterModelFormShown = isShown
  },
  SET_SELECTED_FILTER: (state, selectedFilter) => {
    state.selectedFilter = selectedFilter
  }
}
