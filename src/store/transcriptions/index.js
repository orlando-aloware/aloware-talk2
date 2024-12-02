import actions from './transcriptions.actions'
import getters from './transcriptions.getters'
import mutations from './transcriptions.mutations'

export default {
  namespaced: true,
  state: {
    generatingStatus: {} // Tracks `isGenerating` status per communication ID
  },
  actions,
  getters,
  mutations
}
