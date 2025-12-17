export default {
  setItems: ({ commit }, items) => {
    commit('SET_ITEMS', items)
  },
  setUser: ({ commit }, user) => {
    commit('SET_USER', user)
  },
  setUserClone: ({ commit }, user) => {
    commit('SET_USER_CLONE', user)
  },
  updateChangedUserProperties: ({ commit }, params) => {
    commit('UPDATE_CHANGED_USER_PROPERTIES', params)
  },
  resetChangedUserProperties: ({ commit }) => {
    commit('RESET_CHANGED_USER_PROPERTIES')
  },

  setFormValidity: ({ commit }, isValid) => {
    commit('SET_FORM_VALIDITY', isValid)
  }
}
