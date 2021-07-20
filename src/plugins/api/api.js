let suffixV1 = '/api/v1/'

export default {
  V1: {
    contact: {
      get: function (id) {
        if (!id) {
          return null
        }
        return window.axios.get(`${suffixV1}contact/${id}`)
      },
      getAttributes (id) {
        if (!id) {
          return null
        }
        return window.axios.get(`${suffixV1}contact-attributes/${id}`)
      },
      update: function (id, params) {
        if (!id) {
          return null
        }
        return window.axios.put(`${suffixV1}contact/${id}`, params)
      },
      getPhoneNumbers (id) {
        if (!id) {
          return null
        }
        return window.axios.get(`${suffixV1}contact/${id}/phone-numbers`)
      },
      getRingGroups (id) {
        if (!id) {
          return null
        }
        return window.axios.get(`${suffixV1}contact/${id}/ring-groups`)
      },
      storeTags (id, params) {
        if (!id) {
          return null
        }
        return window.axios.post(`${suffixV1}contact/${id}/tag`, params)
      },
      storeLines (id, params) {
        if (!id) {
          return null
        }
        return window.axios.put(`${suffixV1}contact/${id}/campaigns`, params)
      },
      storeRingGroups (id, params) {
        if (!id) {
          return null
        }
        return window.axios.put(`${suffixV1}contact/${id}/ring-groups`, params)
      },
      storePhone (id, params) {
        if (!id) {
          return null
        }
        return window.axios.post(`${suffixV1}contact/${id}/phone-number`, params)
      },
      updatePhone (id, phoneId, params) {
        if (!id || phoneId) {
          return null
        }
        return window.axios.post(`${suffixV1}contact/${id}/phone-number/${phoneId}`, params)
      },
      deletePhone (id, phoneId) {
        if (!id || phoneId) {
          return null
        }
        return window.axios.delete(`${suffixV1}contact/${id}/phone-number/${phoneId}`)
      },
      dispose (id, params) {
        if (!id) {
          return null
        }
        return window.axios.post(`${suffixV1}contact/${id}/dispose`, params)
      },
      sendEmail (id, params) {
        if (!id) {
          return null
        }
        return window.axios.post(`${suffixV1}contact/${id}/send-email`, params)
      },
      addEngagement (id, params) {
        if (!id) {
          return null
        }
        return window.axios.post(`${suffixV1}contact/${id}/add-engagement`, params)
      },
      updateEngagement (contactId, eventId, params) {
        return window.axios.post(`${suffixV1}contact/${contactId}/${eventId}/update-engagement`, params)
      },
      getLineIncomingNumber (contactId, lineId) {
        if (!contactId || !lineId) {
          return null
        }
        return window.axios.get(`${suffixV1}contact/${contactId}/campaign/${lineId}/get-incoming-number`)
      },
      getIntegrationData (contactId, params) {
        if (!contactId) {
          return null
        }
        return window.axios.get(`${suffixV1}contact/${contactId}/integration-data`, params)
      }
    },
    tags: {
      get (params) {
        return window.axios.get(`${suffixV1}tag`, params)
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
    smsTemplate: {
      get () {
        return window.axios.get(`${suffixV1}sms-template`)
      },
      create (params) {
        return window.axios.post(`${suffixV1}sms-template`, params)
      },
      update (id, params) {
        return window.axios.put(`${suffixV1}sms-template/${id}`, params)
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
    },
    users: {
      withAccessToContact (contactId) {
        return window.axios.get(`${suffixV1}user/get-users-with-access-to-contact?contact_id=${contactId}`)
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
