export default {
  SET_POWER_DIALER_LIST: (state, data) => {
    state.lists = data
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
  CONTACTS_LOADED: (state, { id, append, data, ...rest }) => {
    if (append) {
      let newData = data
      for (let item of state.powerDialerListItems[String(id)].data) {
        let found = newData.find(contact => contact.id === item.id)
        let index = found ? newData.indexOf(found) : null
        if (index !== -1 && index !== null) {
          newData.splice(index, 1)
        }
      }
      state.powerDialerListItems = {
        ...state.powerDialerListItems,
        [String(id)]: {
          ...state.powerDialerListItems[String(id)],
          ...rest,
          data: state.powerDialerListItems[String(id)].data.concat(newData)
        }
      }
    } else {
      state.powerDialerListItems = { ...state.powerDialerListItems, [String(id)]: { data, ...rest } }
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
   * POWER DIALER LISTS
   */
  SET_CURRENT_LIST: (state, data) => {
    state.currentList = data
  },

  /**
   * DIRECTORIES
   */
  TOGGLE_FOLDER: (state, id) => {
    const opened = new Set(state.opened)
    if (opened.has(id)) {
      opened.delete(id)
    } else {
      opened.add(id)
    }
    state.opened = Array.from(opened)
  },
  FOLDERS_LOADED: (state, folders) => {
    /**
     * TODOs
     * Temporary implementation
     */
    state.folders = state.lists
  },
  OPEN_FOLDER: (state, id) => {
    const opened = new Set(state.opened).add(id)
    state.opened = Array.from(opened)
  },
  CLOSE_FOLDER: (state, id) => {
    const opened = new Set(state.opened).delete(id)
    state.opened = Array.from(opened)
  },
  REMOVE_FOLDER_OPEN: (state, folder) => {
    state.removeFolder = folder
  },
  REMOVE_FOLDER_CLOSE: (state) => {
    state.removeFolder = null
  },

  /**
   * MOVE &
   * CREATE MODAL for LISTS
   */
  MOVE_DIALOG_OPEN: (state, { id, type }) => {
    state.moveDialog = { open: true, id, type }
  },
  MOVE_DIALOG_CLOSE: (state) => {
    state.moveDialog = { open: false }
  },
  CREATE_DIALOG_OPEN: (state, { id, type }) => {
    state.createDialog = { open: true, id, type }
  },
  CREATE_DIALOG_CLOSE: (state) => {
    state.createDialog = { open: false }
  },
  MOVE_DIALOG_TARGET: (state, { target }) => {
    state.moveDialog = {
      ...state.moveDialog,
      target: target === state.moveDialog.target ? null : target
    }
  },
  CREATE_DIALOG_TARGET: (state, { target }) => {
    state.createDialog = {
      ...state.createDialog,
      target: target === state.createDialog.target ? null : target
    }
  },
  CREATE_LIST_OPEN: (state, payload) => {
    state.createList = { ...state.createList, ...payload, open: true }
  },
  REMOVE_LIST_OPEN: (state, list) => {
    state.removeList = list
  },
  LIST_LOADED: (state, list) => {
    state.lists = {
      ...state.lists,
      [String(list.id)]: {
        ...(state.lists[String[list.id]] || {}),
        ...list
      }
    }
  },
  START_DIAL_TOGGLE: (state, value) => {
    state.isStartingDial = value
  },
  REMOVE_LIST_CLOSE: (state) => {
    state.removeList = null
  },
  ON_SEARCH_LIST_ITEM: (state, value) => {
    state.searchedListItem = value
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
  NEXT_CONTACT_IN_PROGRESS: (state, data) => {
    state.contact = data
  },
  TOGGLE_SESSION_LOADER: (state, value) => {
    state.sessionLoader = value
  },
  CHANGING_SELECTED_CONTACT: (state, isChanging) => {
    state.changingSelectedContact = isChanging
  },
  SET_CONTACT: (state, contact) => {
    state.contact = contact
  },
  SET_CONTACTS: (state, payload) => {
    state.listItems[state.selectedList.id].data = payload
  }
}
