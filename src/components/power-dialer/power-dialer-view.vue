<template>
  <PowerDialerViewScreen>

    <template slot="title">
      <div class="row d-flex py-2">
        <div class="d-flex flex-column">
          <!-- <div class="pr-2">LOL</div> -->
          <div class="small text-muted pt-1">
            Outbound Sales / Google Map Scaping /
          </div>
        </div>
        <div class="px-2 py-0">
          <ListIcon />
        </div>
        Chicago
      </div>
    </template>

    <template slot="options">
      <div class="pr-5">
        99 Contacts
      </div>
      <StartDialOptions />
      <AddContacts />
    </template>

    <template slot="table">
      <div>
        <b-card class="border-0 text-center">
          <div class="t-grouped-buttons">

            <router-link
              v-for="(filter, key) in listFilters"
              :key="key"
              :to="`${activeRoute}/${filter.id}`"
              class="link px-1">
              <div :class="`t-grouped-buttons__btn ${id === filter.id ? 'active' : ''}`">
                <div class="t-badge-name">
                  {{ filter.name }}
                </div>
                <div class="t__badge">
                  999+
                </div>
              </div>
            </router-link>

          </div>
        </b-card>
        <b-container fluid class="bv-example-row m-0 p-0">
          <b-row class="pr-2">
            <b-col class="p-0 pr-2 m-0">
              <div class="d-flex">

                <SearchList
                  class="width-250" />
                <SummaryInfoLabels />

              </div>
            </b-col>
            <b-col col lg="4" class="p-0 m-0">
              <div class="px-0 d-flex align-items-center float-right">

                <b-dropdown
                  text="..."
                  no-caret
                  right size="sm"
                  variant="white"
                  class="m-0 p-0 pr-2 b-compact-dropdown-button text-bold">
                  <b-dropdown-item href="#">
                    <i class="fa fa-search mr-1"></i> Select Contact
                  </b-dropdown-item>
                  <b-dropdown-item href="#" v-b-modal:create-contact-modal>
                    <i class="fa fa-plus mr-1"></i>
                    Create Contact
                  </b-dropdown-item>
                </b-dropdown>

                <q-btn
                  no-caps
                  unelevated
                  size="sm"
                  color="primary"
                  class="px-2">
                  Add Contacts
                </q-btn>

              </div>
            </b-col>
          </b-row>
        </b-container>
        <div class="pr-2">

          <Datatable
            :stickyHeaders="true"
            :columns="columns"
            :has-more="true">
            <template slot="tbody">
              <TableRow
                v-for="(contact, key) in contactResources"
                :key="contact.id + key"
                :contact="contact"
                :columns="columns"
                :checked="checked"
                :contactListId="id"
                @checked="onCheckedRows" />
            </template>
          </Datatable>

        </div>
      </div>
    </template>
  </PowerDialerViewScreen>
</template>

<script>

import { mapState, mapGetters } from 'vuex'
import ListIcon from 'components/icons/list-icon'
import PowerDialerViewScreen from './power-dialer-view-screen'
import StartDialOptions from './activities/start-dial-options'
import SummaryInfoLabels from './details/summary-info-labels'
import Datatable from 'src/components/datatable'
import TableRow from 'src/components/table-row'
import SearchList from 'src/components/search'
import AddContacts from './session-settings/add-contacts-sessions-settings'
import { DEFAULT_LIST, ALL_COLUMNS } from 'src/constants/power-dialer/power-dialer-list'

export default {
  name: 'PowerDialerView',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  components: {
    PowerDialerViewScreen,
    StartDialOptions,
    Datatable,
    SearchList,
    SummaryInfoLabels,
    AddContacts,
    TableRow,
    ListIcon
  },
  computed: {
    ...mapState(['prevRoute']),
    ...mapGetters('powerDialer', [
      'contactResources'
    ]),
    listFilters () {
      return DEFAULT_LIST
    },
    columns () {
      return ALL_COLUMNS
    },
    activeFilter () {
      if (this.$router.currentRoute.params.id) {
        return this.$router.currentRoute.params.id
      }
      return ''
    },
    activeRoute () {
      if (this.$route.name === 'Power Dialer Individual') {
        return this.$route.fullPath
      } else if (this.$route.name === 'Power Dialer Individual Advance') {
        return `/power-dialer/list/${this.$route.params.id}`
      }
      return '/power-dialer/list'
    }
  },
  data () {
    return {
      checked: [],
      tempListItems: [
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
        }
      ]
    }
  },
  methods: {
    processedLink (id = '') {
      return `${this.activeRoute.fullPath}/${id}`
    },
    onCheckedRows (data) {
      console.log('data from table : ', data)
    }
  }
}
</script>
