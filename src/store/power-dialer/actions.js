import qs from 'qs'
export default {
  /**
   * Actual API Calls for
   * POWER-DIALER
   */
  getMyQueueList: async ({ commit }) => {
    let res = await window.axios.get(`api/v2/power-dialer-lists/my-queue`)
    if (res.status === 200) {
      commit('SET_MY_QUEUE_LIST', res.data)
    }
  },
  getPowerDialerListItem: async ({ commit }, id = '') => {
    let res = await window.axios.get(`api/v2/contacts-list/${id}`)
    if (res.status === 200) {
      commit('SET_CURRENT_LIST', res.data)
    }
  },
  getPowerDialerLists: async ({ commit }, params = {}) => {
    let res = await window.axios.get('api/v2/power-dialer-folders', {
      params: params,
      paramsSerializer: qs.stringify
    })
    if (res.status === 200) {
      commit('SET_POWER_DIALER_LIST', res.data)
    }
  },
  getContact: async ({ commit }, params = {}) => {
    let res = await window.axios.get(`api/v2/contacts/${params.id}`)
    if (res.status === 200) {
      commit('contacts/SET_CONTACT', res.data, { root: true })
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
   * Disposition API calls
   */
  async updateCallDisposition ({ commit }, params = {}) {
    let res = await window.axios.post(`api/v1/communication/${params.id}/dispose-call`, {
      'call_disposition_id': params.params.call_disposition_id,
      paramsSerializer: qs.stringify
    })
    if (res.status === 200) {
      return res.data
    }
  },
  async updateContactDisposition ({ commit }, params = {}) {
    let res = await window.axios.post(`api/v1/contact/${params.id}/dispose`, {
      'disposition_status': params.params.disposition_status,
      paramsSerializer: qs.stringify
    })
    if (res.status === 200) {
      return res.data
    }
  },

  /**
   * General Actions
   */
  setSearch: ({ commit }, value) => {
    commit('SET_SEARCH', value)
  },
  selectedContactChanging: ({ commit }, isChanging) => {
    commit('CHANGING_SELECTED_CONTACT', isChanging)
  },
  // setContact: ({ commit }, contact) => {
  //   commit('SET_CONTACT', contact)
  // },
  setContacts2: ({ commit }, payload) => {
    commit('SET_CONTACTS', payload)
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
