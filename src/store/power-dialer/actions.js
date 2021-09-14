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
  }
}
