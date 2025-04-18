import API from 'src/plugins/api/api'

export default {
  async fetchLists ({ commit, state }, { page, perPage, sort, order, filters }) {
    try {
      if (state.isListsLoading) {
        return
      }

      commit('SET_LISTS_LOADING', true)

      const params = {
        page: page || 1,
        size: perPage || 10,
        sort,
        order,
        ...(state.search && { search: state.search.trim() }),
        ...filters
      }

      const res = await API.V2.contactList.get(params)

      commit('SET_LISTS', res.data.data)
      commit('SET_LISTS_COUNT', res.data.total)
      commit('SET_LISTS_LOADING', false)

      return Promise.resolve()
    } catch (err) {
      commit('SET_LISTS_LOADING', false)
      console.log(err)
      this._vm.$handleErrors(err.response)
    }
  },

  async deleteList ({ commit }, id) {
    try {
      const params = {
        from_admin_list: true
      }

      await API.V2.contactList.delete(id, params)

      return Promise.resolve()
    } catch (err) {
      console.log(err)
      this._vm.$handleErrors(err.response)
    }
  },

  async updateList ({ commit }, { id, data }) {
    try {
      const params = {
        ...data,
        from_admin_list: true
      }

      return API.V2.contactList.update(id, params)
    } catch (err) {
      console.log(err)
      return Promise.reject(err)
    }
  }
}
