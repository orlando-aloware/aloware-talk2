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

  // InboxController endpoints - MATCHING DEVELOP'S PATTERN
  inboxes: {
    async get (data) {
      return window.axios.get(`${suffixV3}team-inbox/inboxes`, data)
    },

    unreadCount (inboxIds, contactIds = null, filters = {}) {
      const params = {
        inbox_ids: inboxIds
      }

      if (contactIds) {
        params.contact_ids = contactIds
      }

      if (filters?.from_date) {
        params.from_date = filters.from_date
      }

      // Only send to_date for custom date ranges to prevent timezone cutoff issues
      if (filters?.to_date && filters?.date_range === 'custom') {
        params.to_date = filters.to_date
      }

      return window.axios.post(`${suffixV3}team-inbox/inboxes/unread-count`, params)
    }
  }
}
