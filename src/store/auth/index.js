import state from './auth.store'
import getters from './auth.getters'
import mutations from './auth.mutations'
import actions from './auth.actions'

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
