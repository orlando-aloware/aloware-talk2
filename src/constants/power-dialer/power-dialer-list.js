export const STATIC = 1
export const DYNAMIC = 2

export const DEFAULT_FILTER_LIST = {
  IN_QUEUE: {
    id: 'in-queue',
    name: 'In Queue',
    link: '/in-queue/'
  },
  CALLED: {
    id: 'called',
    name: 'Called',
    link: '/called/'
  },
  FAILED: {
    id: 'failed',
    name: 'Failed',
    link: '/failed/'
  },
  SCHEDULED: {
    id: 'scheduled',
    name: 'Scheduled',
    link: '/scheduled/'
  },
  All: {
    id: 'all',
    name: 'All',
    link: '/all/'
  }
}

export const DIRECTORY_LIST = [
  {
    id: 1,
    label: 'Interested Leads',
    disabled: false,
    children: []
  },
  {
    id: 2,
    label: 'Outbound Sales',
    disabled: false,
    children: [
      {
        id: 3,
        label: 'Google Map Scraping',
        disabled: false,
        children: [
          {
            id: 4,
            label: 'Untitled List',
            disabled: false,
            children: []
          },
          {
            id: 5,
            label: 'Chicago',
            disabled: false,
            children: []
          },
          {
            id: 6,
            label: 'Important Contacts',
            disabled: false,
            children: []
          }
        ]
      },
      {
        id: 7,
        label: 'ZoomInfo List Aug\'21',
        disabled: false,
        children: [
          {
            id: 8,
            label: 'Temporary List',
            disabled: false,
            children: []
          },
          {
            id: 9,
            label: 'New York',
            disabled: false,
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 10,
    label: 'Company Wide Outbound Sales',
    disabled: false,
    children: [
      {
        label: 'Missed Calls',
        disabled: false,
        children: []
      }
    ]
  }
]

export const ALL_COLUMNS = [
  {
    default: true,
    sticky: true,
    label: 'Checkbox',
    name: 'checkbox'
  },
  {
    name: 'name',
    label: 'Name',
    category: 0,
    order: 0,
    required: true,
    sortable: true,
    draggable: false,
    resizable: true,
    default: true,
    minWidth: 150
  },
  {
    name: 'phone_number',
    label: 'Phone Number',
    category: 0,
    order: 1,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false,
    minWidth: 150
  },
  {
    name: 'date_added',
    label: 'Date Added',
    category: 0,
    order: 2,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false,
    minWidth: 150
  },
  {
    name: 'tags',
    label: 'Tags',
    category: 0,
    order: 3,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false,
    minWidth: 150
  },
  {
    name: 'pd_status',
    label: 'PD Status',
    category: 0,
    order: 4,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false,
    minWidth: 150
  },
  {
    name: 'actions',
    label: 'Phone Number',
    category: 0,
    order: 5,
    sortable: false,
    draggable: false,
    resizable: false,
    default: false,
    minWidth: 50
  }
]

export const WARM_UP_PERIOD_LIST = [
  'No Warm Up'
]

export const TEST_DATA = [
  {
    'id': 2,
    'company_id': 7,
    'first_name': 'TwilioNumber',
    'last_name': 'Number',
    'phone_number': '+18182104297',
    'email': 'jobelle.vallega@gmail.com',
    'created_at': '2018-02-02 05:50:32',
    'updated_at': '2021-09-07 16:50:34',
    'date_of_birth': null,
    'pd_status': 'Called',
    'text_authorized_at': null,
    'address': null,
    'cnam_state': 'CO',
    'cnam_city': 'Compton',
    'cnam_zipcode': '123',
    'cnam_country': 'US',
    'timezone': 'America/Los_Angeles',
    'website': 'https://website.com',
    'company_name': 'USS Enterprise',
    'intake_source': 'zoho',
    'initial_campaign_id': 497,
    'lead_source_id': null,
    'user_id': 406,
    'disposition_status_id': 125,
    'is_dnc': false,
    'unread_count': 0,
    'unread_voicemail_count': 0,
    'unread_missed_call_count': 0,
    'name': 'TwilioNumber Number',
    'communications_count': 58,
    'inbound_communications_count': 52,
    'outbound_communications_count': 6,
    'outbound_texts_count': 2,
    'inbound_texts_count': 2,
    'outbound_calls_count': 4,
    'inbound_calls_count': 50,
    'last_outbound_engagement_at': '2021-07-28 20:35:17',
    'last_inbound_engagement_at': '2018-05-09 00:39:30',
    'last_engagement_at': '2021-07-28 20:35:17',
    'unread_texts_count': 0,
    'unread_voicemails_count': 0,
    'unread_missed_calls_count': 0,
    'task_status': 3,
    'task_status_name': 'Pending',
    'phone_numbers': [
      {
        'id': 1,
        'company_id': 7,
        'contact_id': 2,
        'phone_number': '+18182104297',
        'title': null,
        'cnam_source': 'conversync',
        'cnam_city': 'Compton',
        'cnam_state': 'CA',
        'cnam_zipcode': '',
        'cnam_country': 'US',
        'lrn_type': null,
        'created_at': '2020-02-02 01:03:54'
      }
    ],
    'lead_source': null,
    'broadcasts': [
      {
        'id': 99,
        'name': 'Bulk Message - 2021-01-04 14:49:50-America/New_York',
        'status': 4,
        'created_at': '2021-01-04 19:49:50',
        'status_name': 'Sent',
        'pending_tasks': 0,
        'total_ran': 0,
        'engagement_rate': 0
      }
    ],
    'user': {
      'id': 406,
      'first_name': 'Sohrab',
      'last_name': 'Reporter',
      'role_name': 'Company Agent',
      'full_name': 'Sohrab Reporter',
      'name': 'Sohrab Reporter',
      'has_consent': false
    },
    'disposition_status': {
      'id': 125,
      'company_id': 7,
      'name': 'In Progress',
      'description': '',
      'color': null,
      'is_external': false,
      'created_at': '2021-02-26 17:09:45',
      'updated_at': '2021-09-14 02:00:13'
    },
    'campaigns': [
      {
        'id': 10,
        'name': 'Vulcan Hotel',
        'pivot': {
          'contact_id': 2,
          'campaign_id': 10
        }
      },
      {
        'id': 379,
        'name': 'Press One Campaign',
        'pivot': {
          'contact_id': 2,
          'campaign_id': 379
        }
      },
      {
        'id': 497,
        'name': 'Hogwarts',
        'pivot': {
          'contact_id': 2,
          'campaign_id': 497
        }
      },
      {
        'id': 508,
        'name': 'Skyler Personal Line',
        'pivot': {
          'contact_id': 2,
          'campaign_id': 508
        }
      }
    ],
    'initial_campaign': {
      'id': 497,
      'name': 'Hogwarts'
    },
    'contact_lists': [
      {
        'id': 22,
        'company_id': 7,
        'contact_folder_id': 79,
        'name': 'My Static List',
        'type': 1,
        'headers': [
          {
            'name': 'checkbox',
            'label': 'Checkbox',
            'sticky': true,
            'default': true
          },
          {
            'name': 'name',
            'label': 'Name',
            'order': 0,
            'default': true,
            'category': 0,
            'minWidth': 150,
            'required': true,
            'sortable': true,
            'draggable': false,
            'resizable': true
          },
          {
            'name': 'phone_number',
            'label': 'Phone Number',
            'order': 3,
            'default': true,
            'category': 0,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'created_at',
            'label': 'Date Added',
            'order': 17,
            'default': true,
            'category': 0,
            'maxWidth': 140,
            'minWidth': 140,
            'required': true,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'last_engagement_at',
            'label': 'Last Engagement',
            'order': 18,
            'default': true,
            'category': 3,
            'required': true,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'tags',
            'label': 'Tags',
            'order': 24,
            'default': true,
            'category': 2,
            'minWidth': 200,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_missed_call_count',
            'label': 'Unread Missed Calls',
            'order': 32,
            'default': true,
            'category': 3,
            'maxWidth': 190,
            'minWidth': 190,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_voicemail_count',
            'label': 'Unread Voicemails',
            'order': 33,
            'default': true,
            'category': 3,
            'maxWidth': 175,
            'minWidth': 175,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_count',
            'label': 'Unread Messages',
            'order': 34,
            'default': true,
            'category': 3,
            'maxWidth': 170,
            'minWidth': 170,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'id': '426108ce-7d6e-43e1-b13e-e406a9362db0',
            'name': 'actions',
            'label': 'Actions',
            'order': 40,
            'default': true,
            'maxWidth': 120,
            'minWidth': 120,
            'sortable': false,
            'draggable': false,
            'resizable': false
          }
        ],
        'filters': [],
        'order': 0,
        'is_default': false,
        'created_at': '2021-08-31 20:07:05',
        'updated_at': '2021-08-31 20:07:05',
        'deleted_at': null,
        'pivot': {
          'contact_id': 2,
          'contact_list_id': 22
        }
      },
      {
        'id': 25,
        'company_id': 7,
        'contact_folder_id': 148,
        'name': 'My Static List 2',
        'type': 1,
        'headers': [
          {
            'name': 'checkbox',
            'label': 'Checkbox',
            'sticky': true,
            'default': true
          },
          {
            'name': 'name',
            'label': 'Name',
            'order': 0,
            'default': true,
            'category': 0,
            'minWidth': 150,
            'required': true,
            'sortable': true,
            'draggable': false,
            'resizable': true
          },
          {
            'name': 'phone_number',
            'label': 'Phone Number',
            'order': 3,
            'default': true,
            'category': 0,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'created_at',
            'label': 'Date Added',
            'order': 17,
            'default': true,
            'category': 0,
            'maxWidth': 140,
            'minWidth': 140,
            'required': true,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'last_engagement_at',
            'label': 'Last Engagement',
            'order': 18,
            'default': true,
            'category': 3,
            'required': true,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'tags',
            'label': 'Tags',
            'order': 24,
            'default': true,
            'category': 2,
            'minWidth': 200,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_missed_call_count',
            'label': 'Unread Missed Calls',
            'order': 32,
            'default': true,
            'category': 3,
            'maxWidth': 190,
            'minWidth': 190,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_voicemail_count',
            'label': 'Unread Voicemails',
            'order': 33,
            'default': true,
            'category': 3,
            'maxWidth': 175,
            'minWidth': 175,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_count',
            'label': 'Unread Messages',
            'order': 34,
            'default': true,
            'category': 3,
            'maxWidth': 170,
            'minWidth': 170,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'id': '426108ce-7d6e-43e1-b13e-e406a9362db0',
            'name': 'actions',
            'label': 'Actions',
            'order': 40,
            'default': true,
            'maxWidth': 120,
            'minWidth': 120,
            'sortable': false,
            'draggable': false,
            'resizable': false
          }
        ],
        'filters': [],
        'order': 0,
        'is_default': false,
        'created_at': '2021-09-06 23:45:49',
        'updated_at': '2021-09-07 22:27:16',
        'deleted_at': null,
        'pivot': {
          'contact_id': 2,
          'contact_list_id': 25
        }
      }
    ],
    'ring_groups': [
      {
        'id': 50,
        'name': '(WithQueue) JamesT'
      },
      {
        'id': 121,
        'name': '1 layer round-robin'
      }
    ],
    'tags': [
      {
        'id': 2045,
        'name': 'Import (by James Tx Kirk) on +12569603220 at 09/07/2021 00:53:03',
        'description': null,
        'color': '#7C3079',
        'category': 1,
        'type': 3
      }
    ],
    'last_communication': {
      'id': 46035,
      'company_id': 7,
      'campaign_id': 508,
      'ring_group_id': null,
      'owner_id': 687,
      'workflow_id': null,
      'sequence_id': null,
      'broadcast_id': null,
      'creator_type': null,
      'incoming_number_id': 2027,
      'incoming_number': '+14353343884',
      'incoming_sip_uri': null,
      'contact_id': 2,
      'call_disposition_id': null,
      'lead_number': '+18182104297',
      'is_international': false,
      'target_users': null,
      'attempt': null,
      'attempting_users': null,
      'user_id': 687,
      'destination_number': 'client:agent687',
      'transfer_prior_user_ids': null,
      'transferred_from': null,
      'transfer_target_user_ids': null,
      'transferred_to': null,
      'in_cold_transfer': false,
      'proxy_number_id': null,
      'forward_sid': null,
      'direction': 2,
      'type': 1,
      'call_router_behavior': 1,
      'is_read': null,
      'recording_url': 'https://app.alodev.org/static/uploaded_file/09cc9195-9425-4149-9f11-dd0b622733d9',
      'recorded_file_is_migrated': true,
      'voicemail_url': null,
      'voicemail_is_migrated': false,
      'voicemail_duration': null,
      'sid': 'CA820b64ab56888aa66a85c772ef46e7d0',
      'customer_leg_sid': 'CAef1e0b76ff17913be3ef89b5186af40e',
      'customer_leg_status': 6,
      'agent_leg_sid': 'CA820b64ab56888aa66a85c772ef46e7d0',
      'agent_leg_status': 6,
      'legc_uuid': null,
      'legc_status': null,
      'legz_uuid': null,
      'legz_status': null,
      'conference_sid': 'CF862655c740371c675708d7277ad6ea0d',
      'first_time_caller': 1,
      'body': '',
      'attachments': null,
      'conference_status': 'customer-leave',
      'conference_status2': 9,
      'current_status': 'completed',
      'current_status2': 9,
      'disposition_status': 'completed',
      'disposition_status2': 4,
      'resolution': 'normal',
      'resolution2': 1,
      'queue_resolution': null,
      'queue_resolution2': null,
      'callback_status': null,
      'transfer_type': null,
      'rejected_by_app': 0,
      'duration': 4,
      'hold_time': 0,
      'talk_time': 2,
      'wait_time': 3,
      'csat_score': 0,
      'provider_cost': '0.000000',
      'notes': null,
      'country': 'US',
      'state': 'CA',
      'city': 'Compton',
      'customer_leg_called_at': '2021-07-28 20:35:20',
      'customer_leg_transferred_at': '2021-07-28 20:35:20',
      'customer_leg_hangup_at': '2021-07-28 20:35:23',
      'agent_leg_called_at': '2021-07-28 20:35:17',
      'agent_leg_transferred_at': '2021-07-28 20:35:19',
      'agent_leg_hangup_at': '2021-07-28 20:35:22',
      'conference_start_at': null,
      'conference_end_at': null,
      'hold_at': null,
      'should_broadcast': true,
      'metadata': null,
      'engagement_data': null,
      'created_at': '2021-07-28 20:35:17',
      'updated_at': '2021-07-28 20:35:47',
      'deleted_at': null,
      'is_migrated': 0
    }
  },
  {
    'id': 7,
    'company_id': 7,
    'first_name': 'PlivoNumbers',
    'last_name': 'Numbers',
    'phone_number': '+18182934499',
    'email': null,
    'created_at': '2018-02-09 07:32:09',
    'updated_at': '2021-08-10 02:01:19',
    'date_of_birth': null,
    'pd_status': 'Failed',
    'text_authorized_at': null,
    'address': null,
    'cnam_state': 'CA',
    'cnam_city': 'SUNLAND',
    'cnam_zipcode': '91040',
    'cnam_country': 'US',
    'timezone': 'America/Los_Angeles',
    'website': null,
    'company_name': 'helllo gggggggggggg',
    'intake_source': 'hubspot',
    'initial_campaign_id': null,
    'lead_source_id': null,
    'user_id': 6,
    'disposition_status_id': 129,
    'is_dnc': false,
    'unread_count': 0,
    'unread_voicemail_count': 0,
    'unread_missed_call_count': 0,
    'name': 'PlivoNumbers Numbers',
    'communications_count': 11,
    'inbound_communications_count': 7,
    'outbound_communications_count': 4,
    'outbound_texts_count': 4,
    'inbound_texts_count': 5,
    'outbound_calls_count': 0,
    'inbound_calls_count': 2,
    'last_outbound_engagement_at': '2018-04-06 08:21:35',
    'last_inbound_engagement_at': '2021-03-26 06:38:10',
    'last_engagement_at': '2021-03-26 06:38:10',
    'unread_texts_count': 0,
    'unread_voicemails_count': 0,
    'unread_missed_calls_count': 0,
    'task_status': 2,
    'task_status_name': 'Open',
    'phone_numbers': [
      {
        'id': 2,
        'company_id': 7,
        'contact_id': 7,
        'phone_number': '+18182934499',
        'title': null,
        'cnam_source': 'libgphone',
        'cnam_city': 'SUNLAND',
        'cnam_state': 'CA',
        'cnam_zipcode': '91040',
        'cnam_country': 'US',
        'lrn_type': null,
        'created_at': '2020-02-02 01:03:54'
      }
    ],
    'lead_source': null,
    'broadcasts': [
      {
        'id': 99,
        'name': 'Bulk Message - 2021-01-04 14:49:50-America/New_York',
        'status': 4,
        'created_at': '2021-01-04 19:49:50',
        'status_name': 'Sent',
        'pending_tasks': 0,
        'total_ran': 0,
        'engagement_rate': 0
      }
    ],
    'user': {
      'id': 6,
      'first_name': 'James Tx',
      'last_name': 'Kirk',
      'role_name': 'Company Admin',
      'full_name': 'James Tx Kirk',
      'name': 'James Tx Kirk',
      'has_consent': false
    },
    'disposition_status': {
      'id': 129,
      'company_id': 7,
      'name': 'Bad Timing',
      'description': '',
      'color': null,
      'is_external': false,
      'created_at': '2021-02-26 17:09:46',
      'updated_at': '2021-09-14 02:00:13'
    },
    'campaigns': [
      {
        'id': 10,
        'name': 'Vulcan Hotel',
        'pivot': {
          'contact_id': 7,
          'campaign_id': 10
        }
      },
      {
        'id': 379,
        'name': 'Press One Campaign',
        'pivot': {
          'contact_id': 7,
          'campaign_id': 379
        }
      },
      {
        'id': 481,
        'name': 'Janssen Personal Line',
        'pivot': {
          'contact_id': 7,
          'campaign_id': 481
        }
      }
    ],
    'initial_campaign': null,
    'contact_lists': [
      {
        'id': 1,
        'company_id': 7,
        'contact_folder_id': 89,
        'name': 'Static 1 List',
        'type': 1,
        'headers': [
          {
            'name': 'checkbox',
            'label': 'Checkbox',
            'sticky': true,
            'default': true
          },
          {
            'name': 'name',
            'label': 'Name',
            'default': true,
            'category': 0,
            'minWidth': 150,
            'required': true,
            'sortable': true,
            'draggable': false,
            'resizable': true
          },
          {
            'name': 'phone_number',
            'label': 'Phone Number',
            'default': true,
            'category': 0,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'tags',
            'label': 'Tags',
            'default': true,
            'category': 2,
            'minWidth': 200,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_count',
            'label': 'Unreads',
            'default': true,
            'category': 3,
            'maxWidth': 120,
            'minWidth': 120,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'id': '426108ce-7d6e-43e1-b13e-e406a9362db0',
            'name': 'actions',
            'label': 'Actions',
            'default': true,
            'maxWidth': 120,
            'minWidth': 120,
            'sortable': false,
            'draggable': false,
            'resizable': false
          }
        ],
        'filters': [],
        'order': 0,
        'is_default': false,
        'created_at': '2021-07-19 16:35:22',
        'updated_at': '2021-07-19 16:35:22',
        'deleted_at': null,
        'pivot': {
          'contact_id': 7,
          'contact_list_id': 1
        }
      },
      {
        'id': 6,
        'company_id': 7,
        'contact_folder_id': 1,
        'name': 'Anoosh test',
        'type': 1,
        'headers': [
          {
            'name': 'checkbox',
            'label': 'Checkbox',
            'sticky': true,
            'default': true
          },
          {
            'name': 'name',
            'label': 'Name',
            'default': true,
            'category': 0,
            'minWidth': 150,
            'required': true,
            'sortable': true,
            'draggable': false,
            'resizable': true
          },
          {
            'name': 'phone_number',
            'label': 'Phone Number',
            'default': true,
            'category': 0,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'tags',
            'label': 'Tags',
            'default': true,
            'category': 2,
            'minWidth': 200,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_count',
            'label': 'Unreads',
            'default': true,
            'category': 3,
            'maxWidth': 120,
            'minWidth': 120,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'created_at',
            'label': 'Date Added',
            'default': false,
            'category': 0,
            'maxWidth': 140,
            'minWidth': 140,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'date_of_birth',
            'label': 'Date of Birth',
            'default': false,
            'category': 0,
            'maxWidth': 140,
            'minWidth': 140,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'email',
            'label': 'Email',
            'default': false,
            'category': 0,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'first_name',
            'label': 'First Name',
            'default': false,
            'category': 0,
            'minWidth': 150,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'last_name',
            'label': 'Last Name',
            'default': false,
            'category': 0,
            'minWidth': 150,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'text_authorized_at',
            'label': 'TCPA Approved',
            'default': false,
            'category': 0,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'address',
            'label': 'Address',
            'default': false,
            'category': 1,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'cnam_city',
            'label': 'City',
            'default': false,
            'category': 1,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'cnam_country',
            'label': 'Country',
            'default': false,
            'category': 1,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'cnam_state',
            'label': 'State',
            'default': false,
            'category': 1,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'cnam_zipcode',
            'label': 'Zip Code',
            'default': false,
            'category': 1,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'timezone',
            'label': 'Timezone',
            'default': false,
            'category': 1,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'broadcasts',
            'label': 'Broadcast',
            'default': false,
            'category': 2,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'company_name',
            'label': 'Company Name',
            'default': false,
            'category': 2,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'contact_lists',
            'label': 'Contact List',
            'default': false,
            'category': 2,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'contact_owner',
            'label': 'Contact Owner',
            'default': false,
            'category': 2,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'initial_campaign_id',
            'label': 'Initial Line',
            'default': false,
            'category': 2,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'intake_source',
            'label': 'Intake Source',
            'default': false,
            'category': 2,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'lead_source',
            'label': 'Lead Source',
            'default': false,
            'category': 2,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'ring_groups',
            'label': 'Ring Group',
            'default': false,
            'category': 2,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'website',
            'label': 'Website',
            'default': false,
            'category': 2,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'communications_count',
            'label': 'Communications',
            'default': false,
            'category': 3,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'disposition_status',
            'label': 'Contact Disposition',
            'default': false,
            'category': 3,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'inbound_calls_count',
            'label': 'Inbound Calls',
            'default': false,
            'category': 3,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'inbound_communications_count',
            'label': 'Inbound Communications',
            'default': false,
            'category': 3,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'inbound_texts_count',
            'label': 'Inbound SMS',
            'default': false,
            'category': 3,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'last_engagement_at',
            'label': 'Last Engagement',
            'default': false,
            'category': 3,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'last_inbound_engagement_at',
            'label': 'Last Inbound Engagement',
            'default': false,
            'category': 3,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'last_outbound_engagement_at',
            'label': 'Last Outbound Engagement',
            'default': false,
            'category': 3,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'outbound_calls_count',
            'label': 'Outbound Calls',
            'default': false,
            'category': 3,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'outbound_communications_count',
            'label': 'Outbound Communications',
            'default': false,
            'category': 3,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'outbound_texts_count',
            'label': 'Outbound Texts',
            'default': false,
            'category': 3,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_missed_call_count',
            'label': 'Unread Missed Calls',
            'default': true,
            'category': 3,
            'maxWidth': 190,
            'minWidth': 190,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_voicemail_count',
            'label': 'Unread Voicemails',
            'default': true,
            'category': 3,
            'maxWidth': 175,
            'minWidth': 175,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'id': '426108ce-7d6e-43e1-b13e-e406a9362db0',
            'name': 'actions',
            'label': 'Actions',
            'default': true,
            'maxWidth': 120,
            'minWidth': 120,
            'sortable': false,
            'draggable': false,
            'resizable': false
          }
        ],
        'filters': [],
        'order': 0,
        'is_default': false,
        'created_at': '2021-07-21 17:50:24',
        'updated_at': '2021-08-06 16:13:53',
        'deleted_at': null,
        'pivot': {
          'contact_id': 7,
          'contact_list_id': 6
        }
      },
      {
        'id': 18,
        'company_id': 7,
        'contact_folder_id': 144,
        'name': 'Simple List',
        'type': 1,
        'headers': [
          {
            'name': 'checkbox',
            'label': 'Checkbox',
            'sticky': true,
            'default': true
          },
          {
            'name': 'name',
            'label': 'Name',
            'order': 0,
            'default': true,
            'category': 0,
            'minWidth': 150,
            'required': true,
            'sortable': true,
            'draggable': false,
            'resizable': true
          },
          {
            'name': 'phone_number',
            'label': 'Phone Number',
            'order': 3,
            'default': true,
            'category': 0,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'created_at',
            'label': 'Date Added',
            'order': 17,
            'default': true,
            'category': 0,
            'maxWidth': 140,
            'minWidth': 140,
            'required': true,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'last_engagement_at',
            'label': 'Last Engagement',
            'order': 18,
            'default': true,
            'category': 3,
            'required': true,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'tags',
            'label': 'Tags',
            'order': 24,
            'default': true,
            'category': 2,
            'minWidth': 200,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_missed_call_count',
            'label': 'Unread Missed Calls',
            'order': 32,
            'default': true,
            'category': 3,
            'maxWidth': 190,
            'minWidth': 190,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_voicemail_count',
            'label': 'Unread Voicemails',
            'order': 33,
            'default': true,
            'category': 3,
            'maxWidth': 175,
            'minWidth': 175,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_count',
            'label': 'Unread Messages',
            'order': 34,
            'default': true,
            'category': 3,
            'maxWidth': 170,
            'minWidth': 170,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'id': '426108ce-7d6e-43e1-b13e-e406a9362db0',
            'name': 'actions',
            'label': 'Actions',
            'order': 40,
            'default': true,
            'maxWidth': 120,
            'minWidth': 120,
            'sortable': false,
            'draggable': false,
            'resizable': false
          }
        ],
        'filters': [],
        'order': 0,
        'is_default': false,
        'created_at': '2021-08-25 18:18:00',
        'updated_at': '2021-08-25 18:18:00',
        'deleted_at': null,
        'pivot': {
          'contact_id': 7,
          'contact_list_id': 18
        }
      },
      {
        'id': 22,
        'company_id': 7,
        'contact_folder_id': 79,
        'name': 'My Static List',
        'type': 1,
        'headers': [
          {
            'name': 'checkbox',
            'label': 'Checkbox',
            'sticky': true,
            'default': true
          },
          {
            'name': 'name',
            'label': 'Name',
            'order': 0,
            'default': true,
            'category': 0,
            'minWidth': 150,
            'required': true,
            'sortable': true,
            'draggable': false,
            'resizable': true
          },
          {
            'name': 'phone_number',
            'label': 'Phone Number',
            'order': 3,
            'default': true,
            'category': 0,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'created_at',
            'label': 'Date Added',
            'order': 17,
            'default': true,
            'category': 0,
            'maxWidth': 140,
            'minWidth': 140,
            'required': true,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'last_engagement_at',
            'label': 'Last Engagement',
            'order': 18,
            'default': true,
            'category': 3,
            'required': true,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'tags',
            'label': 'Tags',
            'order': 24,
            'default': true,
            'category': 2,
            'minWidth': 200,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_missed_call_count',
            'label': 'Unread Missed Calls',
            'order': 32,
            'default': true,
            'category': 3,
            'maxWidth': 190,
            'minWidth': 190,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_voicemail_count',
            'label': 'Unread Voicemails',
            'order': 33,
            'default': true,
            'category': 3,
            'maxWidth': 175,
            'minWidth': 175,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_count',
            'label': 'Unread Messages',
            'order': 34,
            'default': true,
            'category': 3,
            'maxWidth': 170,
            'minWidth': 170,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'id': '426108ce-7d6e-43e1-b13e-e406a9362db0',
            'name': 'actions',
            'label': 'Actions',
            'order': 40,
            'default': true,
            'maxWidth': 120,
            'minWidth': 120,
            'sortable': false,
            'draggable': false,
            'resizable': false
          }
        ],
        'filters': [],
        'order': 0,
        'is_default': false,
        'created_at': '2021-08-31 20:07:05',
        'updated_at': '2021-08-31 20:07:05',
        'deleted_at': null,
        'pivot': {
          'contact_id': 7,
          'contact_list_id': 22
        }
      },
      {
        'id': 25,
        'company_id': 7,
        'contact_folder_id': 148,
        'name': 'My Static List 2',
        'type': 1,
        'headers': [
          {
            'name': 'checkbox',
            'label': 'Checkbox',
            'sticky': true,
            'default': true
          },
          {
            'name': 'name',
            'label': 'Name',
            'order': 0,
            'default': true,
            'category': 0,
            'minWidth': 150,
            'required': true,
            'sortable': true,
            'draggable': false,
            'resizable': true
          },
          {
            'name': 'phone_number',
            'label': 'Phone Number',
            'order': 3,
            'default': true,
            'category': 0,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'created_at',
            'label': 'Date Added',
            'order': 17,
            'default': true,
            'category': 0,
            'maxWidth': 140,
            'minWidth': 140,
            'required': true,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'last_engagement_at',
            'label': 'Last Engagement',
            'order': 18,
            'default': true,
            'category': 3,
            'required': true,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'tags',
            'label': 'Tags',
            'order': 24,
            'default': true,
            'category': 2,
            'minWidth': 200,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_missed_call_count',
            'label': 'Unread Missed Calls',
            'order': 32,
            'default': true,
            'category': 3,
            'maxWidth': 190,
            'minWidth': 190,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_voicemail_count',
            'label': 'Unread Voicemails',
            'order': 33,
            'default': true,
            'category': 3,
            'maxWidth': 175,
            'minWidth': 175,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_count',
            'label': 'Unread Messages',
            'order': 34,
            'default': true,
            'category': 3,
            'maxWidth': 170,
            'minWidth': 170,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'id': '426108ce-7d6e-43e1-b13e-e406a9362db0',
            'name': 'actions',
            'label': 'Actions',
            'order': 40,
            'default': true,
            'maxWidth': 120,
            'minWidth': 120,
            'sortable': false,
            'draggable': false,
            'resizable': false
          }
        ],
        'filters': [],
        'order': 0,
        'is_default': false,
        'created_at': '2021-09-06 23:45:49',
        'updated_at': '2021-09-07 22:27:16',
        'deleted_at': null,
        'pivot': {
          'contact_id': 7,
          'contact_list_id': 25
        }
      },
      {
        'id': 25,
        'company_id': 7,
        'contact_folder_id': 148,
        'name': 'My Static List 2',
        'type': 1,
        'headers': [
          {
            'name': 'checkbox',
            'label': 'Checkbox',
            'sticky': true,
            'default': true
          },
          {
            'name': 'name',
            'label': 'Name',
            'order': 0,
            'default': true,
            'category': 0,
            'minWidth': 150,
            'required': true,
            'sortable': true,
            'draggable': false,
            'resizable': true
          },
          {
            'name': 'phone_number',
            'label': 'Phone Number',
            'order': 3,
            'default': true,
            'category': 0,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'created_at',
            'label': 'Date Added',
            'order': 17,
            'default': true,
            'category': 0,
            'maxWidth': 140,
            'minWidth': 140,
            'required': true,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'last_engagement_at',
            'label': 'Last Engagement',
            'order': 18,
            'default': true,
            'category': 3,
            'required': true,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'tags',
            'label': 'Tags',
            'order': 24,
            'default': true,
            'category': 2,
            'minWidth': 200,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_missed_call_count',
            'label': 'Unread Missed Calls',
            'order': 32,
            'default': true,
            'category': 3,
            'maxWidth': 190,
            'minWidth': 190,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_voicemail_count',
            'label': 'Unread Voicemails',
            'order': 33,
            'default': true,
            'category': 3,
            'maxWidth': 175,
            'minWidth': 175,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_count',
            'label': 'Unread Messages',
            'order': 34,
            'default': true,
            'category': 3,
            'maxWidth': 170,
            'minWidth': 170,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'id': '426108ce-7d6e-43e1-b13e-e406a9362db0',
            'name': 'actions',
            'label': 'Actions',
            'order': 40,
            'default': true,
            'maxWidth': 120,
            'minWidth': 120,
            'sortable': false,
            'draggable': false,
            'resizable': false
          }
        ],
        'filters': [],
        'order': 0,
        'is_default': false,
        'created_at': '2021-09-06 23:45:49',
        'updated_at': '2021-09-07 22:27:16',
        'deleted_at': null,
        'pivot': {
          'contact_id': 7,
          'contact_list_id': 25
        }
      }
    ],
    'ring_groups': [],
    'tags': [
      {
        'id': 2019,
        'name': 'HubSpot list: Unassigned Contacts',
        'description': null,
        'color': '#FF8DDD',
        'category': 1,
        'type': 3
      }
    ],
    'last_communication': {
      'id': 40919,
      'company_id': 7,
      'campaign_id': 481,
      'ring_group_id': null,
      'owner_id': null,
      'workflow_id': null,
      'sequence_id': null,
      'broadcast_id': null,
      'creator_type': null,
      'incoming_number_id': 507,
      'incoming_number': '+12054794487',
      'incoming_sip_uri': null,
      'contact_id': 7,
      'call_disposition_id': null,
      'lead_number': '+18182934499',
      'is_international': false,
      'target_users': null,
      'attempt': null,
      'attempting_users': null,
      'user_id': 6,
      'destination_number': '',
      'transfer_prior_user_ids': null,
      'transferred_from': null,
      'transfer_target_user_ids': null,
      'transferred_to': null,
      'in_cold_transfer': false,
      'proxy_number_id': null,
      'forward_sid': null,
      'direction': 1,
      'type': 2,
      'call_router_behavior': null,
      'is_read': true,
      'recording_url': null,
      'recorded_file_is_migrated': false,
      'voicemail_url': null,
      'voicemail_is_migrated': false,
      'voicemail_duration': null,
      'sid': 'SM2ff4f53179652b650453b381278197ab',
      'customer_leg_sid': 'SM2ff4f53179652b650453b381278197ab',
      'customer_leg_status': 13,
      'agent_leg_sid': null,
      'agent_leg_status': null,
      'legc_uuid': null,
      'legc_status': null,
      'legz_uuid': null,
      'legz_status': null,
      'conference_sid': null,
      'first_time_caller': 1,
      'body': 'Your SMS was sent to a non mobile number. Please call or visit https://www.psychologytoday.com/profile/836411',
      'attachments': null,
      'conference_status': null,
      'conference_status2': null,
      'current_status': 'received',
      'current_status2': 11,
      'disposition_status': 'completed',
      'disposition_status2': 4,
      'resolution': 'normal',
      'resolution2': 1,
      'queue_resolution': null,
      'queue_resolution2': null,
      'callback_status': null,
      'transfer_type': null,
      'rejected_by_app': 0,
      'duration': 1,
      'hold_time': 0,
      'talk_time': 0,
      'wait_time': 0,
      'csat_score': 0,
      'provider_cost': '0.000000',
      'notes': null,
      'country': 'US',
      'state': 'CA',
      'city': 'SUNLAND',
      'customer_leg_called_at': null,
      'customer_leg_transferred_at': null,
      'customer_leg_hangup_at': null,
      'agent_leg_called_at': null,
      'agent_leg_transferred_at': null,
      'agent_leg_hangup_at': null,
      'conference_start_at': null,
      'conference_end_at': null,
      'hold_at': null,
      'should_broadcast': true,
      'metadata': null,
      'engagement_data': null,
      'created_at': '2021-03-26 06:38:10',
      'updated_at': '2021-03-26 06:38:12',
      'deleted_at': null,
      'is_migrated': 0
    }
  },
  {
    'id': 8,
    'company_id': 7,
    'first_name': 'Aloware',
    'last_name': 'Contact (+18182809451)',
    'phone_number': '+18182809451',
    'email': null,
    'created_at': '2018-02-12 01:40:27',
    'updated_at': '2021-09-07 14:35:40',
    'date_of_birth': null,
    'pd_status': 'Scheduled',
    'text_authorized_at': null,
    'address': null,
    'cnam_state': 'CA',
    'cnam_city': null,
    'cnam_zipcode': null,
    'cnam_country': 'US',
    'timezone': 'Asia/Manila',
    'website': null,
    'company_name': 'USS Enterprise',
    'intake_source': 'hubspot',
    'initial_campaign_id': 11,
    'lead_source_id': null,
    'user_id': null,
    'disposition_status_id': null,
    'is_dnc': false,
    'unread_count': 0,
    'unread_voicemail_count': 0,
    'unread_missed_call_count': 0,
    'name': 'Aloware Contact (+18182809451)',
    'communications_count': 371,
    'inbound_communications_count': 170,
    'outbound_communications_count': 201,
    'outbound_texts_count': 139,
    'inbound_texts_count': 17,
    'outbound_calls_count': 62,
    'inbound_calls_count': 153,
    'last_outbound_engagement_at': '2021-09-03 17:15:15',
    'last_inbound_engagement_at': '2018-12-21 06:56:52',
    'last_engagement_at': '2021-09-03 17:15:15',
    'unread_texts_count': 0,
    'unread_voicemails_count': 0,
    'unread_missed_calls_count': 0,
    'task_status': 3,
    'task_status_name': 'Pending',
    'phone_numbers': [
      {
        'id': 3,
        'company_id': 7,
        'contact_id': 8,
        'phone_number': '+18182809451',
        'title': null,
        'cnam_source': 'conversync',
        'cnam_city': '',
        'cnam_state': 'CA',
        'cnam_zipcode': '',
        'cnam_country': 'US',
        'lrn_type': null,
        'created_at': '2020-02-02 01:03:54'
      }
    ],
    'lead_source': null,
    'broadcasts': [
      {
        'id': 99,
        'name': 'Bulk Message - 2021-01-04 14:49:50-America/New_York',
        'status': 4,
        'created_at': '2021-01-04 19:49:50',
        'status_name': 'Sent',
        'pending_tasks': 0,
        'total_ran': 0,
        'engagement_rate': 0
      },
      {
        'id': 154,
        'name': 'Test Broadcase',
        'status': 2,
        'created_at': '2021-08-11 13:10:04',
        'status_name': 'Enrolling',
        'pending_tasks': 0,
        'total_ran': 0,
        'engagement_rate': 0
      },
      {
        'id': 155,
        'name': 'Test broadcast',
        'status': 3,
        'created_at': '2021-09-03 17:07:01',
        'status_name': 'Paused',
        'pending_tasks': 0,
        'total_ran': 0,
        'engagement_rate': 0
      }
    ],
    'user': null,
    'disposition_status': null,
    'campaigns': [
      {
        'id': 10,
        'name': 'Vulcan Hotel',
        'pivot': {
          'contact_id': 8,
          'campaign_id': 10
        }
      },
      {
        'id': 379,
        'name': 'Press One Campaign',
        'pivot': {
          'contact_id': 8,
          'campaign_id': 379
        }
      },
      {
        'id': 11,
        'name': 'Federation HQ',
        'pivot': {
          'contact_id': 8,
          'campaign_id': 11
        }
      },
      {
        'id': 497,
        'name': 'Hogwarts',
        'pivot': {
          'contact_id': 8,
          'campaign_id': 497
        }
      }
    ],
    'initial_campaign': {
      'id': 11,
      'name': 'Federation HQ'
    },
    'contact_lists': [
      {
        'id': 5,
        'company_id': 7,
        'contact_folder_id': 126,
        'name': 'Aloware SList',
        'type': 1,
        'headers': [
          {
            'name': 'checkbox',
            'label': 'Checkbox',
            'sticky': true,
            'default': true
          },
          {
            'name': 'name',
            'label': 'Name',
            'order': 0,
            'default': true,
            'category': 0,
            'minWidth': 150,
            'required': true,
            'sortable': true,
            'draggable': false,
            'resizable': true
          },
          {
            'name': 'first_name',
            'label': 'First Name',
            'order': 1,
            'default': false,
            'category': 0,
            'minWidth': 150,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'last_name',
            'label': 'Last Name',
            'order': 2,
            'default': false,
            'category': 0,
            'minWidth': 150,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'phone_number',
            'label': 'Phone Number',
            'order': 3,
            'default': true,
            'category': 0,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'contact_owner',
            'label': 'Contact Owner',
            'order': 5,
            'default': false,
            'category': 2,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'email',
            'label': 'Email',
            'order': 7,
            'default': false,
            'category': 0,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'company_name',
            'label': 'Company Name',
            'order': 8,
            'default': false,
            'category': 2,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'date_of_birth',
            'label': 'Date of Birth',
            'order': 10,
            'default': false,
            'category': 0,
            'maxWidth': 170,
            'minWidth': 170,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'address',
            'label': 'Address',
            'order': 11,
            'default': false,
            'category': 1,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'cnam_city',
            'label': 'City',
            'order': 12,
            'default': false,
            'category': 1,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'cnam_state',
            'label': 'State',
            'order': 13,
            'default': false,
            'category': 1,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'cnam_country',
            'label': 'Country',
            'order': 14,
            'default': false,
            'category': 1,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'cnam_zipcode',
            'label': 'Zip Code',
            'order': 15,
            'default': false,
            'category': 1,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'timezone',
            'label': 'Timezone',
            'order': 21,
            'default': false,
            'category': 1,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'tags',
            'label': 'Tags',
            'order': 24,
            'default': true,
            'category': 2,
            'minWidth': 200,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_count',
            'label': 'Unreads',
            'order': 34,
            'default': true,
            'category': 3,
            'maxWidth': 120,
            'minWidth': 120,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'campaigns',
            'label': 'Lines',
            'order': 35,
            'default': false,
            'category': 2,
            'minWidth': 170,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'broadcasts',
            'label': 'Broadcasts',
            'order': 37,
            'default': false,
            'category': 2,
            'minWidth': 170,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'contact_lists',
            'label': 'Contact Lists',
            'order': 38,
            'default': false,
            'category': 2,
            'maxWidth': 170,
            'minWidth': 170,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'id': '426108ce-7d6e-43e1-b13e-e406a9362db0',
            'name': 'actions',
            'label': 'Actions',
            'order': 40,
            'default': true,
            'maxWidth': 120,
            'minWidth': 120,
            'sortable': false,
            'draggable': false,
            'resizable': false
          }
        ],
        'filters': [],
        'order': 0,
        'is_default': false,
        'created_at': '2021-07-19 20:57:01',
        'updated_at': '2021-09-09 01:36:24',
        'deleted_at': null,
        'pivot': {
          'contact_id': 8,
          'contact_list_id': 5
        }
      },
      {
        'id': 6,
        'company_id': 7,
        'contact_folder_id': 1,
        'name': 'Anoosh test',
        'type': 1,
        'headers': [
          {
            'name': 'checkbox',
            'label': 'Checkbox',
            'sticky': true,
            'default': true
          },
          {
            'name': 'name',
            'label': 'Name',
            'default': true,
            'category': 0,
            'minWidth': 150,
            'required': true,
            'sortable': true,
            'draggable': false,
            'resizable': true
          },
          {
            'name': 'phone_number',
            'label': 'Phone Number',
            'default': true,
            'category': 0,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'tags',
            'label': 'Tags',
            'default': true,
            'category': 2,
            'minWidth': 200,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_count',
            'label': 'Unreads',
            'default': true,
            'category': 3,
            'maxWidth': 120,
            'minWidth': 120,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'created_at',
            'label': 'Date Added',
            'default': false,
            'category': 0,
            'maxWidth': 140,
            'minWidth': 140,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'date_of_birth',
            'label': 'Date of Birth',
            'default': false,
            'category': 0,
            'maxWidth': 140,
            'minWidth': 140,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'email',
            'label': 'Email',
            'default': false,
            'category': 0,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'first_name',
            'label': 'First Name',
            'default': false,
            'category': 0,
            'minWidth': 150,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'last_name',
            'label': 'Last Name',
            'default': false,
            'category': 0,
            'minWidth': 150,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'text_authorized_at',
            'label': 'TCPA Approved',
            'default': false,
            'category': 0,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'address',
            'label': 'Address',
            'default': false,
            'category': 1,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'cnam_city',
            'label': 'City',
            'default': false,
            'category': 1,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'cnam_country',
            'label': 'Country',
            'default': false,
            'category': 1,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'cnam_state',
            'label': 'State',
            'default': false,
            'category': 1,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'cnam_zipcode',
            'label': 'Zip Code',
            'default': false,
            'category': 1,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'timezone',
            'label': 'Timezone',
            'default': false,
            'category': 1,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'broadcasts',
            'label': 'Broadcast',
            'default': false,
            'category': 2,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'company_name',
            'label': 'Company Name',
            'default': false,
            'category': 2,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'contact_lists',
            'label': 'Contact List',
            'default': false,
            'category': 2,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'contact_owner',
            'label': 'Contact Owner',
            'default': false,
            'category': 2,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'initial_campaign_id',
            'label': 'Initial Line',
            'default': false,
            'category': 2,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'intake_source',
            'label': 'Intake Source',
            'default': false,
            'category': 2,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'lead_source',
            'label': 'Lead Source',
            'default': false,
            'category': 2,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'ring_groups',
            'label': 'Ring Group',
            'default': false,
            'category': 2,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'website',
            'label': 'Website',
            'default': false,
            'category': 2,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'communications_count',
            'label': 'Communications',
            'default': false,
            'category': 3,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'disposition_status',
            'label': 'Contact Disposition',
            'default': false,
            'category': 3,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'inbound_calls_count',
            'label': 'Inbound Calls',
            'default': false,
            'category': 3,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'inbound_communications_count',
            'label': 'Inbound Communications',
            'default': false,
            'category': 3,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'inbound_texts_count',
            'label': 'Inbound SMS',
            'default': false,
            'category': 3,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'last_engagement_at',
            'label': 'Last Engagement',
            'default': false,
            'category': 3,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'last_inbound_engagement_at',
            'label': 'Last Inbound Engagement',
            'default': false,
            'category': 3,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'last_outbound_engagement_at',
            'label': 'Last Outbound Engagement',
            'default': false,
            'category': 3,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'outbound_calls_count',
            'label': 'Outbound Calls',
            'default': false,
            'category': 3,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'outbound_communications_count',
            'label': 'Outbound Communications',
            'default': false,
            'category': 3,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'outbound_texts_count',
            'label': 'Outbound Texts',
            'default': false,
            'category': 3,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_missed_call_count',
            'label': 'Unread Missed Calls',
            'default': true,
            'category': 3,
            'maxWidth': 190,
            'minWidth': 190,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_voicemail_count',
            'label': 'Unread Voicemails',
            'default': true,
            'category': 3,
            'maxWidth': 175,
            'minWidth': 175,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'id': '426108ce-7d6e-43e1-b13e-e406a9362db0',
            'name': 'actions',
            'label': 'Actions',
            'default': true,
            'maxWidth': 120,
            'minWidth': 120,
            'sortable': false,
            'draggable': false,
            'resizable': false
          }
        ],
        'filters': [],
        'order': 0,
        'is_default': false,
        'created_at': '2021-07-21 17:50:24',
        'updated_at': '2021-08-06 16:13:53',
        'deleted_at': null,
        'pivot': {
          'contact_id': 8,
          'contact_list_id': 6
        }
      },
      {
        'id': 22,
        'company_id': 7,
        'contact_folder_id': 79,
        'name': 'My Static List',
        'type': 1,
        'headers': [
          {
            'name': 'checkbox',
            'label': 'Checkbox',
            'sticky': true,
            'default': true
          },
          {
            'name': 'name',
            'label': 'Name',
            'order': 0,
            'default': true,
            'category': 0,
            'minWidth': 150,
            'required': true,
            'sortable': true,
            'draggable': false,
            'resizable': true
          },
          {
            'name': 'phone_number',
            'label': 'Phone Number',
            'order': 3,
            'default': true,
            'category': 0,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'created_at',
            'label': 'Date Added',
            'order': 17,
            'default': true,
            'category': 0,
            'maxWidth': 140,
            'minWidth': 140,
            'required': true,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'last_engagement_at',
            'label': 'Last Engagement',
            'order': 18,
            'default': true,
            'category': 3,
            'required': true,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'tags',
            'label': 'Tags',
            'order': 24,
            'default': true,
            'category': 2,
            'minWidth': 200,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_missed_call_count',
            'label': 'Unread Missed Calls',
            'order': 32,
            'default': true,
            'category': 3,
            'maxWidth': 190,
            'minWidth': 190,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_voicemail_count',
            'label': 'Unread Voicemails',
            'order': 33,
            'default': true,
            'category': 3,
            'maxWidth': 175,
            'minWidth': 175,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_count',
            'label': 'Unread Messages',
            'order': 34,
            'default': true,
            'category': 3,
            'maxWidth': 170,
            'minWidth': 170,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'id': '426108ce-7d6e-43e1-b13e-e406a9362db0',
            'name': 'actions',
            'label': 'Actions',
            'order': 40,
            'default': true,
            'maxWidth': 120,
            'minWidth': 120,
            'sortable': false,
            'draggable': false,
            'resizable': false
          }
        ],
        'filters': [],
        'order': 0,
        'is_default': false,
        'created_at': '2021-08-31 20:07:05',
        'updated_at': '2021-08-31 20:07:05',
        'deleted_at': null,
        'pivot': {
          'contact_id': 8,
          'contact_list_id': 22
        }
      },
      {
        'id': 25,
        'company_id': 7,
        'contact_folder_id': 148,
        'name': 'My Static List 2',
        'type': 1,
        'headers': [
          {
            'name': 'checkbox',
            'label': 'Checkbox',
            'sticky': true,
            'default': true
          },
          {
            'name': 'name',
            'label': 'Name',
            'order': 0,
            'default': true,
            'category': 0,
            'minWidth': 150,
            'required': true,
            'sortable': true,
            'draggable': false,
            'resizable': true
          },
          {
            'name': 'phone_number',
            'label': 'Phone Number',
            'order': 3,
            'default': true,
            'category': 0,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'created_at',
            'label': 'Date Added',
            'order': 17,
            'default': true,
            'category': 0,
            'maxWidth': 140,
            'minWidth': 140,
            'required': true,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'last_engagement_at',
            'label': 'Last Engagement',
            'order': 18,
            'default': true,
            'category': 3,
            'required': true,
            'sortable': true,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'tags',
            'label': 'Tags',
            'order': 24,
            'default': true,
            'category': 2,
            'minWidth': 200,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_missed_call_count',
            'label': 'Unread Missed Calls',
            'order': 32,
            'default': true,
            'category': 3,
            'maxWidth': 190,
            'minWidth': 190,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_voicemail_count',
            'label': 'Unread Voicemails',
            'order': 33,
            'default': true,
            'category': 3,
            'maxWidth': 175,
            'minWidth': 175,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'name': 'unread_count',
            'label': 'Unread Messages',
            'order': 34,
            'default': true,
            'category': 3,
            'maxWidth': 170,
            'minWidth': 170,
            'sortable': false,
            'draggable': true,
            'resizable': true
          },
          {
            'id': '426108ce-7d6e-43e1-b13e-e406a9362db0',
            'name': 'actions',
            'label': 'Actions',
            'order': 40,
            'default': true,
            'maxWidth': 120,
            'minWidth': 120,
            'sortable': false,
            'draggable': false,
            'resizable': false
          }
        ],
        'filters': [],
        'order': 0,
        'is_default': false,
        'created_at': '2021-09-06 23:45:49',
        'updated_at': '2021-09-07 22:27:16',
        'deleted_at': null,
        'pivot': {
          'contact_id': 8,
          'contact_list_id': 25
        }
      }
    ],
    'ring_groups': [],
    'tags': [
      {
        'id': 1968,
        'name': '100 Contacts',
        'description': null,
        'color': '#409EFF',
        'category': 1,
        'type': 1
      },
      {
        'id': 1972,
        'name': '1000 Contacts',
        'description': null,
        'color': 'rgb(251, 227, 56)',
        'category': 1,
        'type': 1
      },
      {
        'id': 2019,
        'name': 'HubSpot list: Unassigned Contacts',
        'description': null,
        'color': '#FF8DDD',
        'category': 1,
        'type': 3
      }
    ],
    'last_communication': {
      'id': 47339,
      'company_id': 7,
      'campaign_id': 497,
      'ring_group_id': null,
      'owner_id': null,
      'workflow_id': null,
      'sequence_id': null,
      'broadcast_id': 155,
      'creator_type': 4,
      'incoming_number_id': 2073,
      'incoming_number': '+18053293047',
      'incoming_sip_uri': null,
      'contact_id': 8,
      'call_disposition_id': null,
      'lead_number': '+18182809451',
      'is_international': false,
      'target_users': null,
      'attempt': null,
      'attempting_users': null,
      'user_id': null,
      'destination_number': '',
      'transfer_prior_user_ids': null,
      'transferred_from': null,
      'transfer_target_user_ids': null,
      'transferred_to': null,
      'in_cold_transfer': false,
      'proxy_number_id': null,
      'forward_sid': null,
      'direction': 2,
      'type': 2,
      'call_router_behavior': null,
      'is_read': true,
      'recording_url': null,
      'recorded_file_is_migrated': false,
      'voicemail_url': null,
      'voicemail_is_migrated': false,
      'voicemail_duration': null,
      'sid': 'SM05a3608dacc843a79d0cc39f3658adf8',
      'customer_leg_sid': null,
      'customer_leg_status': null,
      'agent_leg_sid': 'SM05a3608dacc843a79d0cc39f3658adf8',
      'agent_leg_status': 14,
      'legc_uuid': null,
      'legc_status': null,
      'legz_uuid': null,
      'legz_status': null,
      'conference_sid': null,
      'first_time_caller': 1,
      'body': '1',
      'attachments': null,
      'conference_status': null,
      'conference_status2': null,
      'current_status': 'delivered',
      'current_status2': 13,
      'disposition_status': 'completed',
      'disposition_status2': 4,
      'resolution': 'normal',
      'resolution2': 1,
      'queue_resolution': null,
      'queue_resolution2': null,
      'callback_status': null,
      'transfer_type': null,
      'rejected_by_app': 0,
      'duration': 1,
      'hold_time': 0,
      'talk_time': 0,
      'wait_time': 0,
      'csat_score': 0,
      'provider_cost': '0.000000',
      'notes': null,
      'country': 'US',
      'state': 'CA',
      'city': '',
      'customer_leg_called_at': null,
      'customer_leg_transferred_at': null,
      'customer_leg_hangup_at': null,
      'agent_leg_called_at': null,
      'agent_leg_transferred_at': null,
      'agent_leg_hangup_at': null,
      'conference_start_at': null,
      'conference_end_at': null,
      'hold_at': null,
      'should_broadcast': true,
      'metadata': null,
      'engagement_data': null,
      'created_at': '2021-09-03 17:15:15',
      'updated_at': '2021-09-03 17:15:17',
      'deleted_at': null,
      'is_migrated': 0
    }
  }
]
