<template>
  <div v-if="integration_data"
       class="hubspot-integration-wrapper">

    <q-card class="my-card" flat bordered>
      <q-item>

        <q-item-section>
          <b-link class="ml-2" :href="integration_data['profile-url']">
            <i class="fab fa-hubspot hubspot-icon mr-3"></i> <span class="integration-title">Hubspot</span>
          </b-link>
        </q-item-section>
      </q-item>

      <q-separator />

      <q-card-section>
          <p class="mb-0" v-if="integration_data.properties.firstname && integration_data.properties.lastname">
             <span class="data-icon-label">
              Name:
            </span>
            <span class="data-value" v-b-tooltip="integration_data.properties.firstname.value + ' ' + integration_data.properties.lastname.value">
              {{ integration_data.properties.firstname.value + ' ' + integration_data.properties.lastname.value }}
            </span>
          </p>
          <p class="mb-0" v-if="integration_data.properties.email">
            <span class="data-icon-label">
              Email:
            </span>
            <span class="data-value" v-b-tooltip="integration_data.properties.email.value">
              {{ integration_data.properties.email.value }}
            </span>
          </p>
          <p class="mb-0" v-if="integration_data.properties.company">
             <span class="data-icon-label">
              Company:
            </span>
            <span class="data-value" v-b-tooltip="integration_data.properties.company.value">
              {{ integration_data.properties.company.value }}
            </span>
          </p>
          <p class="mb-0" v-if="integration_data.properties.hubspot_owner">
             <span class="data-icon-label">
              Owner:
            </span>
            <span class="data-value" v-b-tooltip="integration_data.properties.hubspot_owner.firstName + ' ' + integration_data.properties.hubspot_owner.lastName">
              {{ integration_data.properties.hubspot_owner.firstName + ' ' + integration_data.properties.hubspot_owner.lastName }}
            </span>
          </p>
        </q-card-section>

      <q-card-section horizontal>
        <q-card class="my-card mr-3 ml-3 deals" flat bordered v-for="(deal, index) in integration_data.properties.deals" :key="index">
          <q-card-section horizontal>
            <q-card-section class="pl-2 pr-2">
                <h6><b-link class="deals-title" :href="hubspotContactBaseLink() + 'deal/' + deal.dealId" target="_blank">{{ deal.properties.dealname.value }}</b-link></h6>
                <p class="mb-0">
                  <span class="data-icon-label">Amount: </span>
                  <span class="data-value" v-b-tooltip="$options.filters.toCurrency(deal.properties.amount.value)">{{ deal.properties.amount.value | toCurrency }}</span>
                </p>
                <p class="mb-0">
                  <span class="data-icon-label">Pipeline: </span>
                  <span class="data-value" v-b-tooltip="deal.properties.pipeline.label">{{ deal.properties.pipeline.label }}</span>
                </p>
                <p class="mb-0">
                  <span class="data-icon-label">Stage: </span>
                  <span class="data-value" v-b-tooltip="deal.properties.dealstage.label">{{ deal.properties.dealstage.label }}</span>
                </p>
            </q-card-section>
          </q-card-section>
        </q-card>
      </q-card-section>
      <q-card-section>
        <b-row>
          <b-button class="text-white text-uppercase btn-block"
                    size="sm"
                    variant="warning"
                    tabindex="0"
                    id="btn-workflow-enroll">
            <i class="fa fa-user-plus"></i>
            Enroll to Workflow
          </b-button>
        </b-row>
      </q-card-section>
    </q-card>
    <b-popover custom-class="workflow-enroll-popover"
               id="hubspot-workflow-popover"
               target="btn-workflow-enroll"
               triggers="click">
      <workflow-selector @onWorkflowSelected="onWorkflowSelected"/>
      <b-button class="btn-block"
                size="sm"
                variant="primary"
                :disabled="isEnrolling || !isWorkflowValid"
                @click.prevent="enrollToWorkflow"
      >
        <q-spinner-bars v-if="isEnrolling" color="white" />
        {{ isEnrolling ? 'Enrolling...' : 'Enroll' }}
      </b-button>
    </b-popover>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import WorkflowSelector from 'src/components/integrations/workflow-selector'
export default {
  name: 'integration-hubspot',
  components: { WorkflowSelector },
  props: {
    dialer_mode: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    ...mapGetters('contacts', ['contact']),
    ...mapState(['currentCompany']),
    isWorkflowValid () {
      return this.workflow.id
    }
  },
  data () {
    return {
      isEnrolling: false,
      integration_name: 'hubspot',
      showWorkflowEnrollForm: true,
      workflow: {
        email: null,
        id: null
      },
      integration_data: {
        'vid': 189201,
        'canonical-vid': 189201,
        'merged-vids': [],
        'portal-id': 8446098,
        'is-contact': true,
        'properties': {
          'zip': {
            'value': '91506',
            'versions': [{
              'value': '91506',
              'source-type': 'INTEGRATION',
              'source-id': '184991',
              'source-label': null,
              'updated-by-user-id': null,
              'timestamp': 1620921589261,
              'selected': false
            }]
          },
          'country': {
            'value': 'US',
            'versions': [{
              'value': 'US',
              'source-type': 'INTEGRATION',
              'source-id': '184991',
              'source-label': null,
              'updated-by-user-id': null,
              'timestamp': 1620921589261,
              'selected': false
            }]
          },
          'website': {
            'value': 'https:aloware.com',
            'versions': [{
              'value': 'https:aloware.com',
              'source-type': 'INTEGRATION',
              'source-id': '184991',
              'source-label': null,
              'updated-by-user-id': null,
              'timestamp': 1620921589261,
              'selected': false
            }]
          },
          'firstname': {
            'value': 'Sohrab',
            'versions': [{
              'value': 'Sohrab',
              'source-type': 'INTEGRATION',
              'source-id': '184991',
              'source-label': null,
              'updated-by-user-id': null,
              'timestamp': 1620921589261,
              'selected': false
            }]
          },
          'city': {
            'value': 'Alhambra',
            'versions': [{
              'value': 'Alhambra',
              'source-type': 'INTEGRATION',
              'source-id': '184991',
              'source-label': null,
              'updated-by-user-id': null,
              'timestamp': 1620921589261,
              'selected': false
            }]
          },
          'lastmodifieddate': {
            'value': '1625007949023',
            'versions': [{
              'value': '1625007949023',
              'source-type': 'CALCULATED',
              'source-id': null,
              'source-label': null,
              'updated-by-user-id': null,
              'timestamp': 1625007949023,
              'selected': false
            }]
          },
          'lastname': {
            'value': 'Cell',
            'versions': [{
              'value': 'Cell',
              'source-type': 'INTEGRATION',
              'source-id': '184991',
              'source-label': null,
              'updated-by-user-id': null,
              'timestamp': 1620928966846,
              'selected': false
            }, {
              'value': 'Cell 2',
              'source-type': 'INTEGRATION',
              'source-id': '184991',
              'source-label': null,
              'updated-by-user-id': null,
              'timestamp': 1620928956427,
              'selected': false
            }, {
              'value': 'Cell',
              'source-type': 'INTEGRATION',
              'source-id': '184991',
              'source-label': null,
              'updated-by-user-id': null,
              'timestamp': 1620921589261,
              'selected': false
            }]
          },
          'hubspot_owner_id': {
            'value': '50963901',
            'versions': [{
              'value': '50963901',
              'source-type': 'INTEGRATION',
              'source-id': '184991',
              'source-label': null,
              'updated-by-user-id': null,
              'timestamp': 1620921589261,
              'selected': false
            }]
          },
          'phone': {
            'value': '+14243942058',
            'versions': [{
              'value': '+14243942058',
              'source-type': 'INTEGRATION',
              'source-id': '184991',
              'source-label': null,
              'updated-by-user-id': null,
              'timestamp': 1620921589261,
              'selected': false
            }]
          },
          'hs_lead_status': {
            'value': 'OPEN',
            'versions': [{
              'value': 'OPEN',
              'source-type': 'INTEGRATION',
              'source-id': '184991',
              'source-label': null,
              'updated-by-user-id': null,
              'timestamp': 1620921589261,
              'selected': false
            }]
          },
          'company': {
            'value': 'Aloware',
            'versions': [{
              'value': 'Aloware',
              'source-type': 'INTEGRATION',
              'source-id': '184991',
              'source-label': null,
              'updated-by-user-id': null,
              'timestamp': 1620921589261,
              'selected': false
            }]
          },
          'state': {
            'value': 'CA',
            'versions': [{
              'value': 'CA',
              'source-type': 'INTEGRATION',
              'source-id': '184991',
              'source-label': null,
              'updated-by-user-id': null,
              'timestamp': 1620921589261,
              'selected': false
            }]
          },
          'hs_calculated_phone_number': {
            'value': '+14243942058',
            'versions': [{
              'value': '+14243942058',
              'source-type': 'CALCULATED',
              'source-id': null,
              'source-label': null,
              'updated-by-user-id': null,
              'timestamp': 1620921589261,
              'selected': false
            }]
          },
          'email': {
            'value': 'sohrab@aloware.com',
            'versions': [{
              'value': 'sohrab@aloware.com',
              'source-type': 'INTEGRATION',
              'source-id': '185969',
              'source-label': null,
              'updated-by-user-id': null,
              'timestamp': 1623793690453,
              'selected': false
            }, {
              'value': 'sohrab+resellercompany@aloware.com',
              'source-type': 'INTEGRATION',
              'source-id': '184991',
              'source-label': null,
              'updated-by-user-id': null,
              'timestamp': 1620921589283,
              'selected': false
            }]
          },
          'hubspot_owner': {
            'portalId': 8446098,
            'ownerId': 50963901,
            'type': 'PERSON',
            'firstName': 'Sohrab',
            'lastName': 'Sheikhani',
            'email': 'sohrab@aloware.com',
            'createdAt': 1599848427187,
            'updatedAt': 1617065360688,
            'remoteList': [{
              'id': 37701800,
              'portalId': 8446098,
              'ownerId': 50963901,
              'remoteId': '5906413',
              'remoteType': 'HUBSPOT',
              'active': true
            }],
            'hasContactsAccess': false,
            'activeUserId': 5906413,
            'userIdIncludingInactive': 5906413,
            'activeSalesforceId': null,
            'isActive': true
          },
          'deals': [{
            'portalId': 8446098,
            'dealId': 3511925690,
            'isDeleted': false,
            'associations': {
              'associatedVids': [189201],
              'associatedCompanyIds': [],
              'associatedDealIds': [],
              'associatedTicketIds': [457158954, 457136531]
            },
            'properties': {
              'hs_closed_amount_in_home_currency': {
                'value': '0',
                'timestamp': 1606267856122,
                'source': 'CALCULATED',
                'sourceId': null,
                'updatedByUserId': null,
                'versions': [{
                  'name': 'hs_closed_amount_in_home_currency',
                  'value': '0',
                  'timestamp': 1606267856122,
                  'source': 'CALCULATED',
                  'sourceVid': []
                }]
              },
              'dealname': {
                'value': 'Million Dollar Deal',
                'timestamp': 1606267856122,
                'source': 'CRM_UI',
                'sourceId': 'userId:5906413',
                'updatedByUserId': 5906413,
                'versions': [{
                  'name': 'dealname',
                  'value': 'Million Dollar Deal',
                  'timestamp': 1606267856122,
                  'sourceId': 'userId:5906413',
                  'source': 'CRM_UI',
                  'sourceVid': [],
                  'updatedByUserId': 5906413
                }]
              },
              'num_associated_contacts': {
                'value': '1',
                'timestamp': 1623345541219,
                'source': 'CALCULATED',
                'sourceId': 'RollupProperties',
                'updatedByUserId': null,
                'versions': [{
                  'name': 'num_associated_contacts',
                  'value': '1',
                  'timestamp': 1623345541219,
                  'sourceId': 'RollupProperties',
                  'source': 'CALCULATED',
                  'sourceVid': []
                }]
              },
              'hs_forecast_amount': {
                'value': '1000000',
                'timestamp': 1610737765195,
                'source': 'CALCULATED',
                'sourceId': null,
                'updatedByUserId': null,
                'versions': [{
                  'name': 'hs_forecast_amount',
                  'value': '1000000',
                  'timestamp': 1610737765195,
                  'source': 'CALCULATED',
                  'sourceVid': []
                }]
              },
              'createdate': {
                'value': '1606267688868',
                'timestamp': 1606267856122,
                'source': 'CRM_UI',
                'sourceId': 'userId:5906413',
                'updatedByUserId': 5906413,
                'versions': [{
                  'name': 'createdate',
                  'value': '1606267688868',
                  'timestamp': 1606267856122,
                  'sourceId': 'userId:5906413',
                  'source': 'CRM_UI',
                  'sourceVid': [],
                  'updatedByUserId': 5906413
                }]
              },
              'hs_is_closed': {
                'value': 'false',
                'timestamp': 1606267856122,
                'source': 'CALCULATED',
                'sourceId': null,
                'updatedByUserId': null,
                'versions': [{
                  'name': 'hs_is_closed',
                  'value': 'false',
                  'timestamp': 1606267856122,
                  'source': 'CALCULATED',
                  'sourceVid': []
                }]
              },
              'amount_in_home_currency': {
                'value': '1000000',
                'timestamp': 1610737765195,
                'source': 'CALCULATED',
                'sourceId': null,
                'updatedByUserId': null,
                'versions': [{
                  'name': 'amount_in_home_currency',
                  'value': '1000000',
                  'timestamp': 1610737765195,
                  'source': 'CALCULATED',
                  'sourceVid': []
                }]
              },
              'hs_deal_stage_probability': {
                'value': '0.200000000000000011102230246251565404236316680908203125',
                'timestamp': 1606267856122,
                'source': 'CALCULATED',
                'sourceId': null,
                'updatedByUserId': null,
                'versions': [{
                  'name': 'hs_deal_stage_probability',
                  'value': '0.200000000000000011102230246251565404236316680908203125',
                  'timestamp': 1606267856122,
                  'source': 'CALCULATED',
                  'sourceVid': []
                }]
              },
              'days_to_close': {
                'value': '6',
                'timestamp': 1606267856122,
                'source': 'CALCULATED',
                'sourceId': null,
                'updatedByUserId': null,
                'versions': [{
                  'name': 'days_to_close',
                  'value': '6',
                  'timestamp': 1606267856122,
                  'source': 'CALCULATED',
                  'sourceVid': []
                }]
              },
              'hs_deal_stage_probability_shadow': {
                'value': '0.200000000000000011102230246251565404236316680908203125',
                'timestamp': 1623793711769,
                'source': 'CALCULATED',
                'sourceId': 'CalculatedPropertyComputer',
                'updatedByUserId': null,
                'versions': [{
                  'name': 'hs_deal_stage_probability_shadow',
                  'value': '0.200000000000000011102230246251565404236316680908203125',
                  'timestamp': 1623793711769,
                  'sourceId': 'CalculatedPropertyComputer',
                  'source': 'CALCULATED',
                  'sourceVid': []
                }]
              },
              'hubspot_owner_id': {
                'value': '50963901',
                'timestamp': 1606267856122,
                'source': 'CRM_UI',
                'sourceId': 'userId:5906413',
                'updatedByUserId': 5906413,
                'versions': [{
                  'name': 'hubspot_owner_id',
                  'value': '50963901',
                  'timestamp': 1606267856122,
                  'sourceId': 'userId:5906413',
                  'source': 'CRM_UI',
                  'sourceVid': [],
                  'updatedByUserId': 5906413
                }]
              },
              'hs_closed_amount': {
                'value': '0',
                'timestamp': 1606267856122,
                'source': 'CALCULATED',
                'sourceId': null,
                'updatedByUserId': null,
                'versions': [{
                  'name': 'hs_closed_amount',
                  'value': '0',
                  'timestamp': 1606267856122,
                  'source': 'CALCULATED',
                  'sourceVid': []
                }]
              },
              'num_contacted_notes': {
                'value': '223',
                'timestamp': 1625007935047,
                'source': 'ENGAGEMENTS',
                'sourceId': 'ObjectPropertyUpdater',
                'updatedByUserId': null,
                'versions': [{
                  'name': 'num_contacted_notes',
                  'value': '223',
                  'timestamp': 1625007935047,
                  'sourceId': 'ObjectPropertyUpdater',
                  'source': 'ENGAGEMENTS',
                  'sourceVid': []
                }]
              },
              'hs_analytics_source': {
                'value': 'OFFLINE',
                'timestamp': 1623345540886,
                'source': 'DEALS',
                'sourceId': 'deal sync triggered by vid=189201',
                'updatedByUserId': null,
                'versions': [{
                  'name': 'hs_analytics_source',
                  'value': 'OFFLINE',
                  'timestamp': 1623345540886,
                  'sourceId': 'deal sync triggered by vid=189201',
                  'source': 'DEALS',
                  'sourceVid': []
                }]
              },
              'hs_created_by_user_id': {
                'value': '5906413',
                'timestamp': 1606267856122,
                'source': 'CONTACTS',
                'sourceId': 'CRM_UI',
                'updatedByUserId': 5906413,
                'versions': [{
                  'name': 'hs_created_by_user_id',
                  'value': '5906413',
                  'timestamp': 1606267856122,
                  'sourceId': 'CRM_UI',
                  'source': 'CONTACTS',
                  'sourceVid': [],
                  'updatedByUserId': 5906413
                }]
              },
              'hs_createdate': {
                'value': '1606267856122',
                'timestamp': 1606267856122,
                'source': 'CONTACTS',
                'sourceId': 'CRM_UI',
                'updatedByUserId': 5906413,
                'versions': [{
                  'name': 'hs_createdate',
                  'value': '1606267856122',
                  'timestamp': 1606267856122,
                  'sourceId': 'CRM_UI',
                  'source': 'CONTACTS',
                  'sourceVid': [],
                  'updatedByUserId': 5906413
                }]
              },
              'hs_projected_amount': {
                'value': '200000.000000000011102230246251565404236316680908203125000000',
                'timestamp': 1610737765195,
                'source': 'CALCULATED',
                'sourceId': null,
                'updatedByUserId': null,
                'versions': [{
                  'name': 'hs_projected_amount',
                  'value': '200000.000000000011102230246251565404236316680908203125000000',
                  'timestamp': 1610737765195,
                  'source': 'CALCULATED',
                  'sourceVid': []
                }]
              },
              'hs_all_owner_ids': {
                'value': '50963901',
                'timestamp': 1606267856122,
                'source': 'CONTACTS',
                'sourceId': 'CRM_UI',
                'updatedByUserId': 5906413,
                'versions': [{
                  'name': 'hs_all_owner_ids',
                  'value': '50963901',
                  'timestamp': 1606267856122,
                  'sourceId': 'CRM_UI',
                  'source': 'CONTACTS',
                  'sourceVid': [],
                  'updatedByUserId': 5906413
                }]
              },
              'hs_projected_amount_in_home_currency': {
                'value': '200000.000000000011102230246251565404236316680908203125000000',
                'timestamp': 1610737765195,
                'source': 'CALCULATED',
                'sourceId': null,
                'updatedByUserId': null,
                'versions': [{
                  'name': 'hs_projected_amount_in_home_currency',
                  'value': '200000.000000000011102230246251565404236316680908203125000000',
                  'timestamp': 1610737765195,
                  'source': 'CALCULATED',
                  'sourceVid': []
                }]
              },
              'dealtype': {
                'value': 'newbusiness',
                'timestamp': 1606267856122,
                'source': 'CRM_UI',
                'sourceId': 'userId:5906413',
                'updatedByUserId': 5906413,
                'versions': [{
                  'name': 'dealtype',
                  'value': 'newbusiness',
                  'timestamp': 1606267856122,
                  'sourceId': 'userId:5906413',
                  'source': 'CRM_UI',
                  'sourceVid': [],
                  'updatedByUserId': 5906413
                }]
              },
              'notes_last_updated': {
                'value': '1625007915000',
                'timestamp': 1625007935047,
                'source': 'ENGAGEMENTS',
                'sourceId': 'ObjectPropertyUpdater',
                'updatedByUserId': null,
                'versions': [{
                  'name': 'notes_last_updated',
                  'value': '1625007915000',
                  'timestamp': 1625007935047,
                  'sourceId': 'ObjectPropertyUpdater',
                  'source': 'ENGAGEMENTS',
                  'sourceVid': []
                }]
              },
              'hs_is_closed_won': {
                'value': 'false',
                'timestamp': 1616216577611,
                'source': 'MIGRATION',
                'sourceId': 'RecalculateCalculatedPropertiesHelper',
                'updatedByUserId': null,
                'versions': [{
                  'name': 'hs_is_closed_won',
                  'value': 'false',
                  'timestamp': 1616216577611,
                  'sourceId': 'RecalculateCalculatedPropertiesHelper',
                  'source': 'MIGRATION',
                  'sourceVid': []
                }]
              },
              'amount': {
                'value': '1000000',
                'timestamp': 1610737765195,
                'source': 'CRM_UI',
                'sourceId': 'userId:5906413',
                'updatedByUserId': 5906413,
                'versions': [{
                  'name': 'amount',
                  'value': '1000000',
                  'timestamp': 1610737765195,
                  'sourceId': 'userId:5906413',
                  'source': 'CRM_UI',
                  'sourceVid': [],
                  'updatedByUserId': 5906413
                }]
              },
              'closedate': {
                'value': '1606786088868',
                'timestamp': 1606267856122,
                'source': 'CRM_UI',
                'sourceId': 'userId:5906413',
                'updatedByUserId': 5906413,
                'versions': [{
                  'name': 'closedate',
                  'value': '1606786088868',
                  'timestamp': 1606267856122,
                  'sourceId': 'userId:5906413',
                  'source': 'CRM_UI',
                  'sourceVid': [],
                  'updatedByUserId': 5906413
                }]
              },
              'aloware_deal_link': {
                'value': 'https:app.alodev.org',
                'timestamp': 1608688408731,
                'source': 'CRM_UI',
                'sourceId': 'userId:5906413',
                'updatedByUserId': 5906413,
                'versions': [{
                  'name': 'aloware_deal_link',
                  'value': 'https:app.alodev.org',
                  'timestamp': 1608688408731,
                  'sourceId': 'userId:5906413',
                  'source': 'CRM_UI',
                  'sourceVid': [],
                  'updatedByUserId': 5906413
                }]
              },
              'hs_user_ids_of_all_owners': {
                'value': '5906413',
                'timestamp': 1606267856122,
                'source': 'CONTACTS',
                'sourceId': 'CRM_UI',
                'updatedByUserId': 5906413,
                'versions': [{
                  'name': 'hs_user_ids_of_all_owners',
                  'value': '5906413',
                  'timestamp': 1606267856122,
                  'sourceId': 'CRM_UI',
                  'source': 'CONTACTS',
                  'sourceVid': [],
                  'updatedByUserId': 5906413
                }]
              },
              'pipeline': {
                'value': 'default',
                'timestamp': 1610736854971,
                'source': 'CRM_UI',
                'sourceId': 'userId:5906413',
                'updatedByUserId': 5906413,
                'versions': [{
                  'name': 'pipeline',
                  'value': 'default',
                  'timestamp': 1610736854971,
                  'sourceId': 'userId:5906413',
                  'source': 'CRM_UI',
                  'sourceVid': [],
                  'updatedByUserId': 5906413
                }],
                'label': 'Sales Pipeline'
              },
              'hs_lastmodifieddate': {
                'value': '1625007935421',
                'timestamp': 1625007935421,
                'source': 'CALCULATED',
                'sourceId': null,
                'updatedByUserId': null,
                'versions': [{
                  'name': 'hs_lastmodifieddate',
                  'value': '1625007935421',
                  'timestamp': 1625007935421,
                  'source': 'CALCULATED',
                  'sourceVid': []
                }]
              },
              'notes_last_contacted': {
                'value': '1625007915000',
                'timestamp': 1625007935047,
                'source': 'ENGAGEMENTS',
                'sourceId': 'ObjectPropertyUpdater',
                'updatedByUserId': null,
                'versions': [{
                  'name': 'notes_last_contacted',
                  'value': '1625007915000',
                  'timestamp': 1625007935047,
                  'sourceId': 'ObjectPropertyUpdater',
                  'source': 'ENGAGEMENTS',
                  'sourceVid': []
                }]
              },
              'hubspot_owner_assigneddate': {
                'value': '1606267856122',
                'timestamp': 1606267856122,
                'source': 'CRM_UI',
                'sourceId': 'userId:5906413',
                'updatedByUserId': 5906413,
                'versions': [{
                  'name': 'hubspot_owner_assigneddate',
                  'value': '1606267856122',
                  'timestamp': 1606267856122,
                  'sourceId': 'userId:5906413',
                  'source': 'CRM_UI',
                  'sourceVid': [],
                  'updatedByUserId': 5906413
                }]
              },
              'dealstage': {
                'value': 'appointmentscheduled',
                'timestamp': 1610736854971,
                'source': 'CRM_UI',
                'sourceId': 'userId:5906413',
                'updatedByUserId': 5906413,
                'versions': [{
                  'name': 'dealstage',
                  'value': 'appointmentscheduled',
                  'timestamp': 1610736854971,
                  'sourceId': 'userId:5906413',
                  'source': 'CRM_UI',
                  'sourceVid': [],
                  'updatedByUserId': 5906413
                }],
                'label': 'Appointment Scheduled'
              },
              'hs_object_id': {
                'value': '3511925690',
                'timestamp': 1606267856122,
                'source': 'CONTACTS',
                'sourceId': 'CRM_UI',
                'updatedByUserId': 5906413,
                'versions': [{
                  'name': 'hs_object_id',
                  'value': '3511925690',
                  'timestamp': 1606267856122,
                  'sourceId': 'CRM_UI',
                  'source': 'CONTACTS',
                  'sourceVid': [],
                  'updatedByUserId': 5906413
                }]
              },
              'aloware_deal_trigger': {
                'value': 'Connected',
                'timestamp': 1611687735446,
                'source': 'API',
                'sourceId': null,
                'updatedByUserId': null,
                'versions': [{
                  'name': 'aloware_deal_trigger',
                  'value': 'Connected',
                  'timestamp': 1611687735446,
                  'source': 'API',
                  'sourceVid': [],
                  'requestId': 'fa1e0790-8c04-4f1b-a7be-a4b8dd73ba09'
                }]
              },
              'hs_analytics_source_data_2': {
                'value': '184991',
                'timestamp': 1623345540886,
                'source': 'DEALS',
                'sourceId': 'deal sync triggered by vid=189201',
                'updatedByUserId': null,
                'versions': [{
                  'name': 'hs_analytics_source_data_2',
                  'value': '184991',
                  'timestamp': 1623345540886,
                  'sourceId': 'deal sync triggered by vid=189201',
                  'source': 'DEALS',
                  'sourceVid': []
                }]
              },
              'hs_analytics_source_data_1': {
                'value': 'INTEGRATION',
                'timestamp': 1623345540886,
                'source': 'DEALS',
                'sourceId': 'deal sync triggered by vid=189201',
                'updatedByUserId': null,
                'versions': [{
                  'name': 'hs_analytics_source_data_1',
                  'value': 'INTEGRATION',
                  'timestamp': 1623345540886,
                  'sourceId': 'deal sync triggered by vid=189201',
                  'source': 'DEALS',
                  'sourceVid': []
                }]
              },
              'hs_latest_meeting_activity': {
                'value': '1611102600000',
                'timestamp': 1611100899815,
                'source': 'ENGAGEMENTS',
                'sourceId': 'ObjectPropertyUpdater',
                'updatedByUserId': null,
                'versions': [{
                  'name': 'hs_latest_meeting_activity',
                  'value': '1611102600000',
                  'timestamp': 1611100899815,
                  'sourceId': 'ObjectPropertyUpdater',
                  'source': 'ENGAGEMENTS',
                  'sourceVid': []
                }]
              },
              'num_notes': {
                'value': '223',
                'timestamp': 1625007935047,
                'source': 'ENGAGEMENTS',
                'sourceId': 'ObjectPropertyUpdater',
                'updatedByUserId': null,
                'versions': [{
                  'name': 'num_notes',
                  'value': '223',
                  'timestamp': 1625007935047,
                  'sourceId': 'ObjectPropertyUpdater',
                  'source': 'ENGAGEMENTS',
                  'sourceVid': []
                }]
              },
              'hs_updated_by_user_id': {
                'value': '5906413',
                'timestamp': 1606267856122,
                'source': 'CONTACTS',
                'sourceId': 'CRM_UI',
                'updatedByUserId': 5906413,
                'versions': [{
                  'name': 'hs_updated_by_user_id',
                  'value': '5906413',
                  'timestamp': 1606267856122,
                  'sourceId': 'CRM_UI',
                  'source': 'CONTACTS',
                  'sourceVid': [],
                  'updatedByUserId': 5906413
                }]
              }
            },
            'stateChanges': [],
            'imports': []
          }]
        },
        'form-submissions': [],
        'list-memberships': [{
          'static-list-id': 6,
          'internal-list-id': 6,
          'timestamp': 1620921611683,
          'vid': 189201,
          'is-member': true
        }, {
          'static-list-id': 8,
          'internal-list-id': 8,
          'timestamp': 1620921625510,
          'vid': 189201,
          'is-member': true
        }, {
          'static-list-id': 10,
          'internal-list-id': 18,
          'timestamp': 1620921607069,
          'vid': 189201,
          'is-member': true
        }, {
          'static-list-id': 41,
          'internal-list-id': 45,
          'timestamp': 1624462158095,
          'vid': 189201,
          'is-member': true
        }, {
          'static-list-id': 43,
          'internal-list-id': 47,
          'timestamp': 1624462161058,
          'vid': 189201,
          'is-member': true
        }, {
          'static-list-id': 58,
          'internal-list-id': 63,
          'timestamp': 1620921607069,
          'vid': 189201,
          'is-member': true
        }, {
          'static-list-id': 70,
          'internal-list-id': 75,
          'timestamp': 1620921607069,
          'vid': 189201,
          'is-member': true
        }, {
          'static-list-id': 83,
          'internal-list-id': 88,
          'timestamp': 1620921607069,
          'vid': 189201,
          'is-member': true
        }, {
          'static-list-id': 107,
          'internal-list-id': 112,
          'timestamp': 1621552793672,
          'vid': 189201,
          'is-member': true
        }, {
          'static-list-id': 110,
          'internal-list-id': 116,
          'timestamp': 1624558712586,
          'vid': 189201,
          'is-member': true
        }, {
          'static-list-id': 112,
          'internal-list-id': 118,
          'timestamp': 1624558820470,
          'vid': 189201,
          'is-member': true
        }, {
          'static-list-id': 114,
          'internal-list-id': 121,
          'timestamp': 1624558707018,
          'vid': 189201,
          'is-member': true
        }, {
          'static-list-id': 119,
          'internal-list-id': 127,
          'timestamp': 1625241060348,
          'vid': 189201,
          'is-member': true
        }, {
          'static-list-id': 124,
          'internal-list-id': 133,
          'timestamp': 1625257661742,
          'vid': 189201,
          'is-member': true
        }, {
          'static-list-id': 129,
          'internal-list-id': 138,
          'timestamp': 1625259080114,
          'vid': 189201,
          'is-member': true
        }],
        'identity-profiles': [{
          'vid': 189201,
          'saved-at-timestamp': 1623793690520,
          'deleted-changed-timestamp': 0,
          'identities': [{
            'type': 'LEAD_GUID',
            'value': '191c171b-e636-4070-9f84-80c21c147131',
            'timestamp': 1620921589312
          }, {
            'type': 'EMAIL',
            'value': 'sohrab@aloware.com',
            'timestamp': 1623793690453,
            'is-primary': true
          }]
        }],
        'merge-audits': []
      }
    }
  },
  methods: {
    getData () {
      return talk2Api.V1.contact.getIntegrationData(this.contact.id, {
        params: {
          integration_name: this.integration_name,
          dialer_mode: this.dialer_mode ? 1 : 0
        }
      }).then(response => {
        this.integration_data = response.data
      })
    },
    onWorkflowSelected (workflowId) {
      this.workflow.id = workflowId
    },
    resetWorkflowEnrollment () {
      this.workflow.id = null
    },
    enrollToWorkflow () {
      this.isEnrolling = true
      this.workflow.email = this.integration_data.properties.email.value
      return talk2Api.V1.integrations.hubspot.enrollToWorkflow(this.workflow)
        .then(response => {
          this.resetWorkflowEnrollment()
          this.$root.$emit('bv::hide::popover', 'hubspot-workflow-popover')
          this.$q.notify({
            message: 'Contact has been successfully enrolled to the workflow.',
            type: 'positive',
            textColor: 'white',
            actions: [
              {
                icon: 'close'
              }
            ]
          })
        })
        .catch(err => {
          console.log(err)
          this.$q.notify({
            message: 'Error while enrolling contact to the workflow.',
            type: 'negative',
            textColor: 'white',
            actions: [
              {
                icon: 'close'
              }
            ]
          })
        })
        .finally(() => {
          this.isEnrolling = false
        })
    },
    hubspotContactBaseLink () {
      if (this.currentCompany &&
        this.currentCompany.hubspot_integration_enabled &&
        this.contact &&
        this.contact.integration_data &&
        this.currentCompany.hubspot_marketing_portal_id) {
        return `https://app.hubspot.com/contacts/${this.currentCompany.hubspot_marketing_portal_id}/`
      }

      return false
    }
  },
  mounted () {
    this.getData()
  },
  watch: {
    'contact': function () {
      this.getData()
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/variables.scss';
.hubspot-integration-wrapper {

  a {
    text-decoration: none;
  }

  .name-wrapper {
    font-size: 14px;
    font-weight: 500;
  }

  p {

    font-size: 14px;

    .data-icon-label {

    }

    .data-value{
      font-weight: 400;
    }
  }

  .deals {
    border-top: 1px solid rgba(0, 0, 0, 0.12);
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 5px;

    .data-value {
      max-width: 156px !important;
    }

    .deals-title {
      font-size: 0.88rem;
      font-weight: 500;
      color: #303133;
    }
  }

  .integration-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }

  .hubspot-icon {
    color: #FF7A59;
    margin-right: 10px;
    font-size: 20px;
  }

  .data-value {
    max-width: 177px;
    display: inline-block;
    position: relative;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    top: 5px;
  }

  .data-icon-label{
    font-weight: 500;
    color: $grey-100 !important;
  }
}

.workflow-enroll-popover {
  left: -340px !important;
  width: 300px;
}
</style>
