import API from 'src/plugins/api/api'

export default {
  async fetchLists ({ commit, state }, { page, perPage }) {
    try {
      if (state.isListsLoading) {
        return
      }

      commit('SET_LISTS_LOADING', true)

      const res = await API.V2.contactList.get({
        page: page || 1,
        size: perPage || 10,
        search: state.search
      })

      commit('SET_LISTS', res.data.data)
      commit('SET_LISTS_COUNT', res.data.total)
      commit('SET_LISTS_LOADING', false)

      return Promise.resolve()
    } catch (err) {
      commit('SET_LISTS_LOADING', false)
      console.log(err)
      this._vm.$handleErrors(err.response)
    }
  }
}
