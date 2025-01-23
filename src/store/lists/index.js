import state from './lists.store'
import getters from './lists.getters'
import mutations from './lists.mutations'
import actions from './lists.actions'

export default {
  namespaced: true,
  getters,
  mutations,
  state,
  actions
}
