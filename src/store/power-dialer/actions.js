export default {
  /**
   * Actual API Calls for
   * POWER-DIALER
   */
  getPowerDialerList: async ({ commit }) => {
    console.log('Fetching power dialer lists...')
    let res = await window.axios.get('/api/v1/auto-dialer?status=1&page=1&per_page=10&order=1')
    console.log('res :>> ', res)
  },
  getContactResources: async ({ commit }, params = {}) => {
    let res = await window.axios.get('...URL_here...')
    if (res.status === 200) {
      commit('SET_CONTACT_RESOURCES', res.data)
    }
  },

  /**
   * DIRECTORIES
   */
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
  createListOpen: ({ commit }, payload) => {
    commit('CREATE_LIST_OPEN', payload)
  },
  removeListOpen: ({ commit }, list) => {
    commit('REMOVE_LIST_OPEN', list)
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
  closeMoveDialog: ({ commit }) => {
    commit('MOVE_DIALOG_CLOSE')
  }
}
