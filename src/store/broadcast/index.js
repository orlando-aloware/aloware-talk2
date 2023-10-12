import state from './broadcast.store'
import getters from './broadcast.getters'
import mutations from './broadcast.mutations'
import actions from './broadcast.actions'

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
