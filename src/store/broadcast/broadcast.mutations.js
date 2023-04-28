export default {
  DELETE_BROADCAST (state, id) {
    const index = state.broadcasts.findIndex(broadcast => broadcast.id === id)

    if (index >= 0) {
      state.broadcasts.splice(index, 1)
    }
  },

  SET_BROADCASTS (state, broadcasts) {
    state.broadcasts = broadcasts
  },

  SET_BROADCASTS_LOADING (state, payload) {
    state.isBroadcastsLoading = payload
  }
}
