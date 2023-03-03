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
        //   appointmentsSet: 0,
        averageTalkTime: summary.average_talk_time,
        averageWaitTime: summary.average_wait_time,
        //   emailsReceived: 0,
        //   emailsSent: 0,
        //   faxesReceived: 0,
        //   faxesSent: 0,
        missedCalls: summary.missed_calls,
        //   remindersSet: 0,
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

  setFilter ({ commit }, { filter, value }) {
    commit('SET_FILTER', { filter, value })
  },

  setViewMode ({ commit }, mode) {
    if (!['compact', 'comfort'].includes(mode)) {
      throw new Error('Invalid mode!')
    }

    commit('SET_VIEW_MODE', mode)
  }
  // fetchUsers
  // fetchQueuedCalls
  // fetchLiveCalls
  // fetchParkedCalls
}
