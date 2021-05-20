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
        [id]: {
          ...state.listItems[id],
          ...rest,
          data: state.listItems[id].data.concat(data)
        }
      }
    } else {
      state.listItems = { ...state.listItems, [id]: { data, ...rest } }
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
      [list.id]: { ...list }
    }
  },
  PINNED_LOADED: (state, pinned) => {
    state.pinned = pinned
  },
  COLUMN_HEADERS_OPEN: (state, payload) => {
    state.columsUpdating = payload
  },
  COLUMN_HEADERS_CLOSE: (state) => {
    state.columsUpdating = null
  }
}
