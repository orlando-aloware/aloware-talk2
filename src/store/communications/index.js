import state from './communications.store'
import getters from './communications.getters'
import mutations from './communications.mutations'
import actions from './communications.actions'

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
