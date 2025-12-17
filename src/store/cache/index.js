import state from './cache.store'
import getters from './cache.getters'
import mutations from './cache.mutations'
import actions from './cache.actions'

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
