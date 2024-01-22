<template>
  <div class="integration-wrapper">
    <q-card class="hubspot-card"
            flat>
      <q-item class="p-0">
        <q-item-section v-if="contactLink">
          <b-link target="_blank"
                  :href="contactLink">
            <i class="fab fa-hubspot hubspot-icon"></i>
            <span class="integration-title">Hubspot</span>
          </b-link>
        </q-item-section>
        <q-item-section v-else>
          <a href="#"
             onclick="return false;">
            <i class="fab fa-hubspot hubspot-icon"></i>
            <span class="integration-title">Hubspot</span>
          </a>
        </q-item-section>
      </q-item>

      <q-separator/>

      <q-card-section v-if="integrationData && integrationData.properties">
        <p class="mb-0"
           v-if="integrationData.properties.firstname !== undefined && integrationData.properties.lastname !== undefined">
          <span class="data-icon-label">Name: </span>
          <span class="data-value">
             <q-tooltip anchor="top middle"
                        self="center middle">
              {{ integrationData.properties.firstname.value + ' ' + integrationData.properties.lastname.value }}
            </q-tooltip>
            {{ integrationData.properties.firstname.value + ' ' + integrationData.properties.lastname.value }}
          </span>
        </p>
        <p class="mb-0"
           v-if="integrationData.properties.email">
          <span class="data-icon-label">Email: </span>
          <span class="data-value">{{ integrationData.properties.email.value }}</span>
        </p>
        <p class="mb-0"
           v-if="integrationData.properties.company">
          <span class="data-icon-label">Company: </span>
          <span class="data-value">{{ integrationData.properties.company.value }}</span>
        </p>
        <p class="mb-0"
           v-if="integrationData.properties.hubspot_owner">
          <span class="data-icon-label">Owner: </span>
          <span class="data-value">{{ integrationData.properties.hubspot_owner.firstName + ' ' + integrationData.properties.hubspot_owner.lastName }}</span>
        </p>
      </q-card-section>

      <q-card-section class="pt-0 pb-0"
                      v-if="integrationData && integrationData.properties">
        <q-card class="deals mb-1"
                v-for="(deal, index) in integrationData.properties.deals"
                :key="index"
                flat bordered>
          <q-card-section>
            <q-card-section class="p-0">
              <h6 class="mb-2">
                <b-link class="deals-title ml-0"
                        :href="hubspotContactBaseLink + 'deal/' + deal.dealId"
                        target="_blank">
                  {{ deal.properties.dealname.value }}
                </b-link>
              </h6>
              <p class="mb-1 d-flex">
                <span class="data-icon-label">Amount: </span>
                <span class="data-value ml-1"
                      v-if="deal.properties && deal.properties.amount">
                  <q-tooltip anchor="top middle"
                             self="center middle">
                    {{ deal.properties.amount.value | toCurrency }}
                  </q-tooltip>
                  {{ deal.properties.amount.value | toCurrency }}
                </span>
              </p>
              <p class="mb-1 d-flex">
                <span class="data-icon-label">Pipeline: </span>
                <span class="data-value ml-1">
                  <q-tooltip anchor="top middle"
                             self="center middle">
                    {{ deal.properties.pipeline.label }}
                  </q-tooltip>
                  {{ deal.properties.pipeline.label }}
                </span>
              </p>
              <p class="mb-1 d-flex">
                <span class="data-icon-label">Stage: </span>
                <span class="data-value ml-1">
                  <q-tooltip anchor="top middle"
                             self="center middle">
                    {{ deal.properties.dealstage.label }}
                  </q-tooltip>
                  {{ deal.properties.dealstage.label }}
                </span>
              </p>
            </q-card-section>
          </q-card-section>
        </q-card>
      </q-card-section>

      <q-card-section>
        <b-row>
          <b-button class="text-white"
                    size="sm"
                    variant="primary"
                    tabindex="0"
                    block
                    @click="syncHubspot">
            <i class="fa fa-sync-alt" v-if="!isSyncing"></i>
            <q-spinner-bars v-if="isSyncing"
                            color="white">
            </q-spinner-bars>
            {{ isSyncing ? 'Syncing...' : 'Sync with Hubspot' }}
            <q-tooltip anchor="center start"
                       self="center left"
                       :offset="[-220, 10]">
              <p class="font-weight-bold mb-0">Click on this button to sync the data for this contact between {{ whiteLabelText }} and HubSpot.</p>
              <p class="font-weight-bold">You'll want to click on this button if:</p>
              <p class="mt-1 mb-0">- The contact was recently merged in HubSpot with another contact.</p>
              <p class="mt-0 mb-0">- You notice any inconsistencies between {{ whiteLabelText }} and HubSpot data on this contact.</p>
            </q-tooltip>
          </b-button>
        </b-row>
      </q-card-section>

      <q-card-section
        v-if="integrationData && integrationData.properties && integrationData.properties.email && integrationData.properties.email.value && false">
        <b-row>
          <b-button class="text-white btn-block"
                    size="sm"
                    variant="primary"
                    tabindex="0"
                    @click="onEnrollToWorkflow">
            <i class="fa fa-user-plus"></i>
            Enroll to Workflow
          </b-button>
        </b-row>
      </q-card-section>
    </q-card>

    <q-menu content-class="mx-height-300"
            ref="templatesMenu"
            no-parent-event
            no-focus
            :offset="[366, -105]"
            v-model="showWorkflowSelectorForm">
      <div class="no-wrap q-pa-md">
        <workflow-selector @onWorkflowSelected="onWorkflowSelected"/>
        <b-button class="btn-block"
                  size="sm"
                  variant="primary"
                  :disabled="isEnrolling || !isWorkflowValid"
                  @click.prevent="enrollToWorkflow">
          <q-spinner-bars v-if="isEnrolling"
                          color="white">
          </q-spinner-bars>
          {{ isEnrolling ? 'Enrolling...' : 'Enroll' }}
        </b-button>
      </div>
    </q-menu>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import WorkflowSelector from 'src/components/integrations/workflow-selector'
import _ from 'lodash'
import {
  hubspotIntegrationMixin,
  integrationMixin
} from 'src/plugins/mixins'

export default {
  name: 'integration-hubspot',

  components: { WorkflowSelector },

  mixins: [
    hubspotIntegrationMixin,
    integrationMixin
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

    companyDomain () {
      return this.currentCompany.hubspot_company_ui_domain || 'app.hubspot.com'
    },

    hubspotContactBaseLink () {
      if (!this.contactIntegrationDataLoaded) {
        return
      }

      return this.getHubspotContactBaseLink()
    },

    contactLink () {
      if (!this.contactIntegrationDataLoaded) {
        return
      }

      return this.getHubspotContactLink(this.contact)
    },

    whiteLabelText () {
      return this.statics.whitelabel ? this.statics.name : 'Aloware'
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
      contactIntegrationDataLoaded: false
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
      this.workflow.email = this.integrationData.properties.email ? this.integrationData.properties.email.value : ''
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

    syncHubspot (showAlert = true) {
      this.isSyncing = true
      talk2Api.V1.contact.syncHubspot(this.contact.id).then(response => {
        this.isSyncing = false
        this.getData()

        if (showAlert) {
          this.$generalNotification('Contact has been successfully synced.')
        }
      })
    }
  },

  watch: {
    'contact.id': _.debounce(function () {
      if (this.contact && this.contact.id && (this.$route.params.id === this.contact.id.toString() || this.$route.name === 'Power Dialer')) {
        this.contactIntegrationDataLoaded = false
        this.getData()
      }
    }, 500)
  }
}
</script>
