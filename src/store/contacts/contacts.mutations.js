export default {
  TOGGLE_FOLDER: (state, id) => {
    const opened = new Set(state.opened)
    if (opened.has(id)) {
      opened.delete(id)
    } else {
      opened.add(id)
    }
    state.opened = Array.from(opened)
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
  REMOVE_LIST_OPEN: (state, list) => {
    state.removeList = list
  },
  REMOVE_CONTACT_OPEN: (state, contact) => {
    state.removeContact = contact
  },
  REMOVE_FOLDER_CLOSE: (state) => {
    state.removeFolder = null
  },
  REMOVE_LIST_CLOSE: (state) => {
    state.removeList = null
  },
  REMOVE_CONTACT_CLOSE: (state) => {
    state.removeContact = null
  },
  FILTERS_CLOSE: (state) => {
    state.isFiltersOpen = false
  },
  FILTERS_OPEN: (state) => {
    state.isFiltersOpen = true
  },
  CONTACTS_LOADED: (state, { id, append, data, ...rest }) => {
    if (append) {
      state.listItems = {
        ...state.listItems,
        [String(id)]: {
          ...state.listItems[String(id)],
          ...rest,
          data: state.listItems[String(id)].data.concat(data)
        }
      }
    } else {
      state.listItems = { ...state.listItems, [String(id)]: { data, ...rest } }
    }
  },
  PINNED_COUNT_LOADED: (state, payload) => {
    state.pinnedCounts[payload.id] = payload.count
  },
  FOLDERS_LOADED: (state, folders) => {
    state.folders = folders
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
  PINNED_LOADED: (state, pinned) => {
    state.pinned = pinned
  },
  COLUMNS_OPEN: (state, payload) => {
    state.columns = payload
  },
  COLUMNS_CLOSE: (state) => {
    state.columns = null
  },
  COLUMNS_REORDERED: (state, { id, headers }) => {
    state.lists = {
      ...state.lists,
      [String(id)]: {
        ...(state.lists[String(id)] || {}),
        headers
      }
    }
  },
  COLUMNS_UPDATED: (state, { id, ...rest }) => {
    state.lists = {
      ...state.lists,
      [String(id)]: {
        ...(state.lists[String(id)] || {}),
        ...rest
      }
    }
  },
  LIST_UNPINNED: (state, id) => {
    state.pinned = state.pinned.filter((v) => v !== id)
  },
  LIST_PINNED: (state, id) => {
    state.pinned = [...new Set(state.pinned.concat(id))]
  },
  MOVE_DIALOG_OPEN: (state, { id, type }) => {
    state.moveDialog = { open: true, id, type }
  },
  MOVE_DIALOG_CLOSE: (state) => {
    state.moveDialog = { open: false }
  },
  MOVE_DIALOG_TARGET: (state, { target }) => {
    state.moveDialog = {
      ...state.moveDialog,
      target: target === state.moveDialog.target ? null : target
    }
  },
  CREATE_LIST_OPEN: (state, payload) => {
    state.createList = { ...state.createList, ...payload }
  },
  CREATE_LIST_CLOSE: (state) => {
    state.createList = { folderId: null, open: false }
  }
}
