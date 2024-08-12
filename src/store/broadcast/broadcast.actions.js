import API from 'src/plugins/api/api'

export default {
  /**
   * Delete broadcast
   *
   * @param {Integer} id - broadcast ID
   * @returns Promise
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
   *
   * @param {Object} obj
   * @param {Integer} obj.page - page number
   * @param {Integer} obj.perPage - records to be retrieved
   * @param {String} obj.order - asc / desc
   * @param {String} obj.orderBy - order field
   * @returns Promise
   */
  async fetchBroadcasts ({ commit, state }, { page, perPage, order, orderBy }) {
    try {
      if (state.isBroadcastsLoading) {
        return
      }

      commit('SET_BROADCASTS_LOADING', true)

      const res = await API.V1.broadcasts.get({
        order_by: orderBy || 'id',
        order: order || 'desc',
        per_page: perPage || 10,
        page: page || 1,
        search_text: state.search,
        status: state.status,
        paginate: true
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
  },

  setSmartEncodedMessageLength ({ commit }, messageLength) {
    commit('SET_SMART_ENCODED_MESSAGE_LENGTH', messageLength)
  },

  setSelectedCampaign ({ commit }, campaign) {
    commit('SET_SELECTED_CAMPAIGN', campaign)
  },

  setContactsLength ({ commit }, length) {
    commit('SET_CONTACTS_LENGTH', length)
  }
}
