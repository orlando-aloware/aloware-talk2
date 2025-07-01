const suffixV1 = '/api/v1/'
const suffixV2 = '/api/v2/'
import _ from 'lodash'
import qs from 'qs'
import * as AloAi from 'src/constants/aloai'
import { DEFAULT_PINNED_LIST } from 'src/constants/contacts-list-default-pinned-list'

const exportCommunications = async (contactId, fromTeamInbox) => {
  const params = {}

  if (fromTeamInbox) {
    params.from_team_inbox = fromTeamInbox
  }

  return window.axios.get(`${suffixV2}contacts/${contactId}/export-communications`, { params })
}

const talk2Api = {
  V1: {
    contact: {
      createAxiosError (message, status) {
        let error = new Error(message)
        error.response = {
          status: status,
          data: {
            error: message
          }
        }
        return error
      },
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

      getPhoneNumbers (id, fromTeamInbox = false) {
        if (!id) {
          return Promise.reject(new Error('Failed to get phone numbers, missing contact id!'))
        }

        const params = {}

        if (fromTeamInbox) {
          params.from_team_inbox = fromTeamInbox
        }

        return window.axios.get(`${suffixV1}contact/${id}/phone-numbers`, {
          params
        })
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

      addEngagement (id, params, teamInboxId) {
        if (!id) {
          return null
        }

        if (teamInboxId) {
          params.from_team_inbox = true
          params.ring_group_id = teamInboxId
        }

        return window.axios.post(`${suffixV1}calendar/events/contact/${id}/create`, params)
      },

      updateEngagement (contactId, eventId, params) {
        return window.axios.post(`${suffixV1}calendar/events/contact/${contactId}/update/${eventId}`, params)
      },

      getLineIncomingNumber (contactId, lineId, fromTeamInbox = false) {
        if (!contactId || !lineId) {
          return null
        }

        const params = {}

        if (fromTeamInbox) {
          params.from_team_inbox = fromTeamInbox
        }

        return window.axios.get(`${suffixV1}contact/${contactId}/campaign/${lineId}/get-incoming-number`, {
          params
        })
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

      syncSalesforce (id) {
        return window.axios.post(`${suffixV1}contact/${id}/sync-salesforce`)
      },

      forceCreateAlowareContactViaSalesforce (id, type) {
        return window.axios.post(`${suffixV1}integrations/salesforce/force-create-aloware-contact`, {
          objectType: type,
          recordId: id
        })
      },

      syncGuesty (id) {
        return window.axios.post(`${suffixV1}contact/${id}/sync-guesty`)
      },

      syncZoho (id) {
        return window.axios.post(`${suffixV1}contact/${id}/sync-zoho`)
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

      convertTagToList (params) {
        return window.axios.post(`${suffixV2}contacts-list/convert`, params)
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

    filters: {
      async get ({ isOnCompany } = {}) {
        const { data = [] } = await window.axios.get(`${suffixV1}filter`)

        if (isOnCompany) {
          return data.filter(filter => filter.is_on_company)
        }

        return data
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
      salesforce: {
        getList (params) {
          return window.axios.get(`${suffixV1}integration/salesforce/lists`, params)
        }
      },
      hubspot: {
        getWorkflows () {
          return window.axios.get(`${suffixV1}integration/hubspot/workflows`)
        },

        enrollToWorkflow (params) {
          return window.axios.post(`${suffixV1}integration/hubspot/enroll-contact`, params)
        },

        getList (params) {
          return window.axios.get(`${suffixV1}integration/hubspot/lists`, params)
        },

        /**
         * Update a contact's Lifecycle Stage in HubSpot
         *
         * @param {string|number} contactId
         * @param {string} lifecycleStage
         * @param {boolean} resetRequired
         * @returns {axios.AxiosResponse<{success: boolean, message: string}>}
         */
        async updateLifecycleStage (contactId, lifecycleStage, resetRequired = false) {
          let response = null
          try {
            response = await window.axios.patch(`${suffixV1}integrations/hubspot/lifecycle-stage`, {
              contact_id: contactId,
              lifecycle_stage: lifecycleStage,
              reset_required: resetRequired
            })
          } catch (error) {
            response = error.response
          }

          return response
        }
      },

      /**
       * Get the available lifecycle stages
       *
       * @returns Promise<axios.AxiosResponse<{success: boolean, data: {lifecycle_stages: Object, can_update_lifecycle_stages: boolean}}>>
       */
      async getLifecycleStages () {
        return window.axios.get(`${suffixV1}integrations/hubspot/jit-card/lifecycle-stages`)
      },

      /**
       * Get the company association of the contact
       *
       * @param contactId
       * @returns Promise<axios.AxiosResponse<{success: boolean, data: object>>
       */
      getContactCompanyAssociation (contactId) {
        return window.axios.get(`${suffixV1}integrations/hubspot/jit-card/company-association/${contactId}`)
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
      },

      getCompanyAccesses () {
        return window.axios.get('/api/v1/user/company/accesses')
      }
    },

    reports: {
      communications: {
        get (params) {
          return window.axios.get(`${suffixV1}reports/communications`, params)
        },

        getCount (params) {
          return window.axios.get(`${process.env.API_REPORTING_URL}${suffixV1}reports/communications/count`, params)
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

      async agentForceTerminate (id, params = {}) {
        return window.axios.post(`${suffixV1}agent/communication/${id}/terminate`, params)
      },

      forceDequeue (id) {
        return window.axios.post(`${suffixV1}communication/${id}/force-dequeue`)
      },

      get (id, params = {}) {
        return window.axios.get(`${suffixV1}communication/${id}`, { params })
      },

      delete (id) {
        return window.axios.delete(`${suffixV1}communication/${id}`)
      },

      reportIssue (id, data) {
        return window.axios.post(`${suffixV1}communications/${id}/report-issue`, data)
      },

      askQuestion (communicationId, params) {
        if (!communicationId) {
          return null
        }

        return window.axios.get(`${suffixV1}communication/${communicationId}/transcription/ask`, params)
      }
    },

    transcription: {
      submitSummaryFeedback (communicationId, feedbackType) {
        return window.axios.post(`${suffixV1}transcription/${communicationId}/summary-feedback`, { feedback: feedbackType })
      },

      fetchSmartTranscriptionData (communicationId, options) {
        return window.axios.get(`${suffixV1}transcription/communication/${communicationId}`, options)
      },

      // Generate transcription for the communication
      generateTranscription (communicationId) {
        return window.axios.post(`${suffixV1}transcription/communication/${communicationId}`)
      },

      // Generate summary for the transcription
      generateSummary (communicationId) {
        return window.axios.post(
          `${suffixV1}transcription/communication/${communicationId}/generate-summary`
        )
      },

      // Update transcription summary
      updateSummary (communicationId, summary) {
        return window.axios.post(
          `${suffixV1}transcription/${communicationId}/update-summary`,
          { summary }
        )
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
    carrierFees: {
      get () {
        return window.axios.get(`${suffixV1}carrier-fees`)
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
    },

    dialer: {
      sendVmDrop (params) {
        return window.axios.post(`${suffixV1}dialer/play-prerecorded-voicemail`, params)
      }
    },

    accountRegistration: {
      getPreSignupDetails (params) {
        return window.axios.get(`/api/admin/company-registration/pre-signup-prefill/${params.verification_token}`)
      },

      getSSUData () {
        return window.axios.get(`/api/v1/company/ssu/get`)
      },

      save (payload) {
        return window.axios.post('/api/admin/company-registration', payload)
      },

      update (params, payload) {
        return window.axios.patch(`/api/admin/company-registration/${params.preSignupId}`, payload)
      }
    },

    company: {
      get (params) {
        return window.axios.get(`${suffixV1}company/${params.id}`)
      },

      /**
       * Endpoint for fetching agents status.
       * params parameter is used to paginate the data that will be fetch
       * @handler Api/V1/CompanyController@getAgentsStatus
       * @return Promise
       */
      getAgentsStatus () {
        return window.axios.get(`${suffixV1}company/agents-status/get`)
      }
    },

    communicationScript: {
      store (params) {
        return window.axios.post(`${suffixV1}communication-script`, params)
      }
    },

    auth: {
      impersonate (userId, userAccess = false, user = null) {
        let isImpersonating = true
        let previousUserId = user?.id
        localStorage.removeItem('previous_user_id')
        localStorage.removeItem('impersonate')
        localStorage.removeItem('company_id')
        localStorage.removeItem('current_user_id')

        if (userAccess) {
          isImpersonating = false
        }

        return window.axios.post(`${suffixV1}user/${userId}/impersonate`, {
          is_impersonated: isImpersonating
        }).then((res) => {
          localStorage.setItem('api_token', res.data.api_token)
          window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + localStorage.getItem('api_token')

          if (isImpersonating) {
            localStorage.setItem('impersonate', true)
            localStorage.setItem('previous_user_id', previousUserId)
          }

          localStorage.setItem('company_id', res.data.company_id)
          localStorage.setItem('current_user_id', res.data.user_id)
        }).catch((err) => {
          return Promise.reject(err)
        })
      }
    },

    importWizard: {
      parseUrl: `${suffixV1}import-wizard/parse`,

      analyze (headers, ignoreFirstRow, importId) {
        return window.axios.post(`${suffixV1}import-wizard/analyze`, {
          headers,
          ignore_first_row: ignoreFirstRow,
          import_id: importId
        })
      },

      startImport (importId, data) {
        return window.axios.post(`${suffixV1}import-wizard/${importId}/start`, data)
      }
    }
  },

  V2: {
    contact: {
      getConversationSummary (contactId, params) {
        if (!contactId) {
          return null
        }

        return window.axios.get(`/api/v2/contacts/${contactId}/conversation-summary`, params)
      },

      askQuestion (contactId, params) {
        if (!contactId) {
          return null
        }

        return window.axios.get(`/api/v2/contacts/${contactId}/conversation-summary/ask`, params)
      },

      getTextMessageSuggestions (contactId, params) {
        if (!contactId) {
          return window.axios.get(`/api/v2/contacts/text-message-suggestions`, params)
        }

        return window.axios.get(`/api/v2/contacts/${contactId}/text-message-suggestions`, params)
      }
    },

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

        delete params.timezone

        return window.axios.get(`/api/v2/contacts`, { params, paramsSerializer: qs.stringify, cancelToken: cancelTokenSource })
      },

      counts (params, cancelTokenSource) {
        delete params.timezone

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
      },

      removeContactFromList (id, body = {}) {
        return window.axios.post(`${suffixV2}contacts/${id}/remove-from-lists`, body)
      },

      exportCommunications
    },

    contactFolders: {
      list (params) {
        return window.axios.get(`${suffixV2}contact-folders`, { params })
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

    contactsList: {
      assignContactsTo (contactListId, payload = {}) {
        const params = {
          assign_to: payload.assign_contacts_to,
          id: payload.assign_contacts_to === 'ring_group' ? payload.ring_group_id : payload.user_id,
          force: payload.force,
          from_talk: true
        }
        return window.axios.post(`${suffixV2}contacts-list/${contactListId}/assign`, params)
      },

      splitListIntoSmallerLists (contactListId, params) {
        return window.axios.post(`${suffixV2}contacts-list/${contactListId}/split`, params)
      },

      changeOwner (contactListId, userId) {
        const params = {
          user_id: userId
        }
        return window.axios.patch(`${suffixV2}contacts-list/${contactListId}/change-owner`, params)
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
      salesforce: {
        importList (target, params) {
          return window.axios.post(`${suffixV2}contacts-list/import-salesforce-list/${target}`, params)
        },
        listExists (target) {
          return window.axios.get(`${suffixV2}contacts-list/salesforce-list-exists/${target}`)
        }
      },
      hubspot: {
        importList (target, params) {
          return window.axios.post(`${suffixV2}contacts-list/import-hubspot-list/${target}`, params)
        },
        listExists (target) {
          return window.axios.get(`${suffixV2}contacts-list/hubspot-list-exists/${target}`)
        },
        importListToPowerDialer (target, params) {
          return window.axios.post(`${suffixV2}power-dialer-lists/import-hubspot-list/${target}`, params)
        }
      },

      zoho: {
        importView (target, params) {
          return window.axios.post(`${suffixV2}contacts-list/import-zoho-view/${target}`, params)
        },
        viewExists (target) {
          return window.axios.get(`${suffixV2}contacts-list/zoho-view-exists/${target}`)
        },
        importViewToPowerDialer (target, params) {
          return window.axios.post(`${suffixV2}power-dialer-lists/import-zoho-view/${target}`, params)
        }
      },

      pipedrive: {
        importFilter (target, params) {
          return window.axios.post(`${suffixV2}contacts-list/import-pipedrive-filter/${target}`, params)
        },
        filterExists (target) {
          return window.axios.get(`${suffixV2}contacts-list/pipedrive-filter-exists/${target}`)
        },
        importFilterToPowerDialer (target, params) {
          return window.axios.post(`${suffixV2}power-dialer-lists/import-pipedrive-filter/${target}`, params)
        }
      }

    },

    contactList: {
      get (params) {
        return window.axios.get(`${suffixV2}contacts-list`, { params })
      },
      public (params) {
        return window.axios.get(`${suffixV2}contacts-list/public`, { params })
      },
      async update (id, params) {
        return window.axios.put(`${suffixV2}contacts-list/${id}`, params)
      },
      delete (id, params) {
        return window.axios.delete(`${suffixV2}contacts-list/${id}`, { params })
      }
    },

    filters: {
      get (tags = false) {
        if (!tags) {
          // Request for filters without tags as options
          const params = { exclude_tags: true }
          return window.axios.get(`${suffixV2}contacts/filters`, { params })
        }
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
      },

      inboxes: {
        async get (data) {
          return window.axios.get(`${suffixV2}inboxes`, data)
        },

        unreadCount (inboxIds, contactIds = null, filters) {
          const params = {
            inbox_ids: inboxIds
          }

          if (contactIds) {
            params.contact_ids = contactIds
          }

          if (filters?.from_date) {
            params.from_date = filters.from_date
          }

          if (filters?.to_date) {
            params.to_date = filters.to_date
          }

          return window.axios.post(`${suffixV2}inboxes/unread-count`, params)
        }
      }
    },

    users: {
      get (params) {
        return window.axios.get(`${suffixV2}users`, { params })
      }
    },

    aloAiBot: {
      getBots (params = {}) {
        // Convert params to query string
        if (params.direction) {
          params.direction = params.direction === AloAi.DIRECTION_OUTBOUND ? 'outbound' : 'inbound'
        }

        if (params.type) {
          params.type = params.type === AloAi.TYPE_TEXT ? 'text' : 'voice'
        }
        return window.axios.get(`${suffixV1}aloai/bot`, { params })
      },
      getContactDisengagedBots (contactId) {
        return window.axios.get(`${suffixV1}aloai/contacts/${contactId}/disengaged-bots`)
      },
      getContactBotEnrollments (contactId) {
        return window.axios.get(`${suffixV1}aloai/contacts/${contactId}/enrollments`)
      },
      updateContactEngagements (contactId, engagements) {
        return window.axios.post(`${suffixV1}aloai/contacts/${contactId}/engagement-status`, { engagements })
      },
      enrollContacts (botId, params) {
        return window.axios.post(`${suffixV1}aloai/bot/${botId}/enroll-contacts`, params)
      },
      disenrollContact (botId, params) {
        return window.axios.post(`${suffixV1}aloai/bot/${botId}/disenroll-contact`, params)
      }
    },

    companies: {
      toggleFeature (companyId, feature) {
        return window.axios.put(`${suffixV2}companies/${companyId}/features/${feature}`)
      }
    }
  }
}

export default talk2Api
