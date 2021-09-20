import { TEST_DATA } from 'src/constants/power-dialer/power-dialer-list'

export default {
  opened: (state) => new Set(state.opened),
  filters: (state) => state.filters,
  moveDialog: (state) => state.moveDialog,
  createList: (state) => state.createList,
  isRemoveListOpen: (state) => !!state.removeList,
  pinned: (state) => state.pinned,
  selectedContacts: (state) => state.selectedContacts,
  powerDialerList: (state) => {
    /**
     * TEMPORARY VALUES
     */
    let list = [
      {
        'id': 142,
        'company_id': 7,
        'parent_id': null,
        'created_by': 734,
        'contact_folder_access_id': 136,
        'name': 'Root',
        'order': 0,
        'created_at': '2021-08-23 19:28:35',
        'updated_at': '2021-08-23 19:28:35',
        'deleted_at': null,
        'has_edit': 1,
        'has_delete': 1,
        'child_folders': [
          {
            'id': 145,
            'company_id': 7,
            'parent_id': 142,
            'created_by': 734,
            'contact_folder_access_id': 136,
            'name': 'Outbound Sales',
            'order': -1629916617,
            'created_at': '2021-08-25 18:36:58',
            'updated_at': '2021-08-25 18:36:58',
            'deleted_at': null,
            'child_folders': [
              {
                'id': 211,
                'company_id': 7,
                'parent_id': 142,
                'created_by': 734,
                'contact_folder_access_id': 136,
                'name': 'Google Map Scrapping 1',
                'order': -1629916617,
                'created_at': '2021-08-25 18:36:58',
                'updated_at': '2021-08-25 18:36:58',
                'deleted_at': null,
                'child_folders': [],
                'lists': [
                  {
                    'id': 565,
                    'company_id': 7,
                    'contact_folder_id': 145,
                    'name': 'Untitled List',
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
                        'minWidth': 225,
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
                    'created_at': '2021-08-25 18:37:14',
                    'updated_at': '2021-08-25 18:37:14',
                    'deleted_at': null
                  },
                  {
                    'id': 88,
                    'company_id': 7,
                    'contact_folder_id': 145,
                    'name': 'Chicago',
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
                        'minWidth': 225,
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
                    'created_at': '2021-08-25 18:37:14',
                    'updated_at': '2021-08-25 18:37:14',
                    'deleted_at': null
                  },
                  {
                    'id': 89,
                    'company_id': 7,
                    'contact_folder_id': 145,
                    'name': 'Important Contacts',
                    'type': 2,
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
                        'minWidth': 225,
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
                    'created_at': '2021-08-25 18:37:14',
                    'updated_at': '2021-08-25 18:37:14',
                    'deleted_at': null
                  }
                ]
              }
            ],
            'lists': [
              {
                'id': 878,
                'company_id': 7,
                'contact_folder_id': 145,
                'name': 'Google Map Scrapping 2',
                'type': 2,
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
                    'minWidth': 225,
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
                'created_at': '2021-08-25 18:37:14',
                'updated_at': '2021-08-25 18:37:14',
                'deleted_at': null
              }
            ]
          },
          {
            'id': 144,
            'company_id': 7,
            'parent_id': 142,
            'created_by': 734,
            'contact_folder_access_id': 136,
            'name': 'Company Wide Outbound Sales',
            'order': -1629915003,
            'created_at': '2021-08-25 18:10:04',
            'updated_at': '2021-08-25 18:10:04',
            'deleted_at': null,
            'child_folders': [],
            'lists': [
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
                    'minWidth': 225,
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
                'deleted_at': null
              }
            ]
          }
        ],
        'lists': []
      }
    ]
    return list
  },
  contactResources: (state) => {
    // return state.contactResources
    return TEST_DATA
  }
}
