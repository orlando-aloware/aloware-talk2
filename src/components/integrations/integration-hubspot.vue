<template>
  <div class="hubspot-integration-wrapper">
    <q-card class="hubspot-card"
            flat>
      <q-item class="p-0"
              v-if="hubspotLink">
        <q-item-section>
          <b-link target="_blank"
                  :href="hubspotLink">
            <i class="fab fa-hubspot hubspot-icon"></i>
            <span class="integration-title">Hubspot</span>
          </b-link>
        </q-item-section>
      </q-item>

      <q-separator/>

      <q-card-section v-if="integration_data && integration_data.properties">
        <p class="mb-0"
           v-if="integration_data.properties.firstname !== undefined && integration_data.properties.lastname !== undefined">
          <span class="data-icon-label">Name: </span>
          <span class="data-value">
             <q-tooltip anchor="top middle"
                        self="center middle">
              {{ integration_data.properties.firstname.value + ' ' + integration_data.properties.lastname.value }}
            </q-tooltip>
            {{ integration_data.properties.firstname.value + ' ' + integration_data.properties.lastname.value }}
          </span>
        </p>
        <p class="mb-0"
           v-if="integration_data.properties.email">
          <span class="data-icon-label">Email: </span>
          <span class="data-value">{{ integration_data.properties.email.value }}</span>
        </p>
        <p class="mb-0"
           v-if="integration_data.properties.company">
          <span class="data-icon-label">Company: </span>
          <span class="data-value">{{ integration_data.properties.company.value }}</span>
        </p>
        <p class="mb-0"
           v-if="integration_data.properties.hubspot_owner">
          <span class="data-icon-label">Owner: </span>
          <span class="data-value">{{ integration_data.properties.hubspot_owner.firstName + ' ' + integration_data.properties.hubspot_owner.lastName }}</span>
        </p>
      </q-card-section>

      <q-card-section class="pt-0 pb-0"
                      v-if="integration_data.properties">
        <q-card class="deals mb-1"
                v-for="(deal, index) in integration_data.properties.deals"
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
              <p class="mb-1 d-inline-flex">
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
              <p class="mb-1 d-inline-flex">
                <span class="data-icon-label">Pipeline: </span>
                <span class="data-value ml-1">
                  <q-tooltip anchor="top middle"
                             self="center middle">
                    {{ deal.properties.pipeline.label }}
                  </q-tooltip>
                  {{ deal.properties.pipeline.label }}
                </span>
              </p>
              <p class="mb-1 d-inline-flex">
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
              <p class="font-weight-bold mb-0">Click on this button to sync the data for this contact between Aloware and HubSpot.</p>
              <p class="font-weight-bold">You'll want to click on this button if:</p>
              <p class="mt-1 mb-0">- The contact was recently merged in HubSpot with another contact.</p>
              <p class="mt-0 mb-0">- You notice any inconsistencies between Aloware and HubSpot data on this contact.</p>
            </q-tooltip>
          </b-button>
        </b-row>
      </q-card-section>

      <q-card-section
        v-if="integration_data && integration_data.properties && integration_data.properties.email && integration_data.properties.email.value && false">
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
import { mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import WorkflowSelector from 'src/components/integrations/workflow-selector'
import _ from 'lodash'

export default {
  name: 'integration-hubspot',

  components: { WorkflowSelector },

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

    isWorkflowValid () {
      return this.workflow.id
    },

    companyDomain () {
      return this.currentCompany.hubspot_company_ui_domain || 'app.hubspot.com'
    },

    hubspotContactBaseLink () {
      if (this.currentCompany &&
        this.currentCompany.hubspot_integration_enabled &&
        this.contact &&
        ((this.contact.integrations &&
            this.contact.integrations.hubspot) ||
          (this.contact.integration_data &&
            this.contact.integration_data.hubspot)
        ) &&
        this.currentCompany.hubspot_marketing_portal_id) {
        return `https://${this.companyDomain}/contacts/${this.currentCompany.hubspot_marketing_portal_id}/`
      }

      return false
    },

    hubspotLink () {
      if (this.hubspotContactBaseLink) {
        const contactId = this.getContactId()
        return contactId ? `${this.hubspotContactBaseLink}contact/${contactId}` : false
      }

      return false
    }
  },

  data () {
    return {
      isEnrolling: false,
      isSyncing: false,
      integration_name: 'hubspot',
      showWorkflowSelectorForm: false,
      workflow: {
        email: null,
        id: null
      },
      integration_data: null
    }
  },

  async mounted () {
    if (this.contact && this.contact.id) {
      await this.getData()
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

    getContactId () {
      const contactId = { data: null }
      switch (true) {
        case this.contact.integration_data && !_.isEmpty(this.contact.integration_data):
          contactId.data = this.contact.integration_data.hubspot.contact_id
          break
        case this.contact.integrations && !_.isEmpty(this.contact.integrations):
          contactId.data = this.contact.integrations.hubspot.contact_id
          break
        default:
          contactId.data = null
      }

      return contactId.data
    },

    onWorkflowSelected (workflowId) {
      this.workflow.id = workflowId
    },

    resetWorkflowEnrollment () {
      this.workflow.id = null
    },

    enrollToWorkflow () {
      this.isEnrolling = true
      this.workflow.email = this.integration_data.properties.email ? this.integration_data.properties.email.value : ''
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
      if (this.contact && this.contact.id && this.$route.params.id === this.contact.id.toString()) {
        this.getData()
      }
    }, 500)
  }
}
</script>
