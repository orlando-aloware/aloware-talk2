export default {
  user ({
    authenticated,
    profile,
    loading
  }) {
    return {
      authenticated,
      profile,
      loading
    }
  }
}
