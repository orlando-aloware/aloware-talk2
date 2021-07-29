<template>
  <div v-if="integration_data && hubspotLink"
       class="hubspot-integration-wrapper">
    <q-card class="my-card"
            flat
            bordered>
      <q-item>
        <q-item-section>
          <b-link class="ml-2"
                  target="_blank"
                  :href="hubspotLink">
            <i class="fab fa-hubspot hubspot-icon mr-3"></i>
            <span class="integration-title">Hubspot</span>
          </b-link>
        </q-item-section>
      </q-item>

      <q-separator/>

      <q-card-section>
        <p class="mb-0"
           v-if="integration_data.properties.firstname && integration_data.properties.lastname">
             <span class="data-icon-label">
              Name:
            </span>
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
            <span class="data-icon-label">
              Email:
            </span>
          <span class="data-value">
            <q-tooltip anchor="top middle"
                       self="center middle">
              {{ integration_data.properties.email.value }}
            </q-tooltip>
              {{ integration_data.properties.email.value }}
            </span>
        </p>
        <p class="mb-0"
           v-if="integration_data.properties.company">
             <span class="data-icon-label">
              Company:
            </span>
          <span class="data-value">
            <q-tooltip anchor="top middle"
                       self="center middle">
              {{ integration_data.properties.email.value }}
            </q-tooltip>
              {{ integration_data.properties.company.value }}
            </span>
        </p>
        <p class="mb-0"
           v-if="integration_data.properties.hubspot_owner">
             <span class="data-icon-label">
              Owner:
            </span>
          <span class="data-value">
            <q-tooltip anchor="top middle"
                       self="center middle">
              {{ integration_data.properties.hubspot_owner.firstName + ' ' + integration_data.properties.hubspot_owner.lastName }}
            </q-tooltip>
              {{ integration_data.properties.hubspot_owner.firstName + ' ' + integration_data.properties.hubspot_owner.lastName }}
            </span>
        </p>
      </q-card-section>

      <q-card-section horizontal>
        <q-card class="my-card mr-3 ml-3 deals"
                v-for="(deal, index) in integration_data.properties.deals"
                :key="index"
                flat bordered>
          <q-card-section horizontal>
            <q-card-section class="pl-2 pr-2">
              <h6>
                <b-link class="deals-title"
                        :href="hubspotContactBaseLink + 'deal/' + deal.dealId"
                        target="_blank">
                  {{ deal.properties.dealname.value }}
                </b-link>
              </h6>
              <p class="mb-0">
                <span class="data-icon-label">Amount: </span>
                <span class="data-value">
                  <q-tooltip anchor="top middle"
                             self="center middle">
                    {{ deal.properties.amount.value | toCurrency }}
                  </q-tooltip>
                  {{ deal.properties.amount.value | toCurrency }}
                </span>
              </p>
              <p class="mb-0">
                <span class="data-icon-label">Pipeline: </span>
                <span class="data-value">
                  <q-tooltip anchor="top middle"
                             self="center middle">
                    {{ deal.properties.pipeline.label }}
                  </q-tooltip>
                  {{ deal.properties.pipeline.label }}
                </span>
              </p>
              <p class="mb-0">
                <span class="data-icon-label">Stage: </span>
                <span class="data-value">
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
                @click.prevent="enrollToWorkflow">
        <q-spinner-bars v-if="isEnrolling"
                        color="white">
        </q-spinner-bars>
        {{ isEnrolling ? 'Enrolling...' : 'Enroll' }}
      </b-button>
    </b-popover>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import WorkflowSelector from 'src/components/integrations/workflow-selector'

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
    ...mapState(['currentCompany']),

    isWorkflowValid () {
      return this.workflow.id
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
    },

    hubspotLink () {
      if (this.hubspotContactBaseLink) {
        return `${this.hubspotContactBaseLink}contact/${this.contact.integration_data.hubspot.contact_id}`
      }

      return false
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
      integration_data: null
    }
  },

  mounted () {
    if (this.contact && this.contact.id) {
      this.getData()
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
          // emit on parent if there's a need to do after workflow enrollment
          this.$emit('enrolledToWorkflow', this.workflow)
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
    }
  },

  watch: {
    'contact.id': function () {
      if (this.contact && this.contact.id) {
        this.getData()
      }
    }
  }
}
</script>
