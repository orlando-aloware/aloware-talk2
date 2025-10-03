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
    <!-- Loading Indicator -->
      <div v-if="isLoading" class="loading-indicator">
        <span class="loading-text text-caption">Loading {{ loadedSections }}/4</span>
        <div class="loading-details">
          <div class="loading-item">
            <i :class="contactIntegrationDataLoaded ? 'fas fa-check' : 'fas fa-spinner fa-spin'" />
            Contact Information
          </div>
          <div class="loading-item">
            <i :class="contactIntegrationDataLoaded && !isLoadingLifecycleStages ? 'fas fa-check' : 'fas fa-spinner fa-spin'" />
            Lifecycle Stage
          </div>
          <div class="loading-item">
            <i :class="contactIntegrationDataLoaded && !isLoadingCompanyAssociation ? 'fas fa-check' : 'fas fa-spinner fa-spin'" />
            Associated Company
          </div>
          <div class="loading-item">
            <i :class="contactIntegrationDataLoaded && !isLoadingConversationThreads ? 'fas fa-check' : 'fas fa-spinner fa-spin'" />
            Conversation Threads
          </div>
        </div>
      </div>
      <!-- End Loading Indicator -->

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
      <template v-if="contactIntegrationDataLoaded && forceComponentReloadFlag">
        <!-- Start Duplicate Contacts Section -->
        <q-card-section
          class='duplicateContactPhoneNumberMessage'
          v-if='hasDuplicates'
        >
          <div v-html="duplicatePhoneNumbersDescription"></div>
        </q-card-section>
        <q-separator v-if='hasDuplicates' />
        <integration-hubspot-one-contact
          ref="hubspotOneContact"
          v-if='integrationData'
          is-primary
          :integration-data="integrationData"
          :lifecycle-stages-options="lifecycleStagesOptions"
          :contact-id="contact.id"
          :is-read-only="isReadOnly"
          :show-duplicates="showDuplicates"
          @toggle-duplicates="toggleDuplicates"
        >
          <template #duplicates-section>
            <!-- Start Duplicate Contacts Section -->
            <template v-if="hasDuplicates && showDuplicates">
              <div
                v-for="duplicate in integrationData.duplicates"
                :key="duplicate.id"
              >
                <q-separator data-testid="integration-hubspot-separator" />
                <integration-hubspot-one-contact
                  :integrationData="duplicate"
                  :lifecycle-stages-options="lifecycleStagesOptions"
                  :contact-id="contact.id"
                  :is-read-only="isReadOnly"
                />
              </div>
            </template>
            <!-- End Duplicate Contacts Section -->
          </template>
          <template #conversation-threads-section>
            <template v-if="integrationData.conversation_threads?.length > 0">
              <q-separator v-if="integrationData.properties"></q-separator>
              <q-card-section>
                <div class="text-muted">
                  This contact has synced conversation threads with Inboxes in HubSpot {{ integrationData.total_threads > 1 ? `(${integrationData.conversation_threads.length} of ${integrationData.total_threads} shown)` : '' }}.
                </div>
                <div v-if="integrationData.conversation_threads && integrationData.conversation_threads.length > 0" class="mt-2">
                  <q-card class="conversation-threads mb-1"
                          v-for="(thread, index) in integrationData.conversation_threads"
                          :key="index"
                          flat bordered>
                    <q-card-section>
                      <q-card-section class="p-0">
                        <h6 class="mb-2">
                          <b-link class="conversation-thread-title ml-0"
                                  :href="thread.link"
                                  data-testid="integration-hubspot-conversation-link"
                                  target="_blank">
                            {{ thread.channel_account_name }}
                          </b-link>
                        </h6>
                        <p class="mb-1 d-flex" data-testid="integration-hubspot-conversation-status">
                          <span class="data-icon-label">Status: </span>
                          <span class="data-value ml-1">
                            <q-tooltip anchor="top middle"
                                       self="center middle">
                              {{ thread.is_active ? 'Open' : 'Closed' }}
                            </q-tooltip>
                            {{ thread.is_active ? 'Open' : 'Closed' }}
                          </span>
                        </p>
                        <p class="mb-1 d-flex" data-testid="integration-hubspot-conversation-created">
                          <span class="data-icon-label">Created: </span>
                          <span class="data-value ml-1">
                            <q-tooltip anchor="top middle"
                                       self="center middle">
                              {{ thread.created_at | dateTimePassed }}
                            </q-tooltip>
                            {{ thread.created_at | dateTimePassed }}
                          </span>
                        </p>
                      </q-card-section>
                    </q-card-section>
                  </q-card>
                </div>
              </q-card-section>
            </template>
          </template>
          <template #company-section>
            <!-- Start Company Association -->
            <template v-if="integrationData.associated_company">
              <q-separator v-if="integrationData.properties" />
              <q-card-section class="text-muted">
                {{ integrationData.properties ? 'This contact is also associated with a HubSpot company' : 'This contact is associated with a HubSpot company' }}
              </q-card-section>
              <q-separator />
              <q-card-section data-testid="integration-hubspot-company-section">
                <p class="text-bold mb-0">{{ integrationData.associated_company.name || 'No Name Set' }}</p>
                <a class="external-contact-integration-link-icon color-primary"
                   target='_blank'
                   :href="integrationData.associated_company.link">
                  <i class="fa fa-external-link" aria-hidden="true"/>
                </a>
                <p class='mb-0'>
                  <span class='data-icon-label'>Domain: </span>
                  <span class='data-value'>{{ integrationData.associated_company.domain || '--' }}</span>
                </p>
                <p class='mb-0'>
                  <span class='data-icon-label'>Phone: </span>
                  <span class='data-value'>{{ integrationData.associated_company.phone || '--' }}</span>
                </p>
              </q-card-section>
            </template>
            <!-- End Company Association -->
          </template>
        </integration-hubspot-one-contact>
        <!-- End Duplicate Contacts Section -->
        <!-- Start Sync Button -->
        <q-card-section data-testid="integration-hubspot-card-section-3">
          <b-row>
            <b-button
              :disabled="isReadOnly"
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
                :offset="isWidget ? [0, 100] : [0, 50]"
              >
                <div :class="{ 'small-text': isWidget }">
                  <p class="font-weight-bold mb-0">Click on this button to sync the data for this contact between {{ whiteLabelName }} and HubSpot.</p>
                  <p class="font-weight-bold">You'll want to click on this button if:</p>
                  <p class="mt-1 mb-0">- The contact was recently merged in HubSpot with another contact.</p>
                  <p class="mt-0 mb-0">- You notice any inconsistencies between {{ whiteLabelName }} and HubSpot data on
                    this contact.</p>
                </div>
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
              :disabled="isReadOnly"
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
              :disabled="isEnrolling || !isWorkflowValid || isReadOnly"
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
      </template>
      <!-- End JIT Card Main Content -->
    </q-card>
  </div>
</template>

<script>
import IntegrationHubspotOneContact from 'src/components/integrations/integration-hubspot-one-contact.vue'
import _ from 'lodash'
import WorkflowSelector from 'src/components/integrations/workflow-selector'
import talk2Api from 'src/plugins/api/api'
import {
  hubspotIntegrationMixin,
  integrationMixin,
  teamInboxPropsMixin,
  whiteLabelMixin
} from 'src/plugins/mixins'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'integration-hubspot',

  components: { IntegrationHubspotOneContact, WorkflowSelector },

  mixins: [
    hubspotIntegrationMixin,
    integrationMixin,
    whiteLabelMixin,
    teamInboxPropsMixin
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
    },

    isReadOnly: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    ...mapState(['statics', 'isWidget']),

    isLoading () {
      return !this.contactIntegrationDataLoaded || this.isLoadingLifecycleStages || this.isLoadingCompanyAssociation || this.isLoadingConversationThreads
    },

    loadedSections () {
      let count = 0
      if (this.contactIntegrationDataLoaded) {
        count++

        // Only count these if contact info is loaded
        if (!this.isLoadingLifecycleStages) count++
        if (!this.isLoadingCompanyAssociation) count++
        if (!this.isLoadingConversationThreads) count++
      }

      return count
    },

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

      if (!this.integrationData.id) {
        return 'This contact is not linked to HubSpot because the phone number is already connected to another Aloware contact through a different HubSpot record.\n' +
          '<strong>Resolution:</strong> In HubSpot, remove this phone number from the conflicting record and assign it to a <strong>new, unused HubSpot contact</strong>. This will allow Aloware to link the number correctly.'
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
      showDuplicates: false,
      isLoadingLifecycleStages: false,
      isLoadingCompanyAssociation: false,
      isLoadingConversationThreads: false,
      forceComponentReloadFlag: true
    }
  },

  async mounted () {
    if (this.contact && this.contact.id) {
      // Load the contact information first
      await this.getData()
    }
  },

  methods: {
    ...mapActions('contacts', ['setContact', 'setContactClone']),

    /**
     * Load the main contact information and duplicates section
     */
    getData () {
      return this.getIntegrationData(this.contact, 'hubspot', null, this.teamInbox)
        .then(response => {
          this.integrationData = response.data
          this.contactIntegrationDataLoaded = true

          // There are times when the contact is not loaded yet, so no need to load the other sections
          if (this.contact?.id) {
            this.setCompanyAssociationSection(this.contact.id)
            this.setConversationThreads(this.contact.id)
            this.setLifecycleStagesSection()
          }
        })
    },

    /**
     * Load the lifecycle stages section
     */
    async setLifecycleStagesSection () {
      this.isLoadingLifecycleStages = true

      try {
        const response = await this.getHubspotLifecycleStages()

        // Create a new object with all the current properties and the new ones
        // This ensures Vue's reactivity system detects the change
        this.integrationData = {
          ...this.integrationData,
          lifecycle_stages: response.data.data.lifecycle_stages,
          can_update_lifecycle_stages: response.data.data.can_update_lifecycle_stages
        }
        this.forceRerenderHubspotOneComponent()
      } catch (error) {
        this.$handleErrors(error.response)
      } finally {
        this.isLoadingLifecycleStages = false
      }
    },

    /**
     * Load the company association section
     *
     * @param contactId
     */
    async setCompanyAssociationSection (contactId) {
      this.isLoadingCompanyAssociation = true

      try {
        const response = await this.getHubspotContactCompanyAssociation(contactId)

        // Create a new object with all the current properties and the new ones
        // This ensures Vue's reactivity system detects the change
        this.integrationData = {
          ...this.integrationData,
          associated_company: response?.data?.associated_company
        }
        this.forceRerenderHubspotOneComponent()
      } catch (error) {
        this.$handleErrors(error.response)
      } finally {
        this.isLoadingCompanyAssociation = false
      }
    },

    /**
     * Load the conversation threads section
     *
     * @param contactId
     * @returns {Promise<void>}
     */
    async setConversationThreads (contactId) {
      this.isLoadingConversationThreads = true

      try {
        const response = await this.getHubspotContactConversationThreads(contactId)

        // Create a new object with all the current properties and the new ones
        // This ensures Vue's reactivity system detects the change
        this.integrationData = {
          ...this.integrationData,
          conversation_threads: response.data.conversation_threads,
          total_threads: response.data.total_threads
        }

        this.forceRerenderHubspotOneComponent()
      } catch (error) {
        this.$handleErrors(error.response)
      } finally {
        this.isLoadingConversationThreads = false
      }
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
    },

    /**
     * Re-render the Hubspot One component to refresh the updated state
     */
    forceRerenderHubspotOneComponent () {
      this.forceComponentReloadFlag = false
      // Force re-render of the hubspot-one-contact component
      this.$nextTick(() => {
        this.forceComponentReloadFlag = true
      })
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
<style scoped>
.small-text {
  font-size: 12px;
}

.loading-indicator {
  background-color: #FF7A59;
  padding: 0 8px;
  color: white;
  position: relative;
  cursor: help;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
}

.loading-text {
  display: inline-block;
  white-space: nowrap;
  font-size: 9px;
  font-weight: 500;
  line-height: 1;
  margin: 0;
  padding: 0;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.loading-details {
  display: none;
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  z-index: 10;
  min-width: 200px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.loading-indicator:hover .loading-details {
  display: block;
}

.loading-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
  color: #333;
  font-size: 11px;
}

.loading-item i {
  width: 16px;
  text-align: center;
}

.loading-item i.fa-check {
  color: #28a745;
}

.loading-item i.fa-spinner {
  color: #666;
}
</style>
