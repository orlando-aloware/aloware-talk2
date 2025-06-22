const suffixV3 = '/api/v3/'

export default {
  // ContactController endpoints
  contact: {
    show (id, config = {}) {
      return window.axios.get(`${suffixV3}team-inbox/contacts/${id}`, config)
    },

    getCommunications (id, params = {}, cancelToken = null) {
      const config = { params }
      if (cancelToken) {
        config.cancelToken = cancelToken
      }
      return window.axios.get(`${suffixV3}team-inbox/contacts/${id}/communications`, config)
    },

    getPhoneNumbers (id) {
      return window.axios.get(`${suffixV3}team-inbox/contacts/${id}/phone-numbers`)
    },

    getIntegrationData (id, params = {}) {
      return window.axios.get(`${suffixV3}team-inbox/contacts/${id}/integration-data`, { params })
    },

    markAsRead (id, params = {}) {
      return window.axios.post(`${suffixV3}team-inbox/contacts/${id}/mark-as-read`, params)
    },

    exportCommunications (id, params = {}) {
      return window.axios.get(`${suffixV3}team-inbox/contacts/${id}/export-communications`, { params })
    },

    getIncomingNumber (contactId, lineId) {
      return window.axios.get(`${suffixV3}team-inbox/contacts/${contactId}/campaign/${lineId}/get-incoming-number`)
    }
  },

  // CommunicationController endpoints
  communication: {
    info (params = {}) {
      return window.axios.get(`${suffixV3}team-inbox/communication/info`, { params })
    },

    show (id) {
      return window.axios.get(`${suffixV3}team-inbox/communications/${id}`)
    }
  },

  // ReportController endpoints
  reports: {
    communications (params = {}, config = {}) {
      const requestConfig = { params, ...config }
      return window.axios.get(`${suffixV3}team-inbox/reports/communications`, requestConfig)
    }
  },

  // CampaignController endpoints
  campaigns: {
    index (params = {}) {
      return window.axios.get(`${suffixV3}team-inbox/campaigns`, { params })
    }
  },

  // CalendarController endpoints
  calendar: {
    createEvent (contactId, params = {}) {
      return window.axios.post(`${suffixV3}team-inbox/calendar/events/contact/${contactId}/create`, params)
    },

    updateEvent (contactId, eventId, params = {}) {
      return window.axios.put(`${suffixV3}team-inbox/calendar/events/contact/${contactId}/update/${eventId}`, params)
    }
  },

  // InboxController endpoints (already implemented)
  inboxes: {
    list (params = {}, config = {}) {
      return window.axios.get(`${suffixV3}team-inbox/inboxes`, { params, ...config })
    },

    unreadCount (params = {}, config = {}) {
      return window.axios.post(`${suffixV3}team-inbox/inboxes/unread-count`, params, config)
    }
  }
}
