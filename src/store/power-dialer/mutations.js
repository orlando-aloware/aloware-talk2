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
      for (let item of state.powerDialerLists[String(id)].data) {
        let found = newData.find(contact => contact.id === item.id)
        let index = found ? newData.indexOf(found) : null
        if (index !== -1 && index !== null) {
          newData.splice(index, 1)
        }
      }
      state.powerDialerLists = {
        ...state.powerDialerLists,
        [String(id)]: {
          ...state.powerDialerLists[String(id)],
          ...rest,
          data: state.powerDialerLists[String(id)].data.concat(newData)
        }
      }
    } else {
      state.powerDialerLists = { ...state.powerDialerLists, [String(id)]: { data, ...rest } }
    }
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
    console.log('target :>> ', target)
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
  }
}
