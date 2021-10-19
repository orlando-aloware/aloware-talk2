import qs from 'qs'
export default {
  /**
   * Actual API Calls for
   * POWER-DIALER
   */
  getPowerDialerListItem: async ({ commit }, id = '') => {
    console.log(`api/v2/contacts-list/${id}`, id)
    let res = await window.axios.get(`api/v2/contacts-list/${id}`)
    if (res.status === 200) {
      commit('SET_CURRENT_LIST', res.data)
    }
  },
  getPowerDialerLists: async ({ commit }, params = {}) => {
    let res = await window.axios.get('api/v2/contact-folders', {
      params: params,
      paramsSerializer: qs.stringify
    })
    if (res.status === 200) {
      commit('SET_POWER_DIALER_LIST', res.data)
    }
  },
  getContactResources: async ({ commit }, params = {}) => {
    let res = await window.axios.get('api/v2/contacts', {
      params: params,
      paramsSerializer: qs.stringify
    })
    if (res.status === 200) {
      commit('SET_CONTACT_RESOURCES', res.data.data)
    }
  },
  contactsLoaded: ({ commit }, payload) => {
    commit('CONTACTS_LOADED', payload)
  },

  /**
   * General Actions
   */
  setSearch: ({ commit }, value) => {
    commit('SET_SEARCH', value)
  },

  /**
   * DIRECTORIES
   */
  columnsReordered: ({ commit }, payload) => {
    commit('COLUMNS_REORDERED', payload)
  },
  toggleFolder: ({ commit }, id) => {
    commit('TOGGLE_FOLDER', id)
  },
  foldersLoaded: ({ commit }, payload) => {
    commit('FOLDERS_LOADED', payload)
  },
  openFolder: ({ commit }, id) => {
    commit('OPEN_FOLDER', id)
  },
  closeFolder: ({ commit }, id) => {
    commit('CLOSE_FOLDER', id)
  },
  removeFolderOpen: ({ commit }, folder) => {
    commit('REMOVE_FOLDER_OPEN', folder)
  },
  removeFolderClose: ({ commit }) => {
    commit('REMOVE_FOLDER_CLOSE')
  },
  openMoveDialog: ({ commit }, payload) => {
    commit('MOVE_DIALOG_OPEN', payload)
  },
  closeMoveDialog: ({ commit }) => {
    commit('MOVE_DIALOG_CLOSE')
  },
  createListOpen: ({ commit }, payload) => {
    commit('CREATE_LIST_OPEN', payload)
  },
  removeListOpen: ({ commit }, list) => {
    commit('REMOVE_LIST_OPEN', list)
  },
  openCreateListDialog: ({ commit }, payload) => {
    console.log('payload :>> ', payload)
    commit('CREATE_DIALOG_OPEN', payload)
  },
  closeCreateListDialog: ({ commit }) => {
    commit('CREATE_DIALOG_CLOSE')
  },
  listLoaded: ({ commit }, payload) => {
    commit('LIST_LOADED', payload)
  },
  removeListClose: ({ commit }) => {
    commit('REMOVE_LIST_CLOSE')
  },
  setRemoveListActionType: ({ commit }, payload) => {
    commit('SET_REMOVE_LIST_ACTION_TYPE', payload)
  },
  setMoveDialogTarget: ({ commit }, payload) => {
    commit('MOVE_DIALOG_TARGET', payload)
  },
  setCreateDialogTarget: ({ commit }, payload) => {
    commit('CREATE_DIALOG_TARGET', payload)
  }
}
