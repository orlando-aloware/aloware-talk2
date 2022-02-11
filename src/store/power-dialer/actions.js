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
    return res
  },
  updateMyQueueListData: ({ commit }, data = []) => {
    commit('SET_MY_QUEUE_LIST_DATA', data)
  },
  getContact: async ({ commit }, params = {}) => {
    let res = await window.axios.get(`api/v2/contacts/${params.id}`)
    if (res.status === 200) {
      commit('contacts/SET_CONTACT', res.data, { root: true })
      // commit('SET_ACTIVE_TASK', res.data)
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
  contactsLoaded: ({ commit }, payload) => {
    commit('CONTACTS_LOADED', payload)
  },
  getList: async ({ commit }, endpoint = '') => {
    let res = await window.axios.get(endpoint)
    return res.data
  },
  async updateContactsList ({ commit }, params = {}) {
    let res = await window.axios.patch(`api/v2/power-dialer-lists/${params.id}`, params)
    return res
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
    return window.axios.patch(`api/v2/power-dialer-list-items/move/${payload.id}`,
      payload.params
    ).then((res) => {
      return res
    }).catch((err) => {
      return err
    })
  },
  async getWarmupDurations ({ commit }) {
    return window.axios.get(
      `/api/v2/dialer-sessions/warmup-durations`
    ).then(res => {
      return res.data
    }).catch(err => {
      return err
    })
  },
  async getSessionMetricsOptions ({ commit }) {
    return window.axios.get(`/api/v2/dialer-sessions/metrics/options`)
      .then((res) => {
        return res.data
      }).catch((err) => {
        return err
      })
  },
  async createSessionSettings ({ commit }, params = {}) {
    return window.$axios.post(`api/v2/power-dialer-sessions`,
      params
    ).then((res) => {
      commit('SET_WARMUP_DURATIONS', res.data)
    }).catch((err) => {
      return err
    })
  },
  async createDialerSessionSetting ({ commit }, params = {}) {
    return window.axios.post(
      `/api/v2/dialer-sessions`,
      params
    ).then(res => {
      return res.data
    }).catch(err => {
      return err
    })
  },
  async getSessionSetting ({ commit }, id = '') {
    return window.axios.get(
      `/api/v2/dialer-sessions/${id}`
    ).then(res => {
      return res.data
      // commit('SET_SESSION_SETTINGS', res.data)
    }).catch(err => {
      return err
    })
  },
  getTemporarySessionSetting ({ commit }, id = null) {
    return window.axios.get(
      `api/v2/power-dialer-lists/${id}/temporary-session-settings`
    ).then((res) => {
      console.log('res :>> 11', res)
      return res.data
      // commit('SET_SESSION_SETTINGS', res.data)
    }).catch(err => {
      return err
    })
  },
  async getDialerSessionSettings ({ commit }) {
    return window.axios.get(
      `/api/v2/dialer-sessions`
    ).then(res => {
      commit('SET_DIALER_SESSION_SETTINGS', res.data)
    }).catch(err => {
      return err
    })
  },
  async updateDialerSessionSetting ({ commit }, params = {}) {
    return window.axios.patch(
      `/api/v2/dialer-sessions/${params.id}`,
      params
    ).then(res => {
      return res
    }).catch(err => {
      return err
    })
  },
  async deleteDialerSessionSetting ({ commit }, id = '') {
    return window.axios.delete(
      `/api/v2/dialer-sessions/${id}`
    ).then(res => {
      return res
    }).catch(err => {
      return err
    })
  },
  resetPowerDialerTasks ({ commit }) {
    commit('RESET_POWER_DIALER_TASKS')
  },
  setDefaultSettings ({ commit }, data = {}) {
    commit('SET_DEFAULT_SETTING', data)
  },
  clearSessionSetting ({ commit }) {
    commit('CLEAR_SESSION_SETTING')
  },
  async updateateSessionSettings ({ commit }, params = {}) {
    return window.$axios.patch(`api/v2/power-dialer-sessions/${params.id}`,
      params
    ).then((res) => {
      return res
    }).catch((err) => {
      return err
    })
  },
  async setSessionSettingGroup ({ commit }, params = {}) {
    commit('SET_SESSION_SETTING_GROUPS', {
      personal: [
        // { name: 'Personal Sales', id: 1, disabled: true, hovered: false },
        // { name: 'Leads 101', id: 2, disabled: true, hovered: false }
      ],
      company: [
        // { name: 'HVAC Sales', id: 4 },
        // { name: 'Warm Leads', id: 5 },
        // { name: 'Cold Leads', id: 6 }
      ]
    })
    // return window.$axios.get(`api/v2/power-dialer-session-settings`,
    //   params
    // ).then((res) => {
    //   commit('SET_SESSION_SETTING_GROUPS', {
    //     personal: [
    //       { name: 'Personal Sales', id: 1 },
    //       { name: 'Leads 101', id: 2 },
    //       { name: 'Leads 203', id: 3 }
    //     ],
    //     company: [
    //       { name: 'HVAC Sales', id: 4 },
    //       { name: 'Warm Leads', id: 5 },
    //       { name: 'Cold Leads', id: 6 }
    //     ]
    //   })
    //   return res
    // }).catch((err) => {
    //   return err
    // })
  }
}
