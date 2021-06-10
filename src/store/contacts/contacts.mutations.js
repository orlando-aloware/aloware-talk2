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
  SET_CONTACT_REMOVE_ACTION_TYPE: (state, type) => {
    state.removeContactActionType = type
  },
  SET_BULK_DELETE: (state, payload) => {
    state.isBulkDelete = payload
  },
  SET_LIST_SELECTED_CONTACTS: (state, payload) => {
    state.selectedContacts = {
      ...state.selectedContacts,
      [payload.id]: payload.contacts
    }
  },
  SET_SELECTED_LIST: (state, payload) => {
    state.selectedList = { ...state.selectedList, ...payload }
  },

  SET_SELECTED_STATIC_LIST: (state, payload) => {
    state.selectedStaticList = { ...state.selectedStaticList, ...payload }
  },
  CREATE_LIST_OPEN: (state, payload) => {
    state.createList = { ...state.createList, ...payload, open: true }
  },
  CREATE_LIST_CLOSE: (state) => {
    state.createList = { folderId: null, open: false, mode: '', type: 1, contact_folder_id: null, name: '', filters: [] }
  },

  SELECT_LIST_OPEN: (state, payload) => {
    state.selectList = { ...state.selectList, ...payload, open: true }
  },
  SELECT_LIST_CLOSE: (state) => {
    state.selectList = { contact_list_id: null, open: false, search_value: '' }
  },

  SET_SELECT_LIST_SEARCH_VALUE: (state, value) => {
    state.selectList = { ...state.selectList, search_value: value }
  },

  SET_FILTERS: (state, filters) => {
    state.filters = filters
  },
  SET_CURRENT_LIST_FILTERS: (state, filters) => {
    state.currentListFilters = filters
  }
}
