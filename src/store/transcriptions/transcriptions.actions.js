export default {
  setGeneratingStatus ({ commit }, { communicationId, status }) {
    commit('SET_GENERATING_STATUS', { communicationId, status })
  }
}
