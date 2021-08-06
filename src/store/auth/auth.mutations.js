export default {
  SET_PROFILE (state, profile) {
    state.profile = profile
  },
  SET_AGENT_STATUS (state, agentStatus) {
    state.profile.agent_status = agentStatus
  },
  SET_AUTHENTICATED (state, authenticated) {
    state.authenticated = authenticated
  },
  SET_LOADING (state, loading) {
    state.loading = loading
  }
}
