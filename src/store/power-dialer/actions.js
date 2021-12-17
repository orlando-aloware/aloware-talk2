import qs from 'qs'
export default {
  /**
   * Actual API Calls for
   * Contact Folders (mimicking Contacts)
   */
  getContactFolders: async ({ commit }) => {
    let res = await window.axios.get('api/v2/contact-folders')
    return res.data
  },

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
  getContact: async ({ commit }, params = {}) => {
    let res = await window.axios.get(`api/v2/contacts/${params.id}`)
    if (res.status === 200) {
      commit('contacts/SET_CONTACT', res.data, { root: true })
    }
  },
  getContacts: async ({ commit }) => {
    let res = await window.axios.get(`api/v2/contacts`)
    return res.data
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
  contactsLoaded2: ({ commit }, payload) => {
    commit('CONTACTS_LOADED', payload)
  },
  getList: async ({ commit }, endpoint = '') => {
    let res = await window.axios.get(endpoint)
    return res.data
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
  setContacts2: ({ commit }, payload) => {
    commit('SET_CONTACTS', payload)
  },
  moveContactItems: async ({ commit }, payload = {}) => {
    return window.axios.patch(`power-dialer-list-items/move/${payload.id}`,
      payload.params
    ).then((res) => {
      return res
    }).catch((err) => {
      return err
    })
  }
}
