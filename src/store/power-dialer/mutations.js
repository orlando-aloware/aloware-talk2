export default {
  SET_POWER_DIALER_LIST: (state, data) => {
    state.lists = data
  },
  SET_CONTACT_RESOURCES: (state, data) => {
    state.contactResources = data
  },
  SET_LIST_SELECTED_CONTACTS: (state, data) => {
    console.log('data :>> ', data)
    // state.selectedContacts = {
    //   ...state.selectedContacts,
    //   [data.id]: data.contacts
    // }
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
    state.folders = folders
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
  MOVE_DIALOG_OPEN: (state, { id, type }) => {
    state.moveDialog = { open: true, id, type }
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
  }
}
