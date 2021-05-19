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
  pinnedContactlistsLoaded: ({ commit }, payload) => {
    commit('PINNED_CONTACT_LISTS_LOADED', payload)
  },
  columnHeadersOpen: ({ commit }, payload) => {
    commit('COLUMN_HEADERS_OPEN', payload)
  },
  columnHeadersClose: ({ commit }) => {
    commit('COLUMN_HEADERS_CLOSE')
  }
}
