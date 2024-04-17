import Vue from 'vue'
import _ from 'lodash'
import * as AuthDefault from 'src/constants/auth-default'

export default {
  SET_PROFILE (state, profile) {
    if (!profile) {
      return
    }

    if (state.profile === null) {
      state.profile = {}
    }

    const index = { data: null }
    for (index.data in profile) {
      // only update the properties if the new value
      // is not the same
      if (state.profile[index.data] !== profile[index.data]) {
        Vue.set(state.profile, index.data, profile[index.data])
      }
    }
  },
  SET_AGENT_STATUS (state, agentStatus) {
    // only update agent_status if the new value
    // is not the same
    if (state.profile.agent_status !== agentStatus) {
      state.profile.agent_status = agentStatus
    }
  },
  SET_AUTHENTICATED (state, authenticated) {
    state.authenticated = authenticated
  },
  SET_LOADING (state, loading) {
    state.loading = loading
  },

  RESET_VUEX (state, value) {
    if (!_.isArray(value) || _.isEmpty(value)) {
      return
    }

    const newState = { data: AuthDefault.DEFAULT_STATE }

    if (value.includes('non-cache')) {
      delete newState.profile
    }

    state = Object.assign(state, newState)

    if (!value.includes('all')) {
      return
    }

    // else, perform state reset
    state = Object.assign({}, AuthDefault.DEFAULT_STATE)
  }
}
