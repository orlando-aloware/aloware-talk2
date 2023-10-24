const suffixV1 = '/api/v1/'
const suffixV2 = '/api/v2/'
import qs from 'qs'
import _ from 'lodash'
import { DEFAULT_PINNED_LIST } from 'src/constants/contacts-list-default-pinned-list'

export default {
  V1: {
    contact: {
      get: function (id) {
        if (!id) {
          return null
        }

        return window.axios.get(`${suffixV1}contact/${id}`)
      },

      create (params) {
        return window.axios.post(`${suffixV1}contact`, params)
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
        if (!id || !phoneId) {
          return null
        }

        return window.axios.post(`${suffixV1}contact/${id}/phone-number/${phoneId}`, params)
      },

      deletePhone (id, phoneId) {
        if (!id || !phoneId) {
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

        return window.axios.post(`${suffixV1}calendar/events/contact/${id}/create`, params)
      },

      updateEngagement (contactId, eventId, params) {
        return window.axios.post(`${suffixV1}calendar/events/contact/${contactId}/update/${eventId}`, params)
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
      },

      unDnc (id, reason) {
        return window.axios.patch(`${suffixV1}contact/${id}/undnc`, {
          reason: reason
        })
      },

      getSequenceInfo (id) {
        return window.axios.get(`${suffixV1}contact/${id}/sequence-info`)
      },

      disenrollFromSequence (id) {
        return window.axios.post(`${suffixV1}contact/${id}/disenroll`)
      },

      syncHubspot (id) {
        return window.axios.post(`${suffixV1}contact/${id}/sync-hubspot`)
      },

      syncPipedrive (id) {
        return window.axios.post(`${suffixV1}contact/${id}/sync-pipedrive`)
      },

      syncGHL (id) {
        return window.axios.post(`${suffixV1}contact/${id}/sync-gohighlevel`)
      },

      bulkSaveCustomAttributes (contactId, params) {
        return window.axios.patch(`${suffixV1}contact-attributes/${contactId}`, params)
      },

      getCommunicationsSummary (contactId) {
        if (!contactId) {
          return null
        }

        return window.axios.get(`${suffixV1}contact/${contactId}/communications-summary`)
      }
    },

    tags: {
      get (params) {
        return window.axios.get(`${suffixV1}tag`, params)
      },

      create (params) {
        return window.axios.post(`${suffixV1}tag`, params)
      },

      update (id, params) {
        return window.axios.patch(`${suffixV1}tag/${id}`, params)
      },

      delete (id, params) {
        return window.axios.delete(`${suffixV1}tag/${id}`, params)
      },

      count (params = {}) {
        return window.axios.get(`${suffixV1}tags/count`, { params })
      },

      bulkDelete (params) {
        return window.axios.delete(`${suffixV1}tags/bulk-delete`, params)
      },

      split (id, params) {
        return window.axios.post(`${suffixV1}tags/${id}/split`, params)
      },

      assignContactsTo (id, params) {
        return window.axios.post(`${suffixV1}tags/${id}/assign-contacts-to`, params)
      },

      bulkAssignContactsTo (params) {
        return window.axios.post(`${suffixV1}tags/bulk-assign-contacts-to`, params)
      },

      addTasksToUserPowerDialer (id, params) {
        return window.axios.post(`${suffixV1}tags/${id}/add-to-user-power-dialer`, params)
      },

      bulkAddTasksToUserPowerDialer (params) {
        return window.axios.post(`${suffixV1}tags/bulk-add-to-user-power-dialer`, params)
      }
    },

    lines: {
      get () {
        return window.axios.get(`${suffixV1}campaign`)
      },

      fileUpload (lineId, params, events) {
        return window.axios.post(`${suffixV1}uploaded-files/${lineId}`, params, events)
      },

      faxUpload (lineId, params, events) {
        return window.axios.post(`${suffixV1}campaign/${lineId}/upload/fax`, params, events)
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
        },

        getList (params) {
          return window.axios.get(`${suffixV1}integration/hubspot/lists`, params)
        }
      },

      simpsocial: {
        messenger: {
          get () {
            return window.axios.get(`/integrations/simpsocial/messenger-source`)
          }
        },

        dmsEquity: {
          get () {
            return window.axios.get(`/integrations/simpsocial/dms-equity-source`)
          }
        },

        digitalLeadWar: {
          get () {
            return window.axios.get(`/integrations/simpsocial/digital-lead-war-source`)
          }
        },

        emailBlast: {
          get () {
            return window.axios.get(`/integrations/simpsocial/email-source`)
          }
        },

        videoConference: {
          send (contactId = null, campaignId = null) {
            if (contactId === null || campaignId === null) {
              return null
            }

            return window.axios.post(`/integrations/simpsocial/video-conference-to-contact/${contactId}`, {
              campaign_id: campaignId
            })
          }
        },

        creditApplication: {
          send (contactId = null, campaignId = null) {
            if (contactId === null || campaignId === null) {
              return null
            }

            return window.axios.post(`/integrations/simpsocial/credit-application-to-contact/${contactId}`, {
              campaign_id: campaignId
            })
          }
        }
      },

      zoho: {
        getViews () {
          return window.axios.get(`${suffixV1}integration/zoho/views`)
        }
      },

      pipedrive: {
        getFilters () {
          return window.axios.get(`${suffixV1}integration/pipedrive/filters`)
        }
      }

    },

    automations: {
      workflows: {
        enroll (workflowId, params) {
          return window.axios.post(`${suffixV1}automations/workflows/${workflowId}/sequence-contacts`, params)
        },

        bulkEnroll (workflowId, params) {
          return window.axios.post(`${suffixV1}automations/workflows/${workflowId}/bulk-tags-sequence-contacts`, params)
        }
      }
    },

    users: {
      withAccessToContact (contactId) {
        return window.axios.get(`${suffixV1}user/get-users-with-access-to-contact?contact_id=${contactId}`)
      },

      setDefaultLogin (userId, params) {
        return window.axios.patch(`${suffixV1}user/${userId}/set-default-app`, params)
      },

      setAgentStatus (userId, status) {
        return window.axios.post(`${suffixV1}user/${userId}/agent-status`, {
          agent_status: status
        })
      }
    },

    reports: {
      communications: {
        get (params) {
          return window.axios.get(`${suffixV1}reports/communications`, params)
        }
      }
    },

    user: {
      getById (id) {
        return window.axios.get(`${suffixV1}user/${id}`)
      },

      update (id, params) {
        return window.axios.put(`${suffixV1}user/${id}`, params)
      },

      diagnosis (id) {
        return window.axios.get(`${suffixV1}diagnosis/user/${id}`)
      },

      uploadMissedCallVM (id, params) {
        return window.axios.post(`${suffixV1}user/${id}/missed-call-voicemail`, params)
      },

      deleteMissedCallVM (id) {
        return window.axios.delete(`${suffixV1}user/${id}/missed-call-voicemail`)
      }
    },

    communication: {
      forceTerminate (id) {
        return window.axios.post(`${suffixV1}communication/${id}/force-terminate`)
      },

      forceDequeue (id) {
        return window.axios.post(`${suffixV1}communication/${id}/force-dequeue`)
      },

      get (id) {
        return window.axios.get(`${suffixV1}communication/${id}`)
      },

      delete (id) {
        return window.axios.delete(`${suffixV1}communication/${id}`)
      },

      reportIssue (id, data) {
        return window.axios.post(`${suffixV1}communications/${id}/report-issue`, data)
      }
    },

    statics: {
      get (companyId) {
        return window.axios.get('/get-statics', {
          params: {
            company_id: companyId
          }
        })
      }
    },

    library: {
      voicemailDrop: {
        get (params) {
          return window.axios.get(`${suffixV1}voicemail-drop`, params)
        },

        create (params) {
          return window.axios.post(`${suffixV1}voicemail-drop`, params)
        },

        delete (id) {
          return window.axios.delete(`${suffixV1}voicemail-drop/${id}`)
        }
      }
    },

    profile: {
      store (params) {
        return window.axios.post(`${suffixV1}profile`, params)
      }
    },

    urlShortener: {
      generate (text) {
        return window.axios.post('/api/v1/url-shortener/urls/parse', { text })
      },

      domains () {
        return window.axios.get(`${suffixV1}url-shortener/domains`)
      }
    },

    alohabot: {
      getContactSession (id) {
        return window.axios.get(`${suffixV1}bots/contact/${id}/session`)
      },

      disengageContact (id, params) {
        return window.axios.post(`${suffixV1}bots/contact/${id}/disengage`, params)
      }
    },
    broadcasts: {
      delete (id) {
        return window.axios.delete(`${suffixV1}broadcasts/${id}`)
      },
      enable (id) {
        return window.axios.post(`${suffixV1}broadcasts/${id}/toggle-active`)
      },
      get (params = {}) {
        return window.axios.get(`${suffixV1}broadcasts`, { params })
      },
      sendBulkMessage (params) {
        return window.axios.post(`${suffixV1}broadcasts/send-bulk-messages`, params)
      },
      sendBulkRvm (params) {
        return window.axios.post(`${suffixV1}broadcasts/send-bulk-rvm`, params)
      },
      update (id, broadcast) {
        return window.axios.put(`${suffixV1}broadcasts/${id}`, broadcast)
      },
      toggleStatus (id) {
        return window.axios.post(`${suffixV1}broadcasts/${id}/toggle-active`)
      }
    },
    contactCenter: {
      summary: {
        get (params) {
          return window.axios.post(`${suffixV1}contact-center/summary-report`, params)
        }
      },

      liveCalls: {
        get (params) {
          return window.axios.post(`${suffixV1}contact-center/live-calls`, params)
        }
      },

      parkedCalls: {
        get (params) {
          return window.axios.post(`${suffixV1}contact-center/parked-calls`, params)
        }
      },

      queuedCalls: {
        get (params) {
          return window.axios.post(`${suffixV1}contact-center/queued-calls`, params)
        }
      }
    }
  },

  V2: {
    contacts: {
      get (id, sourceToken = null) {
        if (!id || id === 'undefined') {
          return Promise.reject(new Error('Failed to process contact fetch: Missing contact id!'))
        }

        if (sourceToken) {
          return window.axios.get(`/api/v2/contacts/${id}`, {
            cancelToken: sourceToken
          })
        }

        return window.axios.get(`/api/v2/contacts/${id}`)
      },

      list (params, cancelTokenSource) {
        params.relations = _.get(params, 'relations', [
          'tags'
        ])

        return window.axios.get(`/api/v2/contacts`, { params, paramsSerializer: qs.stringify, cancelToken: cancelTokenSource })
      },

      counts (params, cancelTokenSource) {
        return window.axios.get(`${process.env.API_REPORTING_URL}/api/v2/contacts/count`, { params, paramsSerializer: qs.stringify })
      },

      inboxCounts (params) {
        return window.axios.get(`/api/v2/contacts/inbox-counts`, params)
      },

      taskStatusUpdate (id, params) {
        return window.axios.put(`/api/v2/contacts/${id}/task-status`, params)
      },

      async listExport (id, params = {}) {
        let defaultList = null
        Object.entries(DEFAULT_PINNED_LIST).forEach(([key, value]) => {
          if (value.id === id) {
            defaultList = DEFAULT_PINNED_LIST[key]
          }
        })

        if (!defaultList) {
          params.contact_list_id = id
        } else {
          params.default_list_type = defaultList.listType
        }

        return window.axios.get(`api/v2/contacts-list/export-csv`, {
          params: params
        })
      }
    },

    contactFolders: {
      list () {
        return window.axios.get(`${suffixV2}contact-folders`)
      },

      delete (id) {
        return window.axios.delete(`${suffixV2}contact-folders/${id}`)
      }
    },

    powerDialerFolders: {
      list (params = {}) {
        return window.axios.get(`${suffixV2}power-dialer-folders`, {
          params: params
        })
      },

      delete (id) {
        return window.axios.delete(`${suffixV2}power-dialer-folders/${id}`)
      }
    },

    powerDialerListItem: {
      add (params = {}) {
        return window.axios.post(`${suffixV2}power-dialer-list-items`, params)
      }
    },

    powerDialer: {
      async listExport (id, params = {}) {
        params.contact_list_id = id
        return window.axios.get(`api/v2/power-dialer-lists/export-csv`, {
          params: params
        })
      },

      userMyQueue (params = {}) {
        return window.axios.get(`api/v2/power-dialer-lists/my-queue`, {
          params: params
        })
      }
    },

    contactListItem: {
      addContact (contactListId, contacts = []) {
        return window.axios.post(`${suffixV2}contact-list-items`, {
          contact_list_id: contactListId,
          contacts: contacts
        })
      }
    },

    integrations: {
      hubspot: {
        importList (target, params) {
          return window.axios.post(`${suffixV2}power-dialer-lists/import-hubspot-list/${target}`, params)
        }
      },

      zoho: {
        importView (target, params) {
          return window.axios.post(`${suffixV2}power-dialer-lists/import-zoho-view/${target}`, params)
        }
      },

      pipedrive: {
        importFilter (target, params) {
          return window.axios.post(`${suffixV2}power-dialer-lists/import-pipedrive-filter/${target}`, params)
        }
      }

    },
    contactList: {
      get (params) {
        return window.axios.get(`${suffixV2}contacts-list`, { params })
      },
      public () {
        return window.axios.get(`${suffixV2}contacts-list/public`)
      }
    },

    filters: {
      get () {
        return window.axios.get(`${suffixV2}contacts/filters`)
      }
    },

    mentions: {
      get (params) {
        return window.axios.get(`${suffixV2}mentions`, params)
      }
    },

    inbox: {
      filters: {
        get (params) {
          return window.axios.get(`${suffixV2}filters`, { params: params })
        },

        save (params) {
          return window.axios.post(`${suffixV2}filters`, params)
        },

        update (filterId, params) {
          return window.axios.put(`${suffixV2}filters/${filterId}`, params)
        },

        delete (filterId) {
          return window.axios.delete(`${suffixV2}filters/${filterId}`)
        }
      }
    },

    users: {
      get (params) {
        return window.axios.get(`${suffixV2}users`, { params })
      }
    }
  }
}
