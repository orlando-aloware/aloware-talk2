import API from 'src/plugins/api/api'

export default {
  /**
   * Delete broadcast
   */
  async deleteBroadcast ({ commit }, id) {
    try {
      await API.V1.broadcasts.delete(id)

      commit('DELETE_BROADCAST', id)

      return Promise.resolve()
    } catch (err) {
      console.log(err)
      this._vm.$handleErrors(err.response)
    }
  },

  /**
   * Fetch broadcasts
   */
  async fetchBroadcasts ({ commit, state }, { page, perPage }) {
    try {
      if (state.isBroadcastsLoading) {
        return
      }

      commit('SET_BROADCASTS_LOADING', true)

      const res = await API.V1.broadcasts.get({
        order_by: 'id',
        order: 'desc',
        per_page: perPage || 10,
        page: page || 1,
        search_text: state.search,
        status: state.status
      })

      commit('SET_BROADCASTS', res.data.data)
      commit('SET_BROADCASTS_COUNT', res.data.total)
      commit('SET_BROADCASTS_LOADING', false)

      return Promise.resolve()
    } catch (err) {
      commit('SET_BROADCASTS_LOADING', false)
      console.log(err)
      this._vm.$handleErrors(err.response)
    }
  }
}
