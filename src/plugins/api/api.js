let suffixV1 = '/api/v1/'

export default {
  V1: {
    contact: {
      get: function (id) {
        return window.axios.get(`${suffixV1}contact/${id}`)
      },
      getAttributes (id) {
        return window.axios.get(`${suffixV1}contact-attributes/${id}`)
      },
      update: function (id, params) {
        return window.axios.put(`${suffixV1}contact/${id}`, params)
      },
      getPhoneNumbers (id) {
        return window.axios.get(`${suffixV1}contact/${id}/phone-numbers`)
      },
      getRingGroups (id) {
        return window.axios.get(`${suffixV1}contact/${id}/ring-groups`)
      },
      storeTags (id, params) {
        return window.axios.post(`${suffixV1}contact/${id}/tag`, params)
      },
      storeLines (id, params) {
        return window.axios.put(`${suffixV1}contact/${id}/campaigns`, params)
      },
      storeRingGroups (id, params) {
        return window.axios.put(`${suffixV1}contact/${id}/ring-groups`, params)
      },
      storePhone (id, params) {
        return window.axios.post(`${suffixV1}contact/${id}/phone-number`, params)
      },
      updatePhone (id, phoneId, params) {
        return window.axios.post(`${suffixV1}contact/${id}/phone-number/${phoneId}`, params)
      },
      deletePhone (id, phoneId) {
        return window.axios.delete(`${suffixV1}contact/${id}/phone-number/${phoneId}`)
      },
      dispose (id, params) {
        return window.axios.post(`${suffixV1}contact/${id}/dispose`, params)
      },
      sendEmail (id, params) {
        return window.axios.post(`${suffixV1}contact/${id}/send-email`, params)
      },
      addEngagement (id, params) {
        return window.axios.post(`${suffixV1}contact/${id}/add-engagement`, params)
      },
      updateEngagement (contactId, eventId, params) {
        return window.axios.post(`${suffixV1}contact/${contactId}/${eventId}/update-engagement`, params)
      },
      getLineIncomingNumber (contactId, lineId) {
        return window.axios.get(`${suffixV1}contact/${contactId}/campaign/${lineId}/get-incoming-number`)
      },
      getIntegrationData (contactId, params) {
        return window.axios.get(`${suffixV1}contact/${contactId}/integration-data`, params)
      }
    },
    tags: {
      get () {
        return window.axios.get(`${suffixV1}tag?full_load=true`)
      }
    },
    lines: {
      get () {
        return window.axios.get(`${suffixV1}campaign`)
      },
      fileUpload (lineId, params, events) {
        return window.axios.post(`${suffixV1}uploaded-files/${lineId}`, params, events)
      },
      pdfUpload (lineId, params, events) {
        return window.axios.post(`${suffixV1}campaign/${lineId}/upload/pdf`, params, events)
      },

      sendFax (lineId, contactId, params) {
        return window.axios.post(`${suffixV1}campaign/send-fax/${lineId}/${contactId}`, params)
      }
    },
    ringGroups: {
      get () {
        return window.axios.get(`${suffixV1}ring-group`)
      }
    },
    message: {
      send (params) {
        return window.axios.post(`${suffixV1}messages`, params)
      },
      scheduled (params) {
        return window.axios.post(`${suffixV1}scheduled-messages`, params)
      },
      getScheduledByContact (contactId, params) {
        return window.axios.get(`${suffixV1}scheduled-messages/${contactId}`, { params })
      },
      deleteScheduledMessage (messageId) {
        return window.axios.delete(`${suffixV1}scheduled-messages/${messageId}`)
      }
    },
    sms_template: {
      get () {
        return window.axios.get(`${suffixV1}sms-template`)
      },
      delete (id) {
        return window.axios.delete(`${suffixV1}sms-template/${id}`)
      }
    },
    integrations: {
      hubspot: {
        getWorkflows () {
          return window.axios.get(`${suffixV1}integration/hubspot/workflows`)
        },
        enrollToWorkflow (params) {
          return window.axios.post(`${suffixV1}integration/hubspot/enroll-contact`, params)
        }
      }
    },
    automations: {
      workflows: {
        enroll (workflowId, params) {
          return window.axios.post(`${suffixV1}automations/workflows/${workflowId}/sequence-contacts`, params)
        }
      }
    }
  },
  V2: {
    contact: {
      getRingGroups (id) {
        return window.axios.get(`/api/v2/contact/${id}/ring-groups`)
      }
    }
  }

}
