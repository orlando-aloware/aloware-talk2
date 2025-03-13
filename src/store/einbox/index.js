import state from './einbox.store'
import getters from './einbox.getters'
import mutations from './einbox.mutations'
import actions from './einbox.actions'

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
