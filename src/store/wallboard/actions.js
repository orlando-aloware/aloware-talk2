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

      // const res = await API.V1.contactCenter.liveCalls.get({
      //   ring_group_id: state.filters.ringGroup
      // })
      const res = {}
      res.data = [
        {
          'id': 179953,
          'company_id': 7,
          'campaign_id': 722,
          'ring_group_id': 295,
          'owner_id': 867,
          'workflow_id': null,
          'broadcast_id': null,
          'creator_type': 1,
          'incoming_number_id': 2607,
          'incoming_number': '+19088698680',
          'contact_id': 261777,
          'call_disposition_id': 12,
          'lead_number': '+18183925284',
          'target_users': [
            [
              866
            ]
          ],
          'attempt': 1,
          'attempting_users': [
            866
          ],
          'user_id': 866,
          'destination_number': 'client:agent866',
          'transfer_prior_user_ids': null,
          'transfer_target_user_ids': null,
          'in_cold_transfer': false,
          'direction': 1,
          'type': 1,
          'is_read': true,
          'recorded_file_is_migrated': false,
          'voicemail_is_migrated': false,
          'voicemail_duration': null,
          'legc_uuid': null,
          'legc_status': null,
          'first_time_caller': 1,
          'body': '',
          'attachments': null,
          'conference_status2': 1,
          'current_status2': 8,
          'disposition_status2': 1,
          'resolution2': 1,
          'callback_status': null,
          'transfer_type': null,
          'rejected_by_app': 0,
          'duration': 30,
          'talk_time': 10,
          'wait_time': 20,
          'csat_score': 0,
          'notes': null,
          'country': 'US',
          'state': 'CA',
          'city': 'N HOLLYWOOD',
          'engagement_data': {},
          'created_at': '2023-03-28 18:33:06',
          'has_recording': false,
          'has_voicemail': false,
          'is_introduce': false,
          'added_user_id': null,
          'last_call_source': null,
          'has_transcription': false,
          'tags': [],
          'user': {
            'name': 'Keanu Reaves'
          },
          'contact': {
            'id': 261777,
            'company_id': 7,
            'user_id': 774,
            'initial_campaign_id': 505,
            'disposition_status_id': 12404,
            'lead_source_id': 3,
            'intake_source': 'pipedrive',
            'phone_number': '+18183925284',
            'company_name': 'Test',
            'email': null,
            'first_name': 'Aloware Contact',
            'last_name': '(+18183925284)',
            'timezone': 'America/Sao_Paulo',
            'external_data': null,
            'csf1': null,
            'csf2': null,
            'unread_count': 0,
            'cnam_source': 'Jonathan\'s Test Outside 2',
            'cnam_city': 'N HOLLYWOOD',
            'cnam_state': 'CA',
            'cnam_zipcode': '91325',
            'cnam_country': 'US',
            'address': null,
            'website': null,
            'notes': null,
            'date_of_birth': null,
            'last_engagement_at': '2023-03-28 18:33:06',
            'last_engagement_text': '↙ Call.',
            'nb_communications': 541,
            'inbound_call_count': 384,
            'outbound_call_count': 36,
            'inbound_sms_count': 36,
            'outbound_sms_count': 83,
            'unread_voicemail_count': 0,
            'unread_missed_call_count': 0,
            'lrn_type': 2,
            'is_blocked': false,
            'is_dnc': false,
            'uuid_v4': 'be3e8773-6328-41f8-b2fa-2c1cf7370db0',
            'text_authorized': 0,
            'text_authorized_at': null,
            'created_at': '2022-04-18 22:49:02',
            'name': 'Aloware Contact (+18183925284)',
            'campaign_ids': [
              697,
              411,
              722,
              505,
              721,
              490,
              516,
              723,
              381,
              710,
              497
            ],
            'lead_source': 'Google-PPC',
            'integration_data': null,
            'custom_link': null,
            'workflow_id': null,
            'sequence_id': null,
            'tags': [
              {
                'id': 2292,
                'company_id': 7,
                'category': 1,
                'type': 1,
                'name': '100 Contacts page-1',
                'description': null,
                'color': '#409EFF',
                'created_at': '2021-11-09 20:57:27',
                'updated_at': '2021-11-09 20:57:27'
              },
              {
                'id': 2756,
                'company_id': 7,
                'category': 1,
                'type': 3,
                'name': 'Pipedrive custom filter: Power Dialer Filter - PipeDrive Integration',
                'description': null,
                'color': '#BB2762',
                'created_at': '2022-04-22 19:26:42',
                'updated_at': '2022-05-06 20:51:34'
              },
              {
                'id': 3009,
                'company_id': 7,
                'category': 1,
                'type': 3,
                'name': 'Pipedrive Extensions: Basic Action Apr 30, 2022 2:06 AM',
                'description': 'Auto-generated from Pipedrive',
                'color': '#101010',
                'created_at': '2022-04-29 18:13:54',
                'updated_at': '2022-04-29 18:13:54'
              },
              {
                'id': 3010,
                'company_id': 7,
                'category': 1,
                'type': 3,
                'name': 'Pipedrive Extensions: Basic Action Apr 30, 2022 2:07 AM',
                'description': 'Auto-generated from Pipedrive',
                'color': '#101010',
                'created_at': '2022-04-29 18:13:57',
                'updated_at': '2022-04-29 18:13:57'
              },
              {
                'id': 3168,
                'company_id': 7,
                'category': 1,
                'type': 3,
                'name': 'HubSpot list: Josiah\'s Contacts',
                'description': null,
                'color': '#036189',
                'created_at': '2022-10-25 15:53:01',
                'updated_at': '2022-10-26 22:57:25'
              },
              {
                'id': 3143,
                'company_id': 7,
                'category': 1,
                'type': 1,
                'name': 'Jonathan\'s Tag',
                'description': 'Test purposes',
                'color': 'rgb(0, 125, 255)',
                'created_at': '2022-09-08 16:13:45',
                'updated_at': '2022-09-08 16:13:45'
              }
            ]
          }
        }
      ]

      commit('SET_LIVE_CALLS', res.data)
      commit('SET_LIVE_CALLS_LOADING', false)
    } catch (err) {
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

  /**
   * Update filter value
   */
  setFilter ({ commit }, { filter, value }) {
    commit('SET_FILTER', { filter, value })
  },

  /**
   * Change view mode
   */
  setViewMode ({ commit }, mode) {
    if (!['compact', 'comfort'].includes(mode)) {
      throw new Error('Invalid mode!')
    }

    commit('SET_VIEW_MODE', mode)
  }
}
