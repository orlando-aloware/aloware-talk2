<template>
  <div
    class="integration-wrapper"
    data-testid="integration-hubspot-wrapper"
  >
    <q-card
      class="integration-card"
      data-testid="integration-hubspot-card"
      flat
    >
      <q-item class="p-0">
        <span class='integration-jit-card-header'>
          <i class="fab fa-hubspot hubspot-icon"></i>
          <span class="integration-title">HubSpot</span>
        </span>
      </q-item>
      <q-separator data-testid="integration-hubspot-separator" />

      <!-- Start Skeleton Loader -->
      <q-card-section v-if="!contactIntegrationDataLoaded">
        <q-skeleton type="QInput" />
      </q-card-section>
      <!-- End Skeleton Loader -->

      <!-- Start JIT Card Main Content -->
      <template v-if="contactIntegrationDataLoaded">
        <!-- Start Duplicate Contacts Section -->
        <q-card-section
          class='duplicateContactPhoneNumberMessage'
          v-if='hasDuplicates'
        >
          {{ duplicatePhoneNumbersDescription }}
        </q-card-section>
        <q-separator v-if='hasDuplicates' />
        <integration-hubspot-one-contact
          v-if='integrationData'
          is-primary
          :integration-data="integrationData"
          :lifecycle-stages-options="lifecycleStagesOptions"
          :contact-id="contact.id"
        />
        <!-- End Duplicate Contacts Section -->
        <!-- Start Sync Button -->
        <q-card-section data-testid="integration-hubspot-card-section-3">
          <b-row>
            <b-button
              class="text-white"
              size="sm"
              variant="primary"
              tabindex="0"
              block
              data-testid="integration-hubspot-sync-button"
              @click="syncHubspot"
            >
              <i
                class="fa fa-sync-alt"
                v-if="!isSyncing"
              ></i>
              <q-spinner-bars
                v-if="isSyncing"
                data-testid="integration-hubspot-sync-spinner"
                color="white"
              >
              </q-spinner-bars>
              {{ isSyncing ? 'Syncing...' : 'Sync with HubSpot' }}
              <q-tooltip
                anchor="top middle"
                self="center middle"
                data-testid="integration-hubspot-sync-tooltip"
                :offset="[-220, 10]"
              >
                <p class="font-weight-bold mb-0">Click on this button to sync the data for this contact between {{ whiteLabelName }} and HubSpot.</p>
                <p class="font-weight-bold">You'll want to click on this button if:</p>
                <p class="mt-1 mb-0">- The contact was recently merged in HubSpot with another contact.</p>
                <p class="mt-0 mb-0">- You notice any inconsistencies between {{ whiteLabelName }} and HubSpot data on
                  this contact.</p>
              </q-tooltip>
            </b-button>
          </b-row>
        </q-card-section>
        <!-- End Sync Button -->
        <!-- Start Workflow Section -->
        <q-card-section
          data-testid="integration-hubspot-card-section-4"
          v-if="integrationData && integrationData.properties && integrationData.properties.email && false"
        >
          <b-row>
            <b-button
              class="text-white btn-block"
              size="sm"
              variant="primary"
              tabindex="0"
              data-testid="integration-hubspot-enroll-button"
              @click="onEnrollToWorkflow"
            >
              <i class="fa fa-user-plus"></i>
              Enroll to Workflow
            </b-button>
          </b-row>
        </q-card-section>
        <q-menu
          content-class="mx-height-300"
          ref="templatesMenu"
          no-parent-event
          no-focus
          data-testid="hubspot-workflow-popover"
          :offset="[366, -105]"
          v-model="showWorkflowSelectorForm"
        >
          <div class="no-wrap q-pa-md">
            <workflow-selector
              data-testid="integration-hubspot-workflow-selector"
              @onWorkflowSelected="onWorkflowSelected"
            />
            <b-button
              class="btn-block"
              size="sm"
              variant="primary"
              data-testid="integration-hubspot-enroll-button"
              :disabled="isEnrolling || !isWorkflowValid"
              @click.prevent="enrollToWorkflow"
            >
              <q-spinner-bars
                v-if="isEnrolling"
                color="white"
              >
              </q-spinner-bars>
              {{ isEnrolling ? 'Enrolling...' : 'Enroll' }}
            </b-button>
          </div>
        </q-menu>
        <!-- End Workflow Section -->
        <!-- Start Duplicate Contacts Section -->
        <div v-if='hasDuplicates'>
          <div v-if="showDuplicates">
            <div
              v-for="duplicate in this.integrationData.duplicates"
              :key="duplicate.id"
            >
              <q-separator data-testid="integration-hubspot-separator" />
              <integration-hubspot-one-contact
                :integrationData="duplicate"
                :lifecycle-stages-options="lifecycleStagesOptions"
                :contact-id="contact.id"
              />
            </div>
          </div>
          <b-button
            size="sm"
            variant="link"
            tabindex="0"
            block
            @click="toggleDuplicates"
          >
            {{ showDuplicates ? 'See less matches' : 'See all matches' }}
          </b-button>
        </div>
        <!-- End Duplicate Contacts Section -->
      </template>
      <!-- End JIT Card Main Content -->
    </q-card>
  </div>
</template>

<script>
import IntegrationHubspotOneContact from 'components/integrations/integration-hubspot-one-contact.vue'
import _ from 'lodash'
import WorkflowSelector from 'src/components/integrations/workflow-selector'
import talk2Api from 'src/plugins/api/api'
import {
  hubspotIntegrationMixin,
  integrationMixin,
  simpsocialMixin
} from 'src/plugins/mixins'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'integration-hubspot',

  components: { IntegrationHubspotOneContact, WorkflowSelector },

  mixins: [
    hubspotIntegrationMixin,
    integrationMixin,
    simpsocialMixin
  ],

  props: {
    contact: {
      type: Object,
      required: true
    },

    dialer_mode: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    ...mapState(['statics']),

    isWorkflowValid () {
      return this.workflow.id
    },

    isContactValid () {
      return this.contact && this.contact.id
    },

    isRouteMatch () {
      return this.$route.params.id === this.contact.id.toString() || this.$route.name === 'Power Dialer'
    },

    isContactAndRouteValid () {
      return this.isContactValid && this.isRouteMatch
    },

    hasDuplicates () {
      return this.integrationData && this.integrationData.duplicates && this.integrationData.duplicates.length > 0
    },

    duplicatePhoneNumbersDescription () {
      if (!this.integrationData || !this.integrationData.duplicates) {
        return ''
      }

      const values = [...new Set(this.integrationData.duplicates
        .flatMap(item => [...new Set(item.duplicated_by.map(item => item.value))]))]

      return 'This contact has other matches with the same number' +
        (values.length > 1 ? 's' : '') +
        (values.length ? `: ${values.join(', ')}` : '')
    },

    lifecycleStagesOptions () {
      // transform from an object to a list of objects with label and value properties
      // example: [{ label: 'Subscriber', value: 'subscriber' }, { label: 'Lead', value: 'lead' }, { label: 'Customer', value: 'customer' }]
      return this.integrationData?.lifecycle_stages
        ? Object.entries(this.integrationData.lifecycle_stages).map(([label, value]) => ({ label, value }))
        : []
    }
  },

  data () {
    return {
      isEnrolling: false,
      isSyncing: false,
      showWorkflowSelectorForm: false,
      workflow: {
        email: null,
        id: null
      },
      integrationData: null,
      contactIntegrationDataLoaded: false,
      showDuplicates: false
    }
  },

  async mounted () {
    if (this.contact && this.contact.id) {
      await this.getData()
    }
  },

  methods: {
    ...mapActions('contacts', ['setContact', 'setContactClone']),

    getData () {
      return this.getIntegrationData(this.contact, 'hubspot')
        .then(response => {
          this.integrationData = response.data
          this.contactIntegrationDataLoaded = true
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
      this.workflow.email = this.integrationData.properties.email ? this.integrationData.properties.email : ''
      return talk2Api.V1.integrations.hubspot.enrollToWorkflow(this.workflow).then(response => {
        this.resetWorkflowEnrollment()
        // emit on parent if there's a need to do after workflow enrollment
        this.$emit('enrolledToWorkflow', this.workflow)
        this.$root.$emit('bv::hide::popover', 'hubspot-workflow-popover')
        this.$generalNotification('Contact has been successfully enrolled to the workflow.')
      }).catch(err => {
        console.log(err)
        this.$handleErrors(err.response)
      }).finally(() => {
        this.isEnrolling = false
        this.showWorkflowSelectorForm = false
      })
    },

    onEnrollToWorkflow () {
      this.showWorkflowSelectorForm = true
    },

    async syncHubspot (showAlert = true) {
      this.isSyncing = true
      await talk2Api.V1.contact.syncHubspot(this.contact.id)
      await this.getData()
      this.isSyncing = false

      if (showAlert) {
        this.$generalNotification('Contact has been successfully synced.')
      }
    },

    toggleDuplicates () {
      this.showDuplicates = !this.showDuplicates
    }
  },

  watch: {
    'contact.id': _.debounce(function () {
      if (this.isContactAndRouteValid) {
        this.contactIntegrationDataLoaded = false
        this.getData()
      }
    }, 500)
  }
}
</script>
