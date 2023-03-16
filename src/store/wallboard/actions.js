import API from 'src/plugins/api/api'

export default {
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
      console.log(err.response || err)
      this._vm.$handleErrors(err.response)
    }
  },

  /**
   * Fetch users
   */
  async fetchUsers ({ commit, state }) {
    try {
      if (state.isUsersLoading) {
        return
      }

      commit('SET_USERS_LOADING', true)

      const response = await API.V2.users.get()

      commit('SET_USERS', response.data)
      commit('SET_USERS_LOADING', false)
    } catch (err) {
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
  },

  setFilter ({ commit }, { filter, value }) {
    commit('SET_FILTER', { filter, value })
  },

  setViewMode ({ commit }, mode) {
    if (!['compact', 'comfort'].includes(mode)) {
      throw new Error('Invalid mode!')
    }

    commit('SET_VIEW_MODE', mode)
  }
  // fetchQueuedCalls
  // fetchLiveCalls
  // fetchParkedCalls
}
