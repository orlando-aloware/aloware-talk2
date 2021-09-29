import state from './settings.store'
import getters from './settings.getters'
import mutations from './settings.mutations'
import actions from './settings.actions'

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
