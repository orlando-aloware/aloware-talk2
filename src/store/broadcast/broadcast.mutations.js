import * as BroadcastDefault from 'src/constants/broadcast-default'

export default {
  ADD_BROADCAST (state, broadcast) {
    const index = state.broadcasts.findIndex(b => b.id === broadcast.id)

    if (index === -1) {
      state.broadcasts.unshift(broadcast)
    }
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

  SET_BROADCASTS_COUNT (state, count) {
    state.broadcastsCount = count
  },

  SET_BROADCASTS_LOADING (state, payload) {
    state.isBroadcastsLoading = payload
  },

  SET_SEARCH (state, search) {
    state.search = search
  },

  SET_STATUS (state, status) {
    // fix that sometimes is sent, sometimes is done
    if (status === 'sent') {
      status = 'done'
    }

    state.status = status
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
