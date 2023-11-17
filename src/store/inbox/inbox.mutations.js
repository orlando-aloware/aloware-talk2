import Vue from 'vue'
import _ from 'lodash'
import * as InboxDefault from 'src/constants/inbox-default'

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
  SET_COMMUNICATIONS_CURRENT_PAGE: (state, page) => {
    state.communicationsCurrentPage = page
  },
  GETTING_TASKS_LIST: (state, isGetting) => {
    state.isGettingTasksList = isGetting
  },
  GETTING_CONTACTS_LIST: (state, isGetting) => {
    state.isFetchingContacts = isGetting
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
  SET_INBOX_TASK_COUNT: (state, payload) => {
    state.inboxTaskCounts = { ...state.inboxTaskCounts, ...payload }
  },
  SET_INBOX_OPEN_TASK_COUNT: (state, count) => {
    state.inboxTaskCounts = { ...state.inboxTaskCounts, open: count }
  },
  SET_INBOX_PENDING_TASK_COUNT: (state, count) => {
    state.inboxTaskCounts = { ...state.inboxTaskCounts, pending: count }
  },
  SET_INBOX_NEW_TASK_COUNT: (state, count) => {
    state.inboxTaskCounts = { ...state.inboxTaskCounts, new: count }
  },
  SET_INBOX_CLOSED_TASK_COUNT: (state, count) => {
    state.inboxTaskCounts = { ...state.inboxTaskCounts, closed: count }
  },
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
  SET_CONTACTS_CURRENT_PAGE: (state, page) => {
    state.contactsCurrentPage = page
  },
  SET_SELECTED_CONTACT: (state, contact) => {
    state.selectedContact = contact
  },
  UPDATE_CONTACT: (state, contact) => {
    state.selectedContact = contact
  },
  SET_CHANNEL_CLONED_FILTER: (state, filter) => {
    state.channelClonedFilter = _.cloneDeep(filter)
  },

  UPDATE_CHANNEL_CHANGED_FILTER_FIELDS: (state, { name, value }) => {
    // compensate comparing of array/object values
    const comparatorA = typeof state.channelClonedFilter[name] === 'object' ? JSON.stringify(state.channelClonedFilter[name]) : state.channelClonedFilter[name]
    const comparatorB = typeof value === 'object' ? JSON.stringify(value) : value

    // we only exclude already selected filters if
    // we're not showing populating the currently selected filters
    // in the filter dialog
    if (!state.isFilterDialogShown && comparatorA === comparatorB) {
      state.channelChangedFilterFields = [...state.channelChangedFilterFields].filter(item => item.property !== name)
      return
    }

    const found = { data: null }
    found.data = state.channelChangedFilterFields.find(item => item.property === name)
    found.data = found.data ? state.channelChangedFilterFields.indexOf(found.data) : null

    if (found.data !== -1 && found.data !== null) {
      Vue.set(state.channelChangedFilterFields[found.data], 'value', value)
      return
    }

    state.channelChangedFilterFields.push({ property: name, value: value })
  },
  RESET_CHANNEL_CHANGED_FILTER_FIELDS: (state) => {
    state.channelChangedFilterFields = []
  },
  TOGGLE_FILTER_MODEL_FORM: (state, isShown = false) => {
    state.isFilterModelFormShown = isShown
  },
  TOGGLE_FILTER_DIALOG: (state, isShown = false) => {
    state.isFilterDialogShown = isShown
  },
  TOGGLE_FILTER_DIALOG_WITH_FILTERS: (state, value = false) => {
    state.isFilterDialogShowFilters = value
  },
  SET_FILTER_DIALOG_FOR_VIEW: (state, value = false) => {
    state.isFilterDialogForView = value
  },
  SET_SELECTED_FILTER: (state, filter) => {
    state.selectedFilter = filter
  },
  SET_APPLIED_FILTER: (state, filter) => {
    state.appliedFilter = filter
  },
  SET_HAS_MORE_CONTACTS: (state, hasMore) => {
    state.hasMoreContacts = hasMore
  },
  SET_HAS_MORE_COMMUNICATIONS: (state, hasMore) => {
    state.hasMoreCommunications = hasMore
  },
  SET_CONTACTS: (state, contacts) => {
    state.contacts = contacts
  },
  SET_SEARCHER_OPEN: (state, isOpen) => {
    state.isSearcherOpen = isOpen
  },

  RESET_VUEX (state, value) {
    if (!_.isArray(value) || _.isEmpty(value)) {
      return
    }

    state.activeChannel = null
    state.selectedContactId = null
    state.selectedCommunication = null

    if (!value.includes('all')) {
      return
    }

    // exclude cached state for non-cache
    const inboxDefaultState = Object.assign({}, InboxDefault.DEFAULT_STATE)

    if (value.includes('non-cache')) {
      delete inboxDefaultState.inboxShowMyContacts
    }

    state = Object.assign(state, inboxDefaultState)
  },
  SET_LOADING_OPEN_TASK_COUNT (state, loading) {
    state.isLoadingOpenTaskCount = loading
  },
  SET_LOADING_PENDING_TASK_COUNT (state, loading) {
    state.isLoadingPendingTaskCount = loading
  },
  SET_INBOX_SHOW_MY_CONTACTS (state, value) {
    state.inboxShowMyContacts = value
  },
  SET_DEFAULT_SHOW_MY_CONTACTS (state, value) {
    state.showMyContacts = InboxDefault.DEFAULT_STATE.showMyContacts
  },
  SET_IS_INBOX_FILTERS_LOADED (state, value) {
    state.isInboxFiltersLoaded = value
  },
  SET_PINNED_VIEWS (state, value) {
    state.pinnedViews = value
  },
  SET_INBOX_PERSONAL_FILTERS (state, value) {
    state.inboxPersonalFilters = value
  },
  SET_INBOX_COMPANY_FILTERS (state, value) {
    state.inboxCompanyFilters = value
  },
  SET_IS_EDITING_VIEW (state, value) {
    state.isEditingView = value
  },
  SET_SHOW_VIEWS_LIST (state, value) {
    state.showViewsList = value
  },
  SET_IS_INBOX_REFRESH_BTN_LOADING (state, value) {
    state.isInboxRefreshBtnLoading = value
  }
}
