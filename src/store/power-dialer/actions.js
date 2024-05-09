import qs from 'qs'
import moment from 'moment'
import { get } from 'lodash'
import talk2Api from 'src/plugins/api/api'

export default {
  /**
   * Actual API Calls for
   * Contact Folders (mimicking Contacts)
   */
  getContactFolders: async ({ commit }) => {
    const res = await window.axios.get('api/v2/contact-folders')

    return res.data
  },

  getPublicContactLists: async ({ commit }, params = {}) => {
    const res = await talk2Api.V2.contactList.public(params)

    return res.data
  },

  /**
   * Actual API Calls for
   * POWER-DIALER
   */
  setSelectedPDList: async ({ commit }, data = {}) => {
    commit('SET_SELECTED_PD_LIST', data)
    commit('contacts/SET_SELECTED_LIST', data, { root: true })
  },

  getMyQueueList: async ({ commit }) => {
    try {
      return Promise.all([
        window.axios.get(`api/v2/power-dialer-lists/my-queue`),
        window.axios.get(`api/v2/power-dialer-lists/my-queue/session-metrics`)
      ]).then(([listResponse, sessionMetricsResponse]) => {
        listResponse.data.session_metrics = sessionMetricsResponse.data.session_metrics
        commit('SET_MY_QUEUE_LIST', listResponse.data)

        return listResponse
      })
    } catch (error) {
      console.log('Error getting my queue list:', error)
    }
  },

  getPowerDialerList: async ({ commit }, id = '') => {
    const res = await window.axios.get(`api/v2/power-dialer-lists/${id}`)

    if (res.status === 200) {
      commit('SET_SELECTED_PD_LIST',
        {
          id: res.data.id,
          name: res.data.name,
          type: res.data.type
        }
      )
    }

    return res.data
  },

  updateMyQueueListData: ({ commit }, data = {}) => {
    commit('SET_MY_QUEUE_LIST_DATA', data.data)
    commit('SET_MY_QUEUE_LIST_FILTERS', data)
  },

  getContact: async ({ commit }, params = {}) => {
    const contactId = get(params, 'id', null)

    if (!contactId || contactId === 'undefined') {
      console.log('Failed to get contact: Missing contact id!')
      return
    }

    const res = await window.axios.get(`api/v2/contacts/${contactId}`)

    if (res.status === 200) {
      commit('contacts/SET_CONTACT', res.data, { root: true })

      return res.data
    }
  },

  getContacts: async ({ commit }) => {
    const res = await window.axios.get(`api/v2/contacts`)

    return res.data
  },

  getContactResources: async ({ commit }, params = {}) => {
    const res = await window.axios.get('api/v2/contacts', {
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
    const res = await window.axios.get(endpoint)

    return res.data
  },

  async updateContactsList ({ commit }, params = {}) {
    const res = await window.axios.patch(
      `api/v2/power-dialer-lists/${params.id}`,
      params
    )

    return res.data
  },

  /**
   * Disposition API calls
   */
  async updateCallDisposition ({ commit }, params = {}) {
    const res = await window.axios.post(`api/v1/communication/${params.id}/dispose-call`, {
      'call_disposition_id': params.params.call_disposition_id,
      paramsSerializer: qs.stringify
    })

    if (res.status === 200) {
      return res.data
    }
  },

  async updateContactDisposition ({ commit }, params = {}) {
    const res = await window.axios.post(`api/v1/contact/${params.id}/dispose`, {
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

  async getSessionTaskByFilter ({ commit }, params = {}) {
    // let res = await window.axios.get(`api/v2/power-dialer-lists/${params.id}/itemspage=1&per_page=25&sort_order=desc&task_status=${params.taks_status}`)
    // let endpoint = params?.task_status ? `api/v2/power-dialer-lists/${params.id}/items?task_status=${params.task_status}` : `api/v2/power-dialer-lists/${params.id}/items`
    return window.axios.get(
      `api/v2/power-dialer-lists/${params.id === 'all' ? 'my-queue' : params.id}/items`,
      {
        params,
        paramsSerializer: qs.stringify
      }
    )
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
  },

  async getLastCommunicationScript ({ commit }, id = null) {
    const res = await window.axios.get(`api/v1/communication/${id}/scripts`)

    return res
  },

  getTranslatedScript ({ commit }, { id, params }) {
    return window.axios.get(`api/v2/contacts/${id}/translate-script`, { params })
  },

  setFinishedPowerDialerSession: ({ commit }, data = true) => {
    commit('SET_FINISHED_PD_SESSION', data)
  },

  updateSessionTimer: ({ commit }, data) => {
    commit('UPDATE_SESSION_TIMER', data)
  },

  updateCountdownTimer: ({ commit }, data = -1) => {
    commit('UPDATE_COUNTDOWN_TIMER', data)
  },

  updateOngoingSession: ({ commit }, data) => {
    if (!data) {
      commit('UPDATE_ONGOING_SESSION', {
        finishedPdSession: false,
        startTime: moment(),
        totalSeconds: 0,
        listId: null
      })
    }

    commit('UPDATE_ONGOING_SESSION', data)
  },

  setActiveTask: ({ commit }, task) => {
    commit('SET_ACTIVE_TASK', task)
  },

  addRedialedTask: ({ commit }, taskId) => {
    commit('ADD_REDIALED_TASK', taskId)
  },

  clearRedialedTasks: ({ commit }) => {
    commit('CLEAR_REDIALED_TASKS')
  },

  removeFirstInQueueTask: ({ commit }) => {
    commit('REMOVE_FIRST_IN_QUEUE_TASK')
  },

  reQueuePowerDialerTask: ({ commit }, payload) => {
    commit('REQUEUE_POWER_DIALER_TASK', payload)
  },

  setPDListCancelToken ({ commit }, token) {
    commit('SET_PD_LIST_CANCEL_TOKEN', token)
  },

  setPDListSource ({ commit }, source) {
    commit('SET_PD_LIST_SOURCE', source)
  }
}
