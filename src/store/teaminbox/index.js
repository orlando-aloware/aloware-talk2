import state from './teaminbox.store'
import getters from './teaminbox.getters'
import mutations from './teaminbox.mutations'
import actions from './teaminbox.actions'

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
