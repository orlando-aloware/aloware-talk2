export default {
  SET_MY_QUEUE_LIST: (state, data) => {
    state.my_queue = data
  },
  SET_CONTACT_RESOURCES: (state, data) => {
    state.contacts = data
  },
  RESET_LIST: (state) => {
    // state.opened = []
    state.lists = []
  },
  SET_LIST_SELECTED_CONTACTS: (state, data) => {
    state.selectedContacts = {
      ...state.selectedContacts,
      [data.id]: data.contacts
    }
  },
  /**
   * GENERAL MUTATIONS
   */
  SET_SEARCH: (state, value) => {
    state.search = value
  },
  RESET_SEARCH: (state) => {
    state.search = ''
  },

  /**
   * MOVE &
   * CREATE MODAL for LISTS
   */
  START_DIAL_TOGGLE: (state, value) => {
    state.isStartingDial = value
  },
  TOGGLE_TABLE_LOADER: (state, value) => {
    state.datatableLoader = value
  },

  /**
   * DATATABLE ACTIONS
   */
  COLUMNS_REORDERED: (state, { id, headers }) => {
    state.lists = {
      ...state.lists,
      [String(id)]: {
        ...(state.lists[String(id)] || {}),
        headers
      }
    }
  },

  /**
   * SESSIONS
   */
  TOGGLE_SESSION_LOADER: (state, value) => {
    state.sessionLoader = value
  },
  TOGGLE_SESSION_SIDEBAR: (state) => {
    state.sessionSidebarExpanded = !state.sessionSidebarExpanded
  },
  CHANGING_SELECTED_CONTACT: (state, isChanging) => {
    state.changingSelectedContact = isChanging
  },
  SET_CONTACTS: (state, payload) => {
    state.listItems[state.selectedList.id].data = payload
  },
  SET_ACTIVE_FILTER: (state, filter) => {
    state.activeFilter = filter
  }
}
