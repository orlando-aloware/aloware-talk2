export default {
  toggleFolder: ({ commit }, id) => {
    commit('TOGGLE_FOLDER', id)
  },
  openFolder: ({ commit }, id) => {
    commit('OPEN_FOLDER', id)
  },
  closeFolder: ({ commit }, id) => {
    commit('CLOSE_FOLDER', id)
  },
  removeListOpen: ({ commit }, list) => {
    commit('REMOVE_LIST_OPEN', list)
  },
  removeFolderOpen: ({ commit }, folder) => {
    commit('REMOVE_FOLDER_OPEN', folder)
  },
  removeContactOpen: ({ commit }, contact) => {
    commit('REMOVE_CONTACT_OPEN', contact)
  },
  removeListClose: ({ commit }) => {
    commit('REMOVE_LIST_CLOSE')
  },
  removeFolderClose: ({ commit }) => {
    commit('REMOVE_FOLDER_CLOSE')
  },
  removeContactClose: ({ commit }) => {
    commit('REMOVE_CONTACT_CLOSE')
  },
  openFilters: ({ commit }) => {
    commit('FILTERS_OPEN')
  },
  closeFilters: ({ commit }) => {
    commit('FILTERS_CLOSE')
  },
  contactsLoaded: ({ commit }, payload) => {
    commit('CONTACTS_LOADED', payload)
  },
  pinnedCountLoaded: ({ commit }, payload) => {
    commit('PINNED_COUNT_LOADED', payload)
  },
  foldersLoaded: ({ commit }, payload) => {
    commit('FOLDERS_LOADED', payload)
  },
  pinnedLoaded: ({ commit }, payload) => {
    commit('PINNED_LOADED', payload)
  },
  listLoaded: ({ commit }, payload) => {
    commit('LIST_LOADED', payload)
  },
  columnsOpen: ({ commit }, payload) => {
    commit('COLUMNS_OPEN', payload)
  },
  columnsClose: ({ commit }) => {
    commit('COLUMNS_CLOSE')
  },
  columnsReordered: ({ commit }, payload) => {
    commit('COLUMNS_REORDERED', payload)
  },
  columnsUpdated: ({ commit }, payload) => {
    commit('COLUMNS_UPDATED', payload)
  },
  listPinToggled: ({ commit }, { id, isPinned }) => {
    commit(isPinned ? 'LIST_PINNED' : 'LIST_UNPINNED', id)
  },
  openMoveDialog: ({ commit }, payload) => {
    commit('MOVE_DIALOG_OPEN', payload)
  },
  closeMoveDialog: ({ commit }) => {
    commit('MOVE_DIALOG_CLOSE')
  },
  setMoveDialogTarget: ({ commit }, payload) => {
    commit('MOVE_DIALOG_TARGET', payload)
  },
  createListOpen: ({ commit }, payload) => {
    commit('CREATE_LIST_OPEN', payload)
  },
  createListClose: ({ commit }) => {
    commit('CREATE_LIST_CLOSE')
  }
}
