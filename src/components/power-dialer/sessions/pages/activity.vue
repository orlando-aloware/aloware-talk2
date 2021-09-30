<template>
  <div class="row">
    <div class="col-12 p-1">
      <!-- <q-card flat class="p-3">
        <q-card-section class="p-0">
          <div class="text-subtitle1 text-weight-medium">Juan Dela Cruz</div>
        </q-card-section>
      </q-card> -->
      <div :class="`contact-activity-wrapper ${widthClass}`">
        <ContactActivities
          ref="contactActivities"
          :communications="communications"
          :campaign-id="selectedId"
          @mark-all-as-read="markAllAsRead">
          <template v-slot:moreActivities>
            fd
          </template>
        </ContactActivities>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'
import contactMixins from 'src/plugins/mixins/contact.mixin'
import ContactActivities from 'src/components/contacts/contact-activities'

export default {
  name: 'SessionPageActivity',
  components: {
    ContactActivities
  },
  mixins: [
    contactMixins
  ],
  mounted () {
    this.setContact(this.contact2)
    this.setSelectedContact(this.contact2)
    if (this.authenticated) {
      this.fetchContact()
    }
  },
  computed: {
    ...mapGetters('auth', ['authenticated']),
    widthClass () {
      if (this.isInbox) {
        return 'w-less-330px'
      }
      return '500px'
      // !this.isSidebarCollapsed ? 'w-less-630px' : 'w-less-345px'
    }
  },
  methods: {
    ...mapActions('inbox', [
      'setContact',
      'setContacts',
      'setSelectedContact'
    ]),
    ...mapActions('contacts', [
      'resetChangedContactProperties',
      'selectedContactChanging',
      'setContact',
      'setContactClone'
    ]),
    fetchContact () {
      this.selectedContactChanging(true)
      let _this = this
      console.log('this.selectedContact :>> ', this.selectedContact)
      if (this.selectedContact?.id) {
        this.processFetchContactInfo(function (selectedContact) {
          _this.setContact(selectedContact)
          _this.setContactClone(selectedContact)
          _this.resetChangedContactProperties([])
          _this.selectedContactChanging(false)
        })
      }
    },
    markAllAsRead2 () {
      console.log('888 :>> ', 888)
    }
  },
  data () {
    return {
      selectedContact: {
        'id': 237587,
        'company_id': 7,
        'first_name': null,
        'last_name': null,
        'phone_number': '+13046355799',
        'email': null,
        'created_at': '2021-09-30 14:04:25',
        'updated_at': '2021-09-30 14:04:42',
        'date_of_birth': null,
        'text_authorized_at': null,
        'address': null,
        'cnam_state': 'WV',
        'cnam_city': 'ELKINS',
        'cnam_zipcode': '26254',
        'cnam_country': 'US',
        'timezone': 'America/New_York',
        'website': null,
        'company_name': null,
        'intake_source': 'voip-call',
        'initial_campaign_id': 541,
        'lead_source_id': null,
        'user_id': null,
        'disposition_status_id': null,
        'is_dnc': false,
        'unread_count': 0,
        'unread_voicemail_count': 1,
        'unread_missed_call_count': 0,
        'notes': null,
        'csf1': null,
        'csf2': null,
        'uuid_v4': 'b7c89725-f5f1-45c8-bd35-2a6333c52972',
        'name': '',
        'communications_count': 1,
        'inbound_communications_count': 1,
        'outbound_communications_count': 0,
        'outbound_texts_count': 0,
        'inbound_texts_count': 0,
        'outbound_calls_count': 0,
        'inbound_calls_count': 1,
        'last_outbound_engagement_at': null,
        'last_inbound_engagement_at': '2021-09-30 14:04:26',
        'last_engagement_at': '2021-09-30 14:04:26',
        'unread_texts_count': 0,
        'unread_voicemails_count': 0,
        'unread_missed_calls_count': 0,
        'task_status': 2,
        'task_status_name': 'Open',
        'integrations': {
          'hubspot': {
            'contact_id': '224251',
            'link': 'https://app.hubspot.com/contacts/8446098/contact/224251',
            'data': {
              'vid': 224251,
              'canonical-vid': 224251,
              'merged-vids': [],
              'portal-id': 8446098,
              'is-contact': true,
              'properties': {
                'zip': {
                  'value': '26254',
                  'versions': [
                    {
                      'value': '26254',
                      'source-type': 'INTEGRATION',
                      'source-id': '185969',
                      'source-label': null,
                      'updated-by-user-id': null,
                      'timestamp': 1633010668032,
                      'selected': false
                    }
                  ]
                },
                'country': {
                  'value': 'US',
                  'versions': [
                    {
                      'value': 'US',
                      'source-type': 'INTEGRATION',
                      'source-id': '185969',
                      'source-label': null,
                      'updated-by-user-id': null,
                      'timestamp': 1633010668032,
                      'selected': false
                    }
                  ]
                },
                'firstname': {
                  'value': 'Aloware Contact',
                  'versions': [
                    {
                      'value': 'Aloware Contact',
                      'source-type': 'INTEGRATION',
                      'source-id': '185969',
                      'source-label': null,
                      'updated-by-user-id': null,
                      'timestamp': 1633010668032,
                      'selected': false
                    }
                  ]
                },
                'phone': {
                  'value': '+13046355799',
                  'versions': [
                    {
                      'value': '+13046355799',
                      'source-type': 'INTEGRATION',
                      'source-id': '185969',
                      'source-label': null,
                      'updated-by-user-id': null,
                      'timestamp': 1633010668032,
                      'selected': false
                    }
                  ]
                },
                'city': {
                  'value': 'ELKINS',
                  'versions': [
                    {
                      'value': 'ELKINS',
                      'source-type': 'INTEGRATION',
                      'source-id': '185969',
                      'source-label': null,
                      'updated-by-user-id': null,
                      'timestamp': 1633010668032,
                      'selected': false
                    }
                  ]
                },
                'lastmodifieddate': {
                  'value': '1633010679161',
                  'versions': [
                    {
                      'value': '1633010679161',
                      'source-type': 'CALCULATED',
                      'source-id': null,
                      'source-label': null,
                      'updated-by-user-id': null,
                      'timestamp': 1633010679161,
                      'selected': false
                    }
                  ]
                },
                'state': {
                  'value': 'WV',
                  'versions': [
                    {
                      'value': 'WV',
                      'source-type': 'INTEGRATION',
                      'source-id': '185969',
                      'source-label': null,
                      'updated-by-user-id': null,
                      'timestamp': 1633010668032,
                      'selected': false
                    }
                  ]
                },
                'hs_calculated_phone_number': {
                  'value': '+13046355799',
                  'versions': [
                    {
                      'value': '+13046355799',
                      'source-type': 'CALCULATED',
                      'source-id': null,
                      'source-label': null,
                      'updated-by-user-id': null,
                      'timestamp': 1633010668042,
                      'selected': false
                    }
                  ]
                },
                'lastname': {
                  'value': '(+13046355799)',
                  'versions': [
                    {
                      'value': '(+13046355799)',
                      'source-type': 'INTEGRATION',
                      'source-id': '185969',
                      'source-label': null,
                      'updated-by-user-id': null,
                      'timestamp': 1633010668032,
                      'selected': false
                    }
                  ]
                },
                'deals': []
              },
              'form-submissions': [],
              'list-memberships': [
                {
                  'static-list-id': 71,
                  'internal-list-id': 115,
                  'timestamp': 1633010691797,
                  'vid': 224251,
                  'is-member': true
                },
                {
                  'static-list-id': 72,
                  'internal-list-id': 77,
                  'timestamp': 1633010691797,
                  'vid': 224251,
                  'is-member': true
                },
                {
                  'static-list-id': 107,
                  'internal-list-id': 112,
                  'timestamp': 1633010717536,
                  'vid': 224251,
                  'is-member': true
                }
              ],
              'identity-profiles': [
                {
                  'vid': 224251,
                  'saved-at-timestamp': 1633010668079,
                  'deleted-changed-timestamp': 0,
                  'identities': [
                    {
                      'type': 'LEAD_GUID',
                      'value': '7b76791f-d1b8-49da-839d-157462a903b8',
                      'timestamp': 1633010668074
                    }
                  ]
                }
              ],
              'merge-audits': []
            }
          }
        },
        'phone_numbers': [
          {
            'id': 243676,
            'company_id': 7,
            'contact_id': 237587,
            'phone_number': '+13046355799',
            'title': '',
            'cnam_source': null,
            'cnam_city': 'ELKINS',
            'cnam_state': 'WV',
            'cnam_zipcode': '26254',
            'cnam_country': 'US',
            'lrn_type': 0,
            'created_at': '2021-09-30 14:04:26'
          }
        ],
        'lead_source': null,
        'broadcasts': [],
        'user': null,
        'disposition_status': null,
        'campaigns': [
          {
            'id': 541,
            'name': '+19893751545',
            'pivot': {
              'contact_id': 237587,
              'campaign_id': 541
            }
          }
        ],
        'initial_campaign': {
          'id': 541,
          'name': '+19893751545'
        },
        'contact_lists': [],
        'ring_groups': [],
        'tags': [],
        'workflow': null,
        'sequence': null,
        'first_communication': {
          'id': 48601,
          'company_id': 7,
          'campaign_id': 541,
          'ring_group_id': null,
          'owner_id': null,
          'workflow_id': null,
          'sequence_id': null,
          'broadcast_id': null,
          'creator_type': null,
          'incoming_number_id': 2068,
          'incoming_number': '+19893751545',
          'incoming_sip_uri': null,
          'contact_id': 237587,
          'call_disposition_id': null,
          'lead_number': '+13046355799',
          'is_international': false,
          'target_users': null,
          'attempt': null,
          'attempting_users': null,
          'user_id': null,
          'destination_number': null,
          'transfer_prior_user_ids': null,
          'transferred_from': null,
          'transfer_target_user_ids': null,
          'transferred_to': null,
          'in_cold_transfer': false,
          'proxy_number_id': null,
          'forward_sid': null,
          'direction': 1,
          'type': 1,
          'call_router_behavior': 3,
          'is_read': false,
          'recording_url': null,
          'recorded_file_is_migrated': false,
          'voicemail_url': 'https://app.alodev.org/static/uploaded_file/52ccb661-a70a-4ac7-bbcf-43fd46367c50',
          'voicemail_is_migrated': true,
          'voicemail_duration': 5,
          'sid': 'CA30616e2a067d59e67bac220d080bcef8',
          'customer_leg_sid': 'CA30616e2a067d59e67bac220d080bcef8',
          'customer_leg_status': 6,
          'agent_leg_sid': null,
          'agent_leg_status': null,
          'legc_uuid': null,
          'legc_status': null,
          'legz_uuid': null,
          'legz_status': null,
          'conference_sid': null,
          'first_time_caller': 1,
          'body': '',
          'attachments': null,
          'conference_status': null,
          'conference_status2': null,
          'current_status': 'completed',
          'current_status2': 9,
          'disposition_status': 'dead-end',
          'disposition_status2': 6,
          'resolution': 'voicemail',
          'resolution2': 3,
          'queue_resolution': null,
          'queue_resolution2': null,
          'callback_status': null,
          'transfer_type': null,
          'rejected_by_app': 0,
          'duration': 21,
          'hold_time': 0,
          'talk_time': 0,
          'wait_time': 21,
          'csat_score': 0,
          'provider_cost': '0.000000',
          'notes': 'Sys (07:04am PDT): Routed to line voicemail\nSystem: Dead end call.\n',
          'country': 'US',
          'state': 'WV',
          'city': 'ELKINS',
          'customer_leg_called_at': '2021-09-30 14:04:25',
          'customer_leg_transferred_at': '2021-09-30 14:04:25',
          'customer_leg_hangup_at': '2021-09-30 14:04:48',
          'agent_leg_called_at': null,
          'agent_leg_transferred_at': null,
          'agent_leg_hangup_at': null,
          'conference_start_at': null,
          'conference_end_at': null,
          'hold_at': null,
          'should_broadcast': true,
          'metadata': {
            'callback_asked_at': [
                
            ],
            'asked_for_callback': false,
            'requested_callback': false,
            'voicemail_asked_at': [
                
            ],
            'asked_for_voicemail': false,
            'authorized_for_text': false,
            'requested_voicemail': false,
            'user_replied_digits': {
              'callback': null,
              'voicemail': null,
              'handle_by_text': null,
              'text_authorization': null
            },
            'handle_by_text_asked_at': [
                
            ],
            'asked_for_handle_by_text': false,
            'requested_handle_by_text': false,
            'text_authorization_asked_at': null,
            'asked_for_text_authorization': false
          },
          'engagement_data': null,
          'created_at': '2021-09-30 14:04:26',
          'updated_at': '2021-09-30 14:05:06',
          'deleted_at': null,
          'is_migrated': 0
        },
        'last_communication': {
          'id': 48601,
          'company_id': 7,
          'campaign_id': 541,
          'ring_group_id': null,
          'owner_id': null,
          'workflow_id': null,
          'sequence_id': null,
          'broadcast_id': null,
          'creator_type': null,
          'incoming_number_id': 2068,
          'incoming_number': '+19893751545',
          'incoming_sip_uri': null,
          'contact_id': 237587,
          'call_disposition_id': null,
          'lead_number': '+13046355799',
          'is_international': false,
          'target_users': null,
          'attempt': null,
          'attempting_users': null,
          'user_id': null,
          'destination_number': null,
          'transfer_prior_user_ids': null,
          'transferred_from': null,
          'transfer_target_user_ids': null,
          'transferred_to': null,
          'in_cold_transfer': false,
          'proxy_number_id': null,
          'forward_sid': null,
          'direction': 1,
          'type': 1,
          'call_router_behavior': 3,
          'is_read': false,
          'recording_url': null,
          'recorded_file_is_migrated': false,
          'voicemail_url': 'https://app.alodev.org/static/uploaded_file/52ccb661-a70a-4ac7-bbcf-43fd46367c50',
          'voicemail_is_migrated': true,
          'voicemail_duration': 5,
          'sid': 'CA30616e2a067d59e67bac220d080bcef8',
          'customer_leg_sid': 'CA30616e2a067d59e67bac220d080bcef8',
          'customer_leg_status': 6,
          'agent_leg_sid': null,
          'agent_leg_status': null,
          'legc_uuid': null,
          'legc_status': null,
          'legz_uuid': null,
          'legz_status': null,
          'conference_sid': null,
          'first_time_caller': 1,
          'body': '',
          'attachments': null,
          'conference_status': null,
          'conference_status2': null,
          'current_status': 'completed',
          'current_status2': 9,
          'disposition_status': 'dead-end',
          'disposition_status2': 6,
          'resolution': 'voicemail',
          'resolution2': 3,
          'queue_resolution': null,
          'queue_resolution2': null,
          'callback_status': null,
          'transfer_type': null,
          'rejected_by_app': 0,
          'duration': 21,
          'hold_time': 0,
          'talk_time': 0,
          'wait_time': 21,
          'csat_score': 0,
          'provider_cost': '0.000000',
          'notes': 'Sys (07:04am PDT): Routed to line voicemail\nSystem: Dead end call.\n',
          'country': 'US',
          'state': 'WV',
          'city': 'ELKINS',
          'customer_leg_called_at': '2021-09-30 14:04:25',
          'customer_leg_transferred_at': '2021-09-30 14:04:25',
          'customer_leg_hangup_at': '2021-09-30 14:04:48',
          'agent_leg_called_at': null,
          'agent_leg_transferred_at': null,
          'agent_leg_hangup_at': null,
          'conference_start_at': null,
          'conference_end_at': null,
          'hold_at': null,
          'should_broadcast': true,
          'metadata': {
            'callback_asked_at': [
                
            ],
            'asked_for_callback': false,
            'requested_callback': false,
            'voicemail_asked_at': [
                
            ],
            'asked_for_voicemail': false,
            'authorized_for_text': false,
            'requested_voicemail': false,
            'user_replied_digits': {
              'callback': null,
              'voicemail': null,
              'handle_by_text': null,
              'text_authorization': null
            },
            'handle_by_text_asked_at': [
                
            ],
            'asked_for_handle_by_text': false,
            'requested_handle_by_text': false,
            'text_authorization_asked_at': null,
            'asked_for_text_authorization': false
          },
          'engagement_data': null,
          'created_at': '2021-09-30 14:04:26',
          'updated_at': '2021-09-30 14:05:06',
          'deleted_at': null,
          'is_migrated': 0
        },
        'external_integration_data': [
          {
            'id': 64589,
            'company_id': 7,
            'model_id': 237587,
            'model_type': 'App\\Models\\Contact',
            'source': 'hubspot',
            'field': 'contact_id',
            'data': '224251',
            'textual_data': null,
            'created_at': '2021-09-30 14:04:28',
            'updated_at': '2021-09-30 14:04:28'
          }
        ],
        'company': {
          'id': 7,
          'name': 'USS Enterprise',
          'hubspot_integration_enabled': true
        },
        'tag_ids': []
      },
      contact2: {
        'id': 210470,
        'company_id': 7,
        'first_name': 'Aloware Contact',
        'last_name': '(+16033166810)',
        'phone_number': '+16033166810',
        'email': null,
        'created_at': '2021-09-29 17:58:41',
        'updated_at': '2021-09-29 17:58:47',
        'date_of_birth': null,
        'text_authorized_at': null,
        'address': null,
        'cnam_state': 'NH',
        'cnam_city': 'Manchester',
        'cnam_zipcode': '03824',
        'cnam_country': 'US',
        'timezone': 'America/New_York',
        'website': null,
        'company_name': null,
        'intake_source': 'hubspot',
        'initial_campaign_id': 542,
        'lead_source_id': null,
        'user_id': null,
        'disposition_status_id': null,
        'is_dnc': false,
        'unread_count': 0,
        'unread_voicemail_count': 0,
        'unread_missed_call_count': 0,
        'notes': null,
        'csf1': null,
        'csf2': null,
        'uuid_v4': '9deaee2c-b074-4444-a832-abcb2333487f',
        'name': 'Aloware Contact (+16033166810)',
        'communications_count': 1,
        'inbound_communications_count': 1,
        'outbound_communications_count': 0,
        'outbound_texts_count': 0,
        'inbound_texts_count': 0,
        'outbound_calls_count': 0,
        'inbound_calls_count': 1,
        'last_outbound_engagement_at': null,
        'last_inbound_engagement_at': '2021-09-29 17:58:43',
        'last_engagement_at': '2021-09-29 17:58:43',
        'unread_texts_count': 0,
        'unread_voicemails_count': 0,
        'unread_missed_calls_count': 0,
        'task_status': 1,
        'task_status_name': 'New',
        'integrations': {
          'hubspot': {
            'contact_id': '219601',
            'link': 'https://app.hubspot.com/contacts/8446098/contact/219601',
            'data': {
              'vid': 219601,
              'canonical-vid': 219601,
              'merged-vids': [],
              'portal-id': 8446098,
              'is-contact': true,
              'properties': {
                'zip': {
                  'value': '03824',
                  'versions': [
                    {
                      'value': '03824',
                      'source-type': 'INTEGRATION',
                      'source-id': '185969',
                      'source-label': null,
                      'updated-by-user-id': null,
                      'timestamp': 1632938311350,
                      'selected': false
                    }
                  ]
                },
                'country': {
                  'value': 'US',
                  'versions': [
                    {
                      'value': 'US',
                      'source-type': 'INTEGRATION',
                      'source-id': '185969',
                      'source-label': null,
                      'updated-by-user-id': null,
                      'timestamp': 1632938311350,
                      'selected': false
                    }
                  ]
                },
                'firstname': {
                  'value': 'Aloware Contact',
                  'versions': [
                    {
                      'value': 'Aloware Contact',
                      'source-type': 'INTEGRATION',
                      'source-id': '185969',
                      'source-label': null,
                      'updated-by-user-id': null,
                      'timestamp': 1632938311350,
                      'selected': false
                    }
                  ]
                },
                'phone': {
                  'value': '+16033166810',
                  'versions': [
                    {
                      'value': '+16033166810',
                      'source-type': 'INTEGRATION',
                      'source-id': '185969',
                      'source-label': null,
                      'updated-by-user-id': null,
                      'timestamp': 1632938311350,
                      'selected': false
                    }
                  ]
                },
                'city': {
                  'value': 'DURHAM',
                  'versions': [
                    {
                      'value': 'DURHAM',
                      'source-type': 'INTEGRATION',
                      'source-id': '185969',
                      'source-label': null,
                      'updated-by-user-id': null,
                      'timestamp': 1632938311350,
                      'selected': false
                    }
                  ]
                },
                'lastmodifieddate': {
                  'value': '1632938358060',
                  'versions': [
                    {
                      'value': '1632938358060',
                      'source-type': 'CALCULATED',
                      'source-id': null,
                      'source-label': null,
                      'updated-by-user-id': null,
                      'timestamp': 1632938358060,
                      'selected': false
                    }
                  ]
                },
                'state': {
                  'value': 'NH',
                  'versions': [
                    {
                      'value': 'NH',
                      'source-type': 'INTEGRATION',
                      'source-id': '185969',
                      'source-label': null,
                      'updated-by-user-id': null,
                      'timestamp': 1632938311350,
                      'selected': false
                    }
                  ]
                },
                'hs_calculated_phone_number': {
                  'value': '+16033166810',
                  'versions': [
                    {
                      'value': '+16033166810',
                      'source-type': 'CALCULATED',
                      'source-id': null,
                      'source-label': null,
                      'updated-by-user-id': null,
                      'timestamp': 1632938311360,
                      'selected': false
                    }
                  ]
                },
                'lastname': {
                  'value': '(+16033166810)',
                  'versions': [
                    {
                      'value': '(+16033166810)',
                      'source-type': 'INTEGRATION',
                      'source-id': '185969',
                      'source-label': null,
                      'updated-by-user-id': null,
                      'timestamp': 1632938311350,
                      'selected': false
                    }
                  ]
                },
                'deals': []
              },
              'form-submissions': [],
              'list-memberships': [
                {
                  'static-list-id': 71,
                  'internal-list-id': 115,
                  'timestamp': 1632938327583,
                  'vid': 219601,
                  'is-member': true
                },
                {
                  'static-list-id': 72,
                  'internal-list-id': 77,
                  'timestamp': 1632938327583,
                  'vid': 219601,
                  'is-member': true
                },
                {
                  'static-list-id': 107,
                  'internal-list-id': 112,
                  'timestamp': 1632938370958,
                  'vid': 219601,
                  'is-member': true
                }
              ],
              'identity-profiles': [
                {
                  'vid': 219601,
                  'saved-at-timestamp': 1632938311415,
                  'deleted-changed-timestamp': 0,
                  'identities': [
                    {
                      'type': 'LEAD_GUID',
                      'value': 'a8fc9782-7e48-43d3-841d-5b2bca3d3b23',
                      'timestamp': 1632938311411
                    }
                  ]
                }
              ],
              'merge-audits': []
            }
          }
        },
        'phone_numbers': [
          {
            'id': 215524,
            'company_id': 7,
            'contact_id': 210470,
            'phone_number': '+16033166810',
            'title': '',
            'cnam_source': 'libgphone',
            'cnam_city': 'DURHAM',
            'cnam_state': 'NH',
            'cnam_zipcode': '03824',
            'cnam_country': 'US',
            'lrn_type': 0,
            'created_at': '2021-09-29 17:58:41'
          },
          {
            'id': 215525,
            'company_id': 7,
            'contact_id': 210470,
            'phone_number': '+17754506234',
            'title': null,
            'cnam_source': 'libgphone',
            'cnam_city': 'Gardnerville',
            'cnam_state': 'NV',
            'cnam_zipcode': null,
            'cnam_country': 'US',
            'lrn_type': 1,
            'created_at': '2021-09-29 18:12:06'
          }
        ],
        'lead_source': null,
        'broadcasts': [],
        'user': null,
        'disposition_status': null,
        'campaigns': [
          {
            'id': 542,
            'name': '+19893751337',
            'pivot': {
              'contact_id': 210470,
              'campaign_id': 542
            }
          }
        ],
        'initial_campaign': {
          'id': 542,
          'name': '+19893751337'
        },
        'contact_lists': [],
        'ring_groups': [],
        'tags': [],
        'workflow': null,
        'sequence': null,
        'first_communication': {
          'id': 48578,
          'company_id': 7,
          'campaign_id': 542,
          'ring_group_id': null,
          'owner_id': null,
          'workflow_id': null,
          'sequence_id': null,
          'broadcast_id': null,
          'creator_type': null,
          'incoming_number_id': 2069,
          'incoming_number': '+19893751337',
          'incoming_sip_uri': null,
          'contact_id': 210470,
          'call_disposition_id': null,
          'lead_number': '+16033166810',
          'is_international': false,
          'target_users': null,
          'attempt': null,
          'attempting_users': null,
          'user_id': null,
          'destination_number': null,
          'transfer_prior_user_ids': null,
          'transferred_from': null,
          'transfer_target_user_ids': null,
          'transferred_to': null,
          'in_cold_transfer': false,
          'proxy_number_id': null,
          'forward_sid': null,
          'direction': 1,
          'type': 1,
          'call_router_behavior': 3,
          'is_read': null,
          'recording_url': null,
          'recorded_file_is_migrated': false,
          'voicemail_url': null,
          'voicemail_is_migrated': false,
          'voicemail_duration': null,
          'sid': 'CA372f93b54d8dd2d01751142817f23784',
          'customer_leg_sid': 'CA372f93b54d8dd2d01751142817f23784',
          'customer_leg_status': 6,
          'agent_leg_sid': null,
          'agent_leg_status': null,
          'legc_uuid': null,
          'legc_status': null,
          'legz_uuid': null,
          'legz_status': null,
          'conference_sid': null,
          'first_time_caller': 1,
          'body': '',
          'attachments': null,
          'conference_status': null,
          'conference_status2': null,
          'current_status': 'completed',
          'current_status2': 9,
          'disposition_status': 'dead-end',
          'disposition_status2': 6,
          'resolution': 'voicemail',
          'resolution2': 3,
          'queue_resolution': null,
          'queue_resolution2': null,
          'callback_status': null,
          'transfer_type': null,
          'rejected_by_app': 0,
          'duration': 10,
          'hold_time': 0,
          'talk_time': 0,
          'wait_time': 10,
          'csat_score': 0,
          'provider_cost': '0.000000',
          'notes': 'Sys (10:58am PDT): Routed to line voicemail\nSystem: Dead end call.\n',
          'country': 'US',
          'state': 'NH',
          'city': 'DURHAM',
          'customer_leg_called_at': '2021-09-29 17:58:43',
          'customer_leg_transferred_at': '2021-09-29 17:58:43',
          'customer_leg_hangup_at': '2021-09-29 17:58:55',
          'agent_leg_called_at': null,
          'agent_leg_transferred_at': null,
          'agent_leg_hangup_at': null,
          'conference_start_at': null,
          'conference_end_at': null,
          'hold_at': null,
          'should_broadcast': true,
          'metadata': {
            'callback_asked_at': [],
            'asked_for_callback': false,
            'requested_callback': false,
            'voicemail_asked_at': [],
            'asked_for_voicemail': false,
            'authorized_for_text': false,
            'requested_voicemail': false,
            'user_replied_digits': {
              'callback': null,
              'voicemail': null,
              'handle_by_text': null,
              'text_authorization': null
            },
            'handle_by_text_asked_at': [],
            'asked_for_handle_by_text': false,
            'requested_handle_by_text': false,
            'text_authorization_asked_at': null,
            'asked_for_text_authorization': false
          },
          'engagement_data': null,
          'created_at': '2021-09-29 17:58:43',
          'updated_at': '2021-09-29 17:58:55',
          'deleted_at': null,
          'is_migrated': 0
        },
        'last_communication': {
          'id': 48578,
          'company_id': 7,
          'campaign_id': 542,
          'ring_group_id': null,
          'owner_id': null,
          'workflow_id': null,
          'sequence_id': null,
          'broadcast_id': null,
          'creator_type': null,
          'incoming_number_id': 2069,
          'incoming_number': '+19893751337',
          'incoming_sip_uri': null,
          'contact_id': 210470,
          'call_disposition_id': null,
          'lead_number': '+16033166810',
          'is_international': false,
          'target_users': null,
          'attempt': null,
          'attempting_users': null,
          'user_id': null,
          'destination_number': null,
          'transfer_prior_user_ids': null,
          'transferred_from': null,
          'transfer_target_user_ids': null,
          'transferred_to': null,
          'in_cold_transfer': false,
          'proxy_number_id': null,
          'forward_sid': null,
          'direction': 1,
          'type': 1,
          'call_router_behavior': 3,
          'is_read': null,
          'recording_url': null,
          'recorded_file_is_migrated': false,
          'voicemail_url': null,
          'voicemail_is_migrated': false,
          'voicemail_duration': null,
          'sid': 'CA372f93b54d8dd2d01751142817f23784',
          'customer_leg_sid': 'CA372f93b54d8dd2d01751142817f23784',
          'customer_leg_status': 6,
          'agent_leg_sid': null,
          'agent_leg_status': null,
          'legc_uuid': null,
          'legc_status': null,
          'legz_uuid': null,
          'legz_status': null,
          'conference_sid': null,
          'first_time_caller': 1,
          'body': '',
          'attachments': null,
          'conference_status': null,
          'conference_status2': null,
          'current_status': 'completed',
          'current_status2': 9,
          'disposition_status': 'dead-end',
          'disposition_status2': 6,
          'resolution': 'voicemail',
          'resolution2': 3,
          'queue_resolution': null,
          'queue_resolution2': null,
          'callback_status': null,
          'transfer_type': null,
          'rejected_by_app': 0,
          'duration': 10,
          'hold_time': 0,
          'talk_time': 0,
          'wait_time': 10,
          'csat_score': 0,
          'provider_cost': '0.000000',
          'notes': 'Sys (10:58am PDT): Routed to line voicemail\nSystem: Dead end call.\n',
          'country': 'US',
          'state': 'NH',
          'city': 'DURHAM',
          'customer_leg_called_at': '2021-09-29 17:58:43',
          'customer_leg_transferred_at': '2021-09-29 17:58:43',
          'customer_leg_hangup_at': '2021-09-29 17:58:55',
          'agent_leg_called_at': null,
          'agent_leg_transferred_at': null,
          'agent_leg_hangup_at': null,
          'conference_start_at': null,
          'conference_end_at': null,
          'hold_at': null,
          'should_broadcast': true,
          'metadata': {
            'callback_asked_at': [],
            'asked_for_callback': false,
            'requested_callback': false,
            'voicemail_asked_at': [],
            'asked_for_voicemail': false,
            'authorized_for_text': false,
            'requested_voicemail': false,
            'user_replied_digits': {
              'callback': null,
              'voicemail': null,
              'handle_by_text': null,
              'text_authorization': null
            },
            'handle_by_text_asked_at': [],
            'asked_for_handle_by_text': false,
            'requested_handle_by_text': false,
            'text_authorization_asked_at': null,
            'asked_for_text_authorization': false
          },
          'engagement_data': null,
          'created_at': '2021-09-29 17:58:43',
          'updated_at': '2021-09-29 17:58:55',
          'deleted_at': null,
          'is_migrated': 0
        },
        'external_integration_data': [
          {
            'id': 64239,
            'company_id': 7,
            'model_id': 210470,
            'model_type': 'App\\Models\\Contact',
            'source': 'hubspot',
            'field': 'contact_id',
            'data': '219601',
            'textual_data': null,
            'created_at': '2021-09-29 17:58:41',
            'updated_at': '2021-09-29 17:58:41'
          }
        ],
        'company': {
          'id': 7,
          'name': 'USS Enterprise',
          'hubspot_integration_enabled': true
        },
        'tag_ids': []
      },
      selectedId: {
        'id': 10,
        'company_id': 7,
        'ring_group_id': null,
        'ivr_text_ring_group_id': null,
        'user_id': 6,
        'default_filter_id': null,
        'name': 'Vulcan Hotel',
        'description': null,
        'should_greet': true,
        'greeting_tts': 'Welcome to Aloware',
        'greeting_file': null,
        'should_ask_for_text_authorization': false,
        'ask_for_text_authorization_tts': 'Press 1 for text message authorization.',
        'ask_for_text_authorization_file': null,
        'should_whisper': true,
        'whisper_tts': 'Hey [AgentName] This is a call from [CampaignName]!',
        'whisper_file': null,
        'should_record': true,
        'record_tts': 'Your call is being recorded for quality assurance purposes.',
        'record_file': null,
        'voicemail_tts': 'We are sorry, but no agents are available to take this call. Please leave your message after the beep.',
        'voicemail_file': null,
        'review_required': 1,
        'review_duration': 60,
        'is_proxy': 0,
        'caller_id_option': 1,
        'missed_call_handling_mode': 2,
        'missed_call_handling_options': '{"forward_to": "+18189005934", "reroute_to_campaign_id": null}',
        'call_router_behavior': 1,
        'ivr_prompt_tts': 'If you know your extension you can enter it now, if not Press 1 to connect to GoSite.',
        'ivr_prompt_file': null,
        'should_message_if_missed': false,
        'missed_call_message': null,
        'should_block_spam': false,
        'created_at': '2018-02-02 04: 37: 23',
        'updated_at': '2021-09-02 21: 59: 54',
        'type': 0,
        'subtype': null,
        'is_fax': false,
        'operating_hours': '{"friday": [{"id": "5", "open": "24hrs", "close": "24hrs", "isOpen": true}], "monday": [{"id": "1", "open": "24hrs", "close": "24hrs", "isOpen": true}], "sunday": [{"id": "7", "open": "24hrs", "close": "24hrs", "isOpen": true}], "tuesday": [{"id": "2", "open": "24hrs", "close": "24hrs", "isOpen": true}], "saturday": [{"id": "6", "open": "24hrs", "close": "24hrs", "isOpen": true}], "thursday": [{"id": "4", "open": "24hrs", "close": "24hrs", "isOpen": true}], "wednesday": [{"id": "3", "open": "24hrs", "close": "24hrs", "isOpen": true}]}',
        'closed_hours_voice_prompt': '{"tts": null, "file": null, "enabled": false}',
        'closed_hours_auto_reply_text': '{"enabled": false, "message": null}',
        'triggers': '[{"id": "f411da57-c5ed-4048-8d3f-2eeb19e1032b", "type": 1, "valid": true, "value": 0, "symbol": null, "tag_ids": [], "keywords": [], "stage_id": "1", "variable": null, "direction": 1, "operation": "create_hubspot_ticket", "pipeline_id": "0", "ticket_name": "Missed Inbound Call From [FirstName]", "workflow_ids": [], "has_condition": false, "disposition_status": 3, "ticket_description": "Call was missed on [LineName] line", "disposition_status_id": []}, {"id": "f84912ef-e1d3-4d73-9a33-4232104472dc", "type": 2, "valid": true, "value": 0, "symbol": null, "tag_ids": [], "keywords": [], "stage_id": "1", "variable": null, "direction": 1, "operation": "create_hubspot_ticket", "pipeline_id": "0", "ticket_name": "Inbound SMS From [FirstName]", "workflow_ids": [], "has_condition": false, "disposition_status": 4, "ticket_description": "SMS was received on [LineName] line", "disposition_status_id": []}]',
        'ivr_steps': '[{"id": "2e7f79f3-23f0-4919-b423-b5740e717516", "key": null, "task": "route_to_extension", "type": "normal", "valid": true, "tag_ids": [], "message_tts": null, "message_file": null, "workflow_ids": [], "route_to_user_id": null, "call_router_behavior": 1, "listen_for_extension": true, "reroute_to_campaign_id": null, "route_to_ring_group_id": false, "route_to_destination_id": false}, {"id": "16a2ad16-902c-4b36-97dc-9b38b673bd32", "key": "*", "task": "replay", "type": "normal", "valid": true, "tag_ids": [], "message_tts": null, "message_file": null, "workflow_ids": [], "route_to_user_id": null, "call_router_behavior": null, "listen_for_extension": false, "reroute_to_campaign_id": null, "route_to_ring_group_id": null, "route_to_destination_id": null}, {"id": "e03c5f16-fdb0-4dfd-a1b2-67f09c7ed4fe", "key": null, "task": "replay", "type": "exit", "valid": true, "tag_ids": [], "message_tts": null, "message_file": null, "workflow_ids": [], "route_to_user_id": null, "call_router_behavior": null, "listen_for_extension": false, "reroute_to_campaign_id": null, "route_to_ring_group_id": null}, {"id": "d2828df6-eb04-47d0-bad1-49643c15b82b", "key": "1", "task": "route_to_ring_group", "type": "normal", "valid": true, "tag_ids": [], "message_tts": null, "message_file": null, "workflow_ids": [], "route_to_user_id": null, "call_router_behavior": null, "listen_for_extension": false, "reroute_to_campaign_id": null, "route_to_ring_group_id": 188, "route_to_destination_id": null}]',
        'pool_size': null,
        'pool_options': null,
        'visitor_tracking_mode': null,
        'visitor_tracking_options': null,
        'active': true,
        'has_local_presence': false,
        'tracking_source': null,
        'has_messaging_service': false,
        'dni_script_address': 'https: //app.alodev.org/v1/sZwMTAmV/dni.js',
        'incoming_number': '+15027473216',
        'missed_calls_settings': {
          'id': 1,
          'model_id': 10,
          'model_type': 'AppModelsCampaign',
          'company_id': 7,
          'missed_call_handling_mode': 2,
          'voicemail_tts': 'We are sorry, but no agents are available to take this call. Please leave your message after the beep.',
          'voicemail_file': null,
          'reroute_to_campaign_id': null,
          'forward_to': '+18189005934',
          'deleted_at': null,
          'created_at': '2020-08-27 00:12:44',
          'updated_at': '2020-11-13 17:30:11'
        },
        'first_incoming_number': {
          'id': 393,
          'company_id': 7,
          'campaign_id': 10,
          'phone_number': '+15027473216',
          'city': '',
          'state': 'KY',
          'country': 'US',
          'label': 'Facebook Referrals-incoming number',
          'non_billable': false,
          'is_tollfree': false,
          'is_rented': true,
          'do_not_use': false,
          'is_voice_capable': false,
          'is_fax_capable': false,
          'is_sms_capable': false,
          'is_mms_capable': false,
          'is_fax': false,
          'default_callerid': false,
          'created_at': '2019-07-24 16:53:38',
          'updated_at': '2021-08-24 21:18:25'
        },
        'incoming_numbers': [
          {
            'id': 393,
            'company_id': 7,
            'campaign_id': 10,
            'phone_number': '+15027473216',
            'city': '',
            'state': 'KY',
            'country': 'US',
            'label': 'Facebook Referrals-incoming number',
            'non_billable': false,
            'is_tollfree': false,
            'is_rented': true,
            'do_not_use': false,
            'is_voice_capable': false,
            'is_fax_capable': false,
            'is_sms_capable': false,
            'is_mms_capable': false,
            'is_fax': false,
            'default_callerid': false,
            'created_at': '2019-07-24 16:53:38',
            'updated_at': '2021-08-24 21:18:25'
          }
        ],
        'default_filter': null
      },
      communications: [
        {
          'id': 1591025,
          'company_id': 7,
          'contact_id': 210470,
          'user_id': null,
          'from': null,
          'to': 'Aloware Contact',
          'property': 'first_name',
          'notes': null,
          'created_at': '2021-09-29 17: 58: 41'
        },
        {
          'id': 1591024,
          'company_id': 7,
          'contact_id': 210470,
          'user_id': null,
          'from': null,
          'to': '+16033166810',
          'property': 'phone_number',
          'notes': null,
          'created_at': '2021-09-29 17: 58: 41'
        },
        {
          'id': 1591026,
          'company_id': 7,
          'contact_id': 210470,
          'user_id': null,
          'from': null,
          'to': '(+16033166810)',
          'property': 'last_name',
          'notes': null,
          'created_at': '2021-09-29 17: 58: 41'
        },
        {
          'id': 48578,
          'company_id': 7,
          'campaign_id': 542,
          'ring_group_id': null,
          'owner_id': null,
          'workflow_id': null,
          'broadcast_id': null,
          'incoming_number_id': 2069,
          'incoming_number': '+19893751337',
          'contact_id': 210470,
          'call_disposition_id': null,
          'lead_number': '+16033166810',
          'target_users': null,
          'attempt': null,
          'attempting_users': null,
          'user_id': null,
          'destination_number': null,
          'transfer_prior_user_ids': null,
          'transfer_target_user_ids': null,
          'in_cold_transfer': false,
          'direction': 1,
          'type': 1,
          'is_read': null,
          'recorded_file_is_migrated': false,
          'voicemail_is_migrated': false,
          'legc_uuid': null,
          'legc_status': null,
          'first_time_caller': 1,
          'body': '',
          'attachments': null,
          'conference_status2': null,
          'current_status2': 9,
          'disposition_status2': 6,
          'resolution2': 3,
          'callback_status': null,
          'transfer_type': null,
          'rejected_by_app': 0,
          'duration': 10,
          'talk_time': 0,
          'wait_time': 10,
          'csat_score': 0,
          'notes': 'Sys (10: 58am PDT):  Routed to line voicemailnSystem:  Dead end call.n',
          'country': 'US',
          'state': 'NH',
          'city': 'DURHAM',
          'engagement_data': null,
          'created_at': '2021-09-29 17: 58: 43',
          'has_recording': false,
          'has_voicemail': false,
          'campaign': {
            'id': 542,
            'company_id': 7,
            'ring_group_id': null,
            'ivr_text_ring_group_id': null,
            'user_id': null,
            'default_filter_id': null,
            'name': '+19893751337',
            'description': null,
            'should_greet': false,
            'greeting_tts': '-',
            'greeting_file': null,
            'should_ask_for_text_authorization': false,
            'ask_for_text_authorization_tts': null,
            'ask_for_text_authorization_file': null,
            'should_whisper': false,
            'whisper_tts': '-',
            'whisper_file': null,
            'should_record': false,
            'record_tts': '-',
            'record_file': null,
            'voicemail_tts': 'We are sorry, but no agents are available to take this call. Please leave your message after the beep.',
            'voicemail_file': null,
            'review_required': 0,
            'review_duration': 60,
            'is_proxy': 0,
            'caller_id_option': 0,
            'missed_call_handling_mode': 1,
            'missed_call_handling_options': '{"forward_to":  "", "reroute_to_campaign_id":  ""}',
            'call_router_behavior': 3,
            'ivr_prompt_tts': null,
            'ivr_prompt_file': null,
            'should_message_if_missed': false,
            'missed_call_message': null,
            'should_block_spam': false,
            'created_at': '2021-07-10 04: 55: 09',
            'updated_at': '2021-07-10 04: 55: 09',
            'type': 0,
            'subtype': null,
            'is_fax': false,
            'operating_hours': '{"friday": [{"id": "5", "open": "24hrs", "close": "24hrs", "isOpen": true}], "monday": [{"id": "1", "open": "24hrs", "close": "24hrs", "isOpen": true}], "sunday": [{"id": "7", "open": "24hrs", "close": "24hrs", "isOpen": true}], "tuesday": [{"id": "2", "open": "24hrs", "close": "24hrs", "isOpen": true}], "saturday": [{"id": "6", "open": "24hrs", "close": "24hrs", "isOpen": true}], "thursday": [{"id": "4", "open": "24hrs", "close": "24hrs", "isOpen": true}], "wednesday": [{"id": "3", "open": "24hrs", "close": "24hrs", "isOpen": true}]}',
            'closed_hours_voice_prompt': '"{"tts": null, "file": null, "enabled": false}',
            'closed_hours_auto_reply_text': '{"enabled": false, "message": null}',
            'triggers': null,
            'ivr_steps': null,
            'pool_size': null,
            'pool_options': null,
            'visitor_tracking_mode': null,
            'visitor_tracking_options': null,
            'active': true,
            'has_local_presence': false,
            'tracking_source': null,
            'has_messaging_service': false,
            'dni_script_address': 'https: //app.alodev.org/v1/sZwMTAmV/dni.js',
            'incoming_number': '+19893751337',
            'first_incoming_number': {
              'id': 2069,
              'company_id': 7,
              'campaign_id': 542,
              'phone_number': '+19893751337',
              'city': '',
              'state': 'MI',
              'country': 'US',
              'label': '+19893751337-incoming number',
              'non_billable': false,
              'is_tollfree': false,
              'is_rented': true,
              'do_not_use': false,
              'is_voice_capable': true,
              'is_fax_capable': false,
              'is_sms_capable': true,
              'is_mms_capable': true,
              'is_fax': false,
              'default_callerid': false,
              'created_at': '2021-03-17 17:45:32',
              'updated_at': '2021-08-13 16:00:54'
            }
          },
          'tags': [],
          'user': null,
          'tag_ids': []
        }
      ]
    }
  }
}
</script>
