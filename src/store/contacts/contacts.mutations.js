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
  REMOVE_FOLDER_CLOSE: (state) => {
    state.removeFolder = null
  },
  REMOVE_LIST_CLOSE: (state) => {
    state.removeList = null
  },
  FILTERS_CLOSE: (state) => {
    state.isFiltersOpen = false
  },
  FILTERS_OPEN: (state) => {
    state.isFiltersOpen = true
  },
  CONTACTS_LOADED: (state, { id, append, data, ...rest }) => {
    if (append) {
      state.lists.contacts = {
        ...state.lists.contacts,
        [id]: {
          ...state.lists.contacts[id],
          ...rest,
          data: state.lists.contacts[id].data.concat(data)
        }
      }
    } else {
      state.lists.contacts = { ...state.lists.contacts, [id]: { data, ...rest } }
    }
  },
  PINNED_COUNT_LOADED: (state, payload) => {
    let index = state.pinnedCounts.findIndex(count => count.id === payload.id)

    if (index === -1) {
      state.pinnedCounts.push(payload)
    }
  },
  FOLDERS_LOADED: (state, folders) => {
    state.folders = folders
  },
  PINNED_CONTACT_LISTS_LOADED: (state, pinnedContactLists) => {
    state.pinned = pinnedContactLists
  }
}
