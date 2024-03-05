export default {
  loading (state) {
    return state.loading
  },
  profile (state) {
    return state.profile
  },
  authenticated (state) {
    return state.authenticated
  },
  user (state) {
    return { profile: state.profile, authenticated: state.authenticated }
  },
  isTrial (state) {
    return state.profile?.company?.is_trial
  }
}
