<template>
  <div>
    <q-select dense
              outlined
              map-options
              emit-value
              use-input
              option-value="id"
              option-label="name"
              style="width: 100%"
              v-model="selectedWorkflow"
              :options="options"
              @filter="filterFn">
      <template v-slot:append>
        <b-button size="sm" variant="light" @click.stop="getWorkflows">
          <i v-if="!isLoadingWorkflow" class="fa fa-redo-alt"></i>
          <b-spinner v-if="isLoadingWorkflow" variant="success" label="Spinning" small></b-spinner>
        </b-button>
      </template>
    </q-select>
  </div>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
export default {
  name: 'workflow-selector',
  computed: {
    workflowOptions () {
      return this.workflows
    }
  },
  data () {
    return {
      selectedWorkflow: '',
      isLoadingWorkflow: false,
      workflows: [
        {
          'migrationStatus': {
            'portalId': 8446098,
            'flowId': 41898252,
            'workflowId': 18544237,
            'migrationStatus': 'EXECUTION_MIGRATED',
            'platformOwnsActions': true,
            'lastSuccessfulMigrationTimestamp': null
          },
          'description': '',
          'lastUpdatedByUserId': 5906413,
          'contactListIds': {
            'enrolled': 1,
            'active': 2,
            'completed': 3,
            'succeeded': 4
          },
          'contactCounts': {
            'active': 0,
            'enrolled': 2
          },
          'personaTagIds': [],
          'type': 'DRIP_DELAY',
          'portalId': 8446098,
          'insertedAt': 1604362928571,
          'updatedAt': 1605136802712,
          'enabled': true,
          'originalAuthorUserId': 5906413,
          'creationSource': {
            'sourceApplication': {
              'source': 'WORKFLOWS_APP',
              'serviceName': 'https://app.hubspot.com/workflows/8446098/platform/create/new?flowTypeId=0-1&scrollToElementId=scroll-to-new-action-config-0-1&templateId=1&searchFilter='
            },
            'createdByUser': {
              'userId': 5906413,
              'userEmail': 'sohrab@aloware.com'
            },
            'createdAt': 1604362928492
          },
          'updateSource': {
            'sourceApplication': {
              'source': 'WORKFLOWS_APP',
              'serviceName': 'https://app.hubspot.com/workflows/8446098/platform/flow/41898252/settings/suppressions'
            },
            'updatedByUser': {
              'userId': 5906413,
              'userEmail': 'sohrab@aloware.com'
            },
            'updatedAt': 1605136802712
          },
          'id': 18544237,
          'name': 'Enroll on Open deal'
        },
        {
          'migrationStatus': {
            'portalId': 8446098,
            'flowId': 41967097,
            'workflowId': 18578172,
            'migrationStatus': 'EXECUTION_MIGRATED',
            'platformOwnsActions': true,
            'lastSuccessfulMigrationTimestamp': null
          },
          'description': '',
          'lastUpdatedByUserId': 5906413,
          'contactListIds': {
            'enrolled': 6,
            'active': 7,
            'completed': 8,
            'succeeded': 9
          },
          'contactCounts': {
            'active': 0,
            'enrolled': 9
          },
          'personaTagIds': [],
          'type': 'DRIP_DELAY',
          'portalId': 8446098,
          'insertedAt': 1604440365272,
          'updatedAt': 1605136794981,
          'enabled': true,
          'originalAuthorUserId': 5906413,
          'creationSource': {
            'sourceApplication': {
              'source': 'WORKFLOWS_APP',
              'serviceName': 'https://app.hubspot.com/workflows/8446098/platform/create/new?flowTypeId=0-1&scrollToElementId=scroll-to-new-action-config-0-1'
            },
            'createdByUser': {
              'userId': 5906413,
              'userEmail': 'sohrab@aloware.com'
            },
            'createdAt': 1604440365231
          },
          'updateSource': {
            'sourceApplication': {
              'source': 'WORKFLOWS_APP',
              'serviceName': 'https://app.hubspot.com/workflows/8446098/platform/flow/41967097/settings/suppressions'
            },
            'updatedByUser': {
              'userId': 5906413,
              'userEmail': 'sohrab@aloware.com'
            },
            'updatedAt': 1605136794981
          },
          'id': 18578172,
          'name': 'Send MMS on Open'
        },
        {
          'migrationStatus': {
            'portalId': 8446098,
            'flowId': 41967157,
            'workflowId': 18578688,
            'migrationStatus': 'EXECUTION_MIGRATED',
            'platformOwnsActions': true,
            'lastSuccessfulMigrationTimestamp': null
          },
          'description': '',
          'lastUpdatedByUserId': 5906413,
          'contactListIds': {
            'enrolled': 12,
            'active': 13,
            'completed': 14,
            'succeeded': 15
          },
          'contactCounts': {
            'active': 0,
            'enrolled': 7
          },
          'personaTagIds': [],
          'type': 'DRIP_DELAY',
          'portalId': 8446098,
          'insertedAt': 1604441310116,
          'updatedAt': 1605747010386,
          'enabled': true,
          'originalAuthorUserId': 5906413,
          'creationSource': {
            'sourceApplication': {
              'source': 'WORKFLOWS_APP',
              'serviceName': 'https://app.hubspot.com/workflows/8446098/'
            },
            'createdByUser': {
              'userId': 5906413,
              'userEmail': 'sohrab@aloware.com'
            },
            'clonedFromWorkflowId': 18578172,
            'createdAt': 1604441310027
          },
          'updateSource': {
            'sourceApplication': {
              'source': 'WORKFLOWS_APP',
              'serviceName': 'https://app.hubspot.com/workflows/8446098/platform/flow/41967157/review'
            },
            'updatedByUser': {
              'userId': 5906413,
              'userEmail': 'sohrab@aloware.com'
            },
            'updatedAt': 1605747010386
          },
          'id': 18578688,
          'name': 'Send SMS on Bad Timing'
        },
        {
          'migrationStatus': {
            'portalId': 8446098,
            'flowId': 43308369,
            'workflowId': 19068144,
            'migrationStatus': 'EXECUTION_MIGRATED',
            'platformOwnsActions': true,
            'lastSuccessfulMigrationTimestamp': null
          },
          'description': '',
          'lastUpdatedByUserId': 5906413,
          'contactListIds': {
            'enrolled': 35,
            'active': 36,
            'completed': 37,
            'succeeded': 38
          },
          'contactCounts': {
            'active': 0,
            'enrolled': 1
          },
          'personaTagIds': [],
          'type': 'DRIP_DELAY',
          'portalId': 8446098,
          'insertedAt': 1605637494405,
          'updatedAt': 1614359878367,
          'enabled': true,
          'originalAuthorUserId': 12526554,
          'creationSource': {
            'sourceApplication': {
              'source': 'WORKFLOWS_APP',
              'serviceName': 'https://app.hubspot.com/workflows/8446098/platform/create/new?flowTypeId=0-1&scrollToElementId=scroll-to-new-action-config-0-1'
            },
            'createdByUser': {
              'userId': 12526554,
              'userEmail': 'josiah@aloware.com'
            },
            'createdAt': 1605637494364
          },
          'updateSource': {
            'sourceApplication': {
              'source': 'DIRECT_API',
              'serviceName': 'AutomationPlatformService-userweb'
            },
            'updatedByUser': {
              'userId': 5906413,
              'userEmail': 'sohrab@aloware.com'
            },
            'updatedAt': 1614359878367
          },
          'id': 19068144,
          'name': 'Send a Message'
        },
        {
          'migrationStatus': {
            'portalId': 8446098,
            'flowId': 43478922,
            'workflowId': 19118259,
            'migrationStatus': 'EXECUTION_MIGRATED',
            'platformOwnsActions': true,
            'lastSuccessfulMigrationTimestamp': null
          },
          'description': '',
          'lastUpdatedByUserId': 5906413,
          'contactListIds': {
            'enrolled': 41,
            'active': 42,
            'completed': 43,
            'succeeded': 44
          },
          'contactCounts': {
            'active': 0,
            'enrolled': 30
          },
          'personaTagIds': [],
          'type': 'DRIP_DELAY',
          'portalId': 8446098,
          'insertedAt': 1605748520674,
          'updatedAt': 1605750705897,
          'enabled': true,
          'originalAuthorUserId': 5906413,
          'creationSource': {
            'sourceApplication': {
              'source': 'WORKFLOWS_APP',
              'serviceName': 'https://app.hubspot.com/workflows/8446098/'
            },
            'createdByUser': {
              'userId': 5906413,
              'userEmail': 'sohrab@aloware.com'
            },
            'clonedFromWorkflowId': 18578688,
            'createdAt': 1605748520573
          },
          'updateSource': {
            'sourceApplication': {
              'source': 'WORKFLOWS_APP',
              'serviceName': 'https://app.hubspot.com/workflows/8446098/platform/flow/43478922/edit'
            },
            'updatedByUser': {
              'userId': 5906413,
              'userEmail': 'sohrab@aloware.com'
            },
            'updatedAt': 1605750705897
          },
          'id': 19118259,
          'name': 'Add to Power Dialer on In progress'
        },
        {
          'migrationStatus': {
            'portalId': 8446098,
            'flowId': 43542858,
            'workflowId': 19147902,
            'migrationStatus': 'EXECUTION_MIGRATED',
            'platformOwnsActions': true,
            'lastSuccessfulMigrationTimestamp': null
          },
          'description': '',
          'contactListIds': {
            'enrolled': 53,
            'active': 54,
            'completed': 55,
            'succeeded': 56
          },
          'contactCounts': {
            'active': 0,
            'enrolled': 0
          },
          'personaTagIds': [],
          'type': 'DRIP_DELAY',
          'portalId': 8446098,
          'insertedAt': 1605814483943,
          'updatedAt': 1605815234080,
          'enabled': false,
          'originalAuthorUserId': 12227000,
          'creationSource': {
            'sourceApplication': {
              'source': 'WORKFLOWS_APP',
              'serviceName': 'https://app.hubspot.com/workflows/8446098/platform/create/template?flowTypeId=0-1&scrollToElementId=scroll-to-new-action-config-0-1&templateId=1&searchFilter='
            },
            'createdByUser': {
              'userId': 12227000,
              'userEmail': 'bernard@aloware.com'
            },
            'createdAt': 1605814483894
          },
          'updateSource': {
            'sourceApplication': {
              'source': 'DIRECT_API',
              'serviceName': 'AutomationPlatformService-userweb'
            },
            'updatedByUser': {
              'userId': 12227000,
              'userEmail': 'bernard@aloware.com'
            },
            'updatedAt': 1605815234080
          },
          'id': 19147902,
          'name': 'Bernard Test'
        },
        {
          'migrationStatus': {
            'portalId': 8446098,
            'flowId': 54609838,
            'workflowId': 22224462,
            'migrationStatus': 'EXECUTION_MIGRATED',
            'platformOwnsActions': true,
            'lastSuccessfulMigrationTimestamp': null
          },
          'description': '',
          'lastUpdatedByUserId': 5906413,
          'contactListIds': {
            'enrolled': 84,
            'active': 85,
            'completed': 86,
            'succeeded': 87
          },
          'contactCounts': {
            'active': 0,
            'enrolled': 0
          },
          'personaTagIds': [],
          'type': 'DRIP_DELAY',
          'portalId': 8446098,
          'insertedAt': 1613454645073,
          'updatedAt': 1613454644990,
          'enabled': false,
          'originalAuthorUserId': 5906413,
          'creationSource': {
            'sourceApplication': {
              'source': 'DIRECT_API',
              'serviceName': 'AutomationPlatformService-userweb'
            },
            'createdByUser': {
              'userId': 5906413,
              'userEmail': 'sohrab@aloware.com'
            },
            'clonedFromWorkflowId': 19147902,
            'createdAt': 1613454644990
          },
          'updateSource': {
            'sourceApplication': {
              'source': 'DIRECT_API',
              'serviceName': 'AutomationPlatformService-userweb'
            },
            'updatedByUser': {
              'userId': 5906413,
              'userEmail': 'sohrab@aloware.com'
            },
            'updatedAt': 1613454644990
          },
          'id': 22224462,
          'name': 'Message events'
        },
        {
          'migrationStatus': {
            'portalId': 8446098,
            'flowId': 54879581,
            'workflowId': 22296060,
            'migrationStatus': 'EXECUTION_MIGRATED',
            'platformOwnsActions': true,
            'lastSuccessfulMigrationTimestamp': null
          },
          'description': '',
          'lastUpdatedByUserId': 12526554,
          'contactListIds': {
            'enrolled': 96,
            'active': 97,
            'completed': 98,
            'succeeded': 99
          },
          'contactCounts': {
            'active': 0,
            'enrolled': 1
          },
          'personaTagIds': [],
          'type': 'DRIP_DELAY',
          'portalId': 8446098,
          'insertedAt': 1613605979922,
          'updatedAt': 1613606720146,
          'enabled': true,
          'originalAuthorUserId': 12526554,
          'creationSource': {
            'sourceApplication': {
              'source': 'WORKFLOWS_APP',
              'serviceName': 'https://app.hubspot.com/workflows/8446098/platform/create/template?flowTypeId=0-1&scrollToElementId=scroll-to-new-action-config-0-1&templateId=1'
            },
            'createdByUser': {
              'userId': 12526554,
              'userEmail': 'josiah@aloware.com'
            },
            'createdAt': 1613605979891
          },
          'updateSource': {
            'sourceApplication': {
              'source': 'DIRECT_API',
              'serviceName': 'AutomationPlatformService-userweb'
            },
            'updatedByUser': {
              'userId': 12526554,
              'userEmail': 'josiah@aloware.com'
            },
            'updatedAt': 1613606720146
          },
          'id': 22296060,
          'name': 'Message Events Test'
        },
        {
          'migrationStatus': {
            'portalId': 8446098,
            'flowId': 61750104,
            'workflowId': 23630182,
            'migrationStatus': 'EXECUTION_MIGRATED',
            'platformOwnsActions': true,
            'lastSuccessfulMigrationTimestamp': null
          },
          'description': '',
          'lastUpdatedByUserId': 5906413,
          'contactListIds': {
            'enrolled': 103,
            'active': 104,
            'completed': 105,
            'succeeded': 106
          },
          'contactCounts': {
            'active': 0,
            'enrolled': 0
          },
          'personaTagIds': [],
          'type': 'DRIP_DELAY',
          'portalId': 8446098,
          'insertedAt': 1616524166475,
          'updatedAt': 1616524180565,
          'enabled': false,
          'originalAuthorUserId': 5906413,
          'creationSource': {
            'sourceApplication': {
              'source': 'WORKFLOWS_APP',
              'serviceName': 'https://app.hubspot.com/workflows/8446098/platform/create/new?flowTypeId=0-1&scrollToElementId=scroll-to-new-action-config-0-1'
            },
            'createdByUser': {
              'userId': 5906413,
              'userEmail': 'sohrab@aloware.com'
            },
            'createdAt': 1616524166466
          },
          'updateSource': {
            'sourceApplication': {
              'source': 'DIRECT_API',
              'serviceName': 'AutomationPlatformService-userweb'
            },
            'updatedByUser': {
              'userId': 5906413,
              'userEmail': 'sohrab@aloware.com'
            },
            'updatedAt': 1616524180565
          },
          'id': 23630182,
          'name': 'Unnamed workflow - Tue Mar 23 2021 11:29:25 GMT-0700'
        },
        {
          'migrationStatus': {
            'portalId': 8446098,
            'flowId': 80955264,
            'workflowId': 26962667,
            'migrationStatus': 'EXECUTION_MIGRATED',
            'platformOwnsActions': true,
            'lastSuccessfulMigrationTimestamp': null
          },
          'description': '',
          'lastUpdatedByUserId': 5906413,
          'contactListIds': {
            'enrolled': 110,
            'active': 111,
            'completed': 112,
            'succeeded': 113
          },
          'contactCounts': {
            'active': 0,
            'enrolled': 4
          },
          'personaTagIds': [],
          'type': 'DRIP_DELAY',
          'portalId': 8446098,
          'insertedAt': 1624557795787,
          'updatedAt': 1624573831289,
          'enabled': true,
          'originalAuthorUserId': 5906413,
          'creationSource': {
            'sourceApplication': {
              'source': 'WORKFLOWS_APP',
              'serviceName': 'https://app.hubspot.com/workflows/8446098/platform/create/new?templateId=100&category=all&searchFilter='
            },
            'createdByUser': {
              'userId': 5906413,
              'userEmail': 'sohrab@aloware.com'
            },
            'createdAt': 1624557795778
          },
          'updateSource': {
            'sourceApplication': {
              'source': 'DIRECT_API',
              'serviceName': 'AutomationPlatformService-userweb'
            },
            'updatedByUser': {
              'userId': 5906413,
              'userEmail': 'sohrab@aloware.com'
            },
            'updatedAt': 1624573831289
          },
          'id': 26962667,
          'name': 'Create ticket on voicemail'
        },
        {
          'migrationStatus': {
            'portalId': 8446098,
            'flowId': 82706691,
            'workflowId': 27230165,
            'migrationStatus': 'EXECUTION_MIGRATED',
            'platformOwnsActions': true,
            'lastSuccessfulMigrationTimestamp': null
          },
          'description': '',
          'lastUpdatedByUserId': 23798127,
          'contactListIds': {
            'enrolled': 115,
            'active': 116,
            'completed': 117,
            'succeeded': 118
          },
          'contactCounts': {
            'active': 0,
            'enrolled': 0
          },
          'personaTagIds': [],
          'type': 'DRIP_DELAY',
          'portalId': 8446098,
          'insertedAt': 1625240947070,
          'updatedAt': 1625241042669,
          'enabled': false,
          'originalAuthorUserId': 23798127,
          'creationSource': {
            'sourceApplication': {
              'source': 'WORKFLOWS_APP',
              'serviceName': 'https://app.hubspot.com/workflows/8446098/platform/create/new?flowTypeId=0-1&scrollToElementId=scroll-to-new-action-config-0-1&templateId=100&category=all&searchFilter='
            },
            'createdByUser': {
              'userId': 23798127,
              'userEmail': 'skyler@aloware.com'
            },
            'createdAt': 1625240947061
          },
          'updateSource': {
            'sourceApplication': {
              'source': 'DIRECT_API',
              'serviceName': 'AutomationPlatformService-userweb'
            },
            'updatedByUser': {
              'userId': 23798127,
              'userEmail': 'skyler@aloware.com'
            },
            'updatedAt': 1625241042669
          },
          'id': 27230165,
          'name': 'Unnamed workflow - Fri Jul 02 2021 09:49:06 GMT-0600'
        },
        {
          'migrationStatus': {
            'portalId': 8446098,
            'flowId': 82772093,
            'workflowId': 27237043,
            'migrationStatus': 'EXECUTION_MIGRATED',
            'platformOwnsActions': true,
            'lastSuccessfulMigrationTimestamp': null
          },
          'description': '',
          'lastUpdatedByUserId': 23798127,
          'contactListIds': {
            'enrolled': 120,
            'active': 121,
            'completed': 122,
            'succeeded': 123
          },
          'contactCounts': {
            'active': 0,
            'enrolled': 0
          },
          'personaTagIds': [],
          'type': 'DRIP_DELAY',
          'portalId': 8446098,
          'insertedAt': 1625257330959,
          'updatedAt': 1625257638749,
          'enabled': false,
          'originalAuthorUserId': 23798127,
          'creationSource': {
            'sourceApplication': {
              'source': 'WORKFLOWS_APP',
              'serviceName': 'https://app.hubspot.com/workflows/8446098/platform/create/new?flowTypeId=0-1&scrollToElementId=scroll-to-new-action-config-0-1'
            },
            'createdByUser': {
              'userId': 23798127,
              'userEmail': 'skyler@aloware.com'
            },
            'createdAt': 1625257330949
          },
          'updateSource': {
            'sourceApplication': {
              'source': 'DIRECT_API',
              'serviceName': 'AutomationPlatformService-userweb'
            },
            'updatedByUser': {
              'userId': 23798127,
              'userEmail': 'skyler@aloware.com'
            },
            'updatedAt': 1625257638749
          },
          'id': 27237043,
          'name': 'Unnamed workflow - Fri Jul 02 2021 14:22:10 GMT-0600'
        },
        {
          'migrationStatus': {
            'portalId': 8446098,
            'flowId': 82780176,
            'workflowId': 27237714,
            'migrationStatus': 'EXECUTION_MIGRATED',
            'platformOwnsActions': true,
            'lastSuccessfulMigrationTimestamp': null
          },
          'description': '',
          'lastUpdatedByUserId': 23798127,
          'contactListIds': {
            'enrolled': 125,
            'active': 126,
            'completed': 127,
            'succeeded': 128
          },
          'contactCounts': {
            'active': 0,
            'enrolled': 0
          },
          'personaTagIds': [],
          'type': 'DRIP_DELAY',
          'portalId': 8446098,
          'insertedAt': 1625259027517,
          'updatedAt': 1625259065253,
          'enabled': false,
          'originalAuthorUserId': 23798127,
          'creationSource': {
            'sourceApplication': {
              'source': 'WORKFLOWS_APP',
              'serviceName': 'https://app.hubspot.com/workflows/8446098/platform/create/new?flowTypeId=0-1&scrollToElementId=scroll-to-new-action-config-0-1'
            },
            'createdByUser': {
              'userId': 23798127,
              'userEmail': 'skyler@aloware.com'
            },
            'createdAt': 1625259027510
          },
          'updateSource': {
            'sourceApplication': {
              'source': 'DIRECT_API',
              'serviceName': 'AutomationPlatformService-userweb'
            },
            'updatedByUser': {
              'userId': 23798127,
              'userEmail': 'skyler@aloware.com'
            },
            'updatedAt': 1625259065253
          },
          'id': 27237714,
          'name': 'Unnamed workflow - Fri Jul 02 2021 14:50:26 GMT-0600'
        }
      ],
      options: this.workflowOptions
    }
  },
  methods: {
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.options = this.workflowOptions
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.options = this.workflowOptions.filter(v => v.name && v.name.toLowerCase().indexOf(needle) > -1)
      })
    },
    getWorkflows () {
      this.isLoadingWorkflow = true
      return talk2Api.V1.integrations.hubspot.getWorkflows()
        .then(response => {
          this.workflows = response.data
        })
        .catch((err) => {
          this.$root.handleErrors(err.response)
          console.log(err)
        })
        .finally(() => {
          this.isLoadingWorkflow = false
        })
    }
  },
  mounted () {
    // this.getWorkflows()
  },
  watch: {
    'selectedWorkflow': function (value) {
      this.$emit('onWorkflowSelected', value)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
