export default {
  user ({
    authenticated,
    profile
  }) {
    return {
      authenticated,
      profile
    }
  },
  loading (state) {
    return state.loading
  }
}
