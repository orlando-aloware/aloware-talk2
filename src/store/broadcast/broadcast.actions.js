import API from 'src/plugins/api/api'

export default {
  /**
   * Delete broadcast
   */
  async deleteBroadcast ({ commit }, id) {
    try {
      await API.V1.broadcast.delete(id)

      commit('DELETE_BROADCAST', id)
    } catch (err) {
      console.log(err)
      this._vm.$handleErrors(err.response)
    }
  },

  /**
   * Fetch broadcasts
   */
  async fetchBroadcasts ({ commit, state }) {
    try {
      if (state.isBroadcastsLoading) {
        return
      }

      commit('SET_BROADCASTS_LOADING', true)

      const res = await API.V1.broadcast.get()

      commit('SET_BROADCASTS', res.data)
      commit('SET_BROADCASTS_LOADING', false)
    } catch (err) {
      commit('SET_BROADCASTS_LOADING', false)
      console.log(err)
      this._vm.$handleErrors(err.response)
    }
  }
}
