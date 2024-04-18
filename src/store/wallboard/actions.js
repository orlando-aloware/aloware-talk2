import API from 'src/plugins/api/api'

export default {
  /**
   * Fetch live calls
   */
  async fetchLiveCalls ({ commit, state }) {
    try {
      if (state.isLiveCallsLoading) {
        return
      }

      commit('SET_LIVE_CALLS_LOADING', true)

      const res = await API.V1.contactCenter.liveCalls.get({
        ring_group_id: state.filters.ringGroup
      })

      commit('SET_LIVE_CALLS', res.data)
      commit('SET_LIVE_CALLS_LOADING', false)
    } catch (err) {
      commit('SET_LIVE_CALLS_LOADING', false)
      console.log(err.response || err)
      this._vm.$handleErrors(err.response)
    }
  },

  /**
   * Fetch parked calls
   */
  async fetchParkedCalls ({ commit, state }) {
    try {
      if (state.isParkedCallsLoading) {
        return
      }

      commit('SET_PARKED_CALLS_LOADING', true)

      const res = await API.V1.contactCenter.parkedCalls.get({
        ring_group_id: state.filters.ringGroup
      })

      commit('SET_PARKED_CALLS', res.data)
      commit('SET_PARKED_CALLS_LOADING', false)
    } catch (err) {
      commit('SET_PARKED_CALLS_LOADING', false)
      console.log(err.response || err)
      this._vm.$handleErrors(err.response)
    }
  },

  /**
   * Fetch live calls
   */
  async fetchQueuedCalls ({ commit, state }) {
    try {
      if (state.isQueuedCallsLoading) {
        return
      }

      commit('SET_QUEUED_CALLS_LOADING', true)

      const res = await API.V1.contactCenter.queuedCalls.get({
        ring_group_id: state.filters.ringGroup
      })

      commit('SET_QUEUED_CALLS', res.data)
      commit('SET_QUEUED_CALLS_LOADING', false)
    } catch (err) {
      commit('SET_QUEUED_CALLS_LOADING', false)
      console.log(err.response || err)
      this._vm.$handleErrors(err.response)
    }
  },

  /**
   * Fetch summary data for contact center
   */
  async fetchSummary ({ commit, state }) {
    try {
      if (state.isSummaryLoading) {
        return
      }

      commit('SET_SUMMARY_LOADING', true)

      const res = await API.V1.contactCenter.summary.get({
        ring_group_id: state.filters.ringGroup,
        line_id: state.filters.lineId,
        timezone: window.timezone
      })
      const summary = res.data

      commit('SET_SUMMARY', {
        abandonedCalls: summary.abandoned_calls,
        answeredCalls: summary.answered_calls,
        appointmentsSet: summary.appointments,
        averageTalkTime: summary.average_talk_time,
        averageWaitTime: summary.average_wait_time,
        emailsReceived: summary.emails_received,
        emailsSent: summary.emails_sent,
        faxesReceived: summary.faxes_received,
        faxesSent: summary.faxes_sent,
        missedCalls: summary.missed_calls,
        remindersSet: summary.reminders,
        textsReceived: summary.sms_received,
        textsSent: summary.sms_sent,
        totalCalls: summary.total_calls,
        totalOccupancy: summary.total_occupancy
      })

      commit('SET_SUMMARY_LOADING', false)
    } catch (err) {
      commit('SET_SUMMARY_LOADING', false)
      console.log(err.response || err)
      this._vm.$handleErrors(err.response)
    }
  },

  /**
   * Fetch agents
   */
  async fetchAgents ({ commit, state }) {
    try {
      if (state.isAgentsLoading) {
        return
      }

      commit('SET_AGENTS_LOADING', true)

      const response = await API.V2.users.get()

      commit('SET_AGENTS', response.data)
      commit('SET_AGENTS_LOADING', false)
    } catch (err) {
      commit('SET_AGENTS_LOADING', false)
      console.log(err.response || err)
      this._vm.$handleErrors(err.response)
    }
  },

  /**
   * Set agent status, calling the API and updating the store
   */
  async setAgentStatus ({ commit }, params) {
    try {
      const response = await API.V1.users.setAgentStatus(params.userId, params.status)

      commit('SET_AGENT_STATUS', response.data)
    } catch (err) {
      console.log(err.response || err)
      this._vm.$handleErrors(err.response)
    }
  }
}
