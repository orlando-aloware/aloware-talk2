import * as BroadcastDefault from 'src/constants/broadcast-default'

export default {
  ADD_BROADCAST (state, broadcast) {
    state.broadcasts.unshift(broadcast)
  },

  DELETE_BROADCAST (state, broadcast) {
    const index = state.broadcasts.findIndex(b => b.id === broadcast.id)

    if (index >= 0) {
      state.broadcasts.splice(index, 1)
    }
  },

  SET_BROADCASTS (state, broadcasts) {
    state.broadcasts = broadcasts
  },

  SET_BROADCASTS_LOADING (state, payload) {
    state.isBroadcastsLoading = payload
  },

  UPDATE_BROADCAST (state, broadcast) {
    const index = state.broadcasts.findIndex(b => b.id === broadcast.id)

    if (index >= 0) {
      state.broadcasts.splice(index, 1, broadcast)
    }
  },

  RESET_VUEX (state) {
    state = Object.assign({}, BroadcastDefault.DEFAULT_STATE)
  }
}
