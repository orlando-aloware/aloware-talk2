import { POWER_DIALER_LIST } from 'src/constants/power-dialer/power-dialer'

export default {
  SET_POWER_DIALER_LIST: (state, data) => {
    let list = POWER_DIALER_LIST
    state.lists = list.concat(data)
  },
  SET_CONTACT_RESOURCES: (state, data) => {
    state.contactResources = data
  },
  RESET_LIST: (state) => {
    // state.opened = []
    state.lists = []
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
  MOVE_DIALOG_TARGET: (state, { target }) => {
    state.moveDialog = {
      ...state.moveDialog,
      target: target === state.moveDialog.target ? null : target
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
  MOVE_DIALOG_CLOSE: (state) => {
    state.moveDialog = { open: false }
  }
}
