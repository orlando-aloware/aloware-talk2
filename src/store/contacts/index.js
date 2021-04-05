import state from './contacts.store'
import getters from './contacts.getters'
import mutations from './contacts.mutations'
import actions from './contacts.actions'

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
