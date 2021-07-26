import state from './inbox.store'
import getters from './inbox.getters'
import mutations from './inbox.mutations'
import actions from './inbox.actions'

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
