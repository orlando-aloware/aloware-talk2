<template>
  <div>
    <q-card-section v-if='integrationData && integrationData.properties'
                    data-testid='integration-hubspot-card-section-1'>
      <a class="external-contact-integration-link-icon color-primary"
         target='_blank'
         :href="integrationData.link">
        <i class="fa fa-external-link" aria-hidden="true"/>
      </a>
      <p class='mb-0 text-bold' v-if='isPrimary && hasDuplicates'>
        Primary
      </p>
      <p class='mb-0'
         data-testid='integration-hubspot-name'
         v-if='isNameAvailable'>
        <span class='data-icon-label'>Name: </span>
        <span class='data-value'>
             <q-tooltip anchor='top middle'
                        self='center middle'>
              {{ fullName }}
            </q-tooltip>
            {{ fullName }}
          </span>
      </p>
      <p class='mb-0'
         data-testid='integration-hubspot-email'
         v-if='integrationData.properties.email'>
        <span class='data-icon-label'>Email: </span>
        <span class='data-value'>{{ integrationData.properties.email }}</span>
      </p>
      <p class='mb-0'
         data-testid='integration-hubspot-company'
         v-if='integrationData.properties.company'>
        <span class='data-icon-label'>Company: </span>
        <span class='data-value'>{{ integrationData.properties.company }}</span>
      </p>
      <p class='mb-0'
         data-testid='integration-hubspot-owner'
         v-if='integrationData.hubspot_owner'>
        <span class='data-icon-label'>Owner: </span>
        <span
          class='data-value'>{{ integrationData.hubspot_owner.firstName + ' ' + integrationData.hubspot_owner.lastName
          }}</span>
      </p>
      <!-- Start Lifecycle Stage Section -->
      <div class="row justify-between align-center relative" data-testid="integration-hubspot-lifecycle-stage">
        <p class="mb-0 no-wrap-block">
          <span class="data-icon-label">Lifecycle Stage: </span>
          <span class="data-value">
            {{ truncatedDisplayedLifecycleStage }}
          </span>
          <!-- Start Tooltip for full text lifecycle stage if truncated -->
          <q-tooltip v-if="truncatedDisplayedLifecycleStage !== displayedLifecycleStage" anchor="top middle"
                     self="center middle">
            {{ displayedLifecycleStage }}
          </q-tooltip>
          <!-- End Tooltip for full text lifecycle stage if truncated -->
        </p>
        <div v-if="isPrimary"
             class="absolute edit-btn-pos">
          <b-link :class="canUpdateLifecycleStage ? 'clickable' : 'not-clickable'"
                  :disabled="isReadOnly"
                  @click="onShowEditLifecycleStageMenu">
            <pencil-o-icon />
            <q-tooltip anchor="top middle" self="center middle"
                       :offset="isWidget ? [0, 50] : [0, 30]">
              <div :class="{ 'small-text': isWidget }">
                <span v-if="canUpdateLifecycleStage">Update Lifecycle Stage</span>
                <template v-if="!canUpdateLifecycleStage">
                  <p class="font-weight-bold mb-0">Update Lifecycle Stage is disabled</p>
                  <p class="mt-1 mb-0">Enable contact information updates in HubSpot's integration settings.</p>
                </template>
              </div>
            </q-tooltip>
          </b-link>
        </div>
      </div>
      <!-- Start Lifecycle Stage Menu -->
      <template v-if="isPrimary">
        <q-menu v-model="showEditLifecycleStageMenu"
                no-parent-event
                persistent
                :offset="[305, -120]"
                data-testid="edit-lifecycle-stage-menu">
          <div class="row no-wrap q-pa-md">
            <b-form data-testid="edit-lifecycle-stage-form" class="lifecycle-stage-form">
              <b-form-group label="Update Lifecycle Stage">
                <q-select v-model="selectedLifecycleStage"
                          :options="lifecycleStagesOptionsWithClear"
                          outlined
                          dense
                          data-testid="edit-lifecycle-stage-form-select" />
              </b-form-group>
              <div class="d-flex justify-content-between">
                <b-button type="button"
                          size="sm"
                          variant="light"
                          data-testid="edit-lifecycle-stage-form-cancel-button"
                          @click="onCancelLifecycleStageMenu">
                  Cancel
                </b-button>
                <b-button type="button"
                          size="sm"
                          variant="primary"
                          data-testid="edit-lifecycle-stage-form-save-button"
                          :disabled="lifecycleStageIsSubmitting"
                          @click="onSubmitLifecycleStageMenu">
                  <template v-if="lifecycleStageIsSubmitting">
                    <b-spinner small label="Small Spinner" type="grow" class="mr-1"></b-spinner>
                    <span class="mx-1">Saving...</span>
                  </template>
                  <template v-else>
                    <span>Save</span>
                  </template>
                </b-button>
              </div>
            </b-form>
          </div>
        </q-menu>
        <!-- End Lifecycle Stage Menu -->
      </template>
      <!-- End Lifecycle Stage Section -->
    </q-card-section>

    <q-card-section class='pt-0'
                    data-testid='integration-hubspot-card-section-2'
                    :class='isPrimary ? "pb-0" : "pb-16"'
                    v-if='integrationData.properties'>
      <q-card class='deals mb-1'
              v-for='(deal, index) in integrationData.deals'
              :key='index'
              flat bordered>
        <q-card-section>
          <q-card-section class='p-0'>
            <h6 class='mb-2'>
              <b-link class='deals-title ml-0'
                      :href="deal.link"
                      data-testid='integration-hubspot-deal-link'
                      target='_blank'>
                {{ deal.properties.dealname }}
              </b-link>
            </h6>
            <p class='mb-1 d-flex' data-testid='integration-hubspot-amount'>
              <span class='data-icon-label'>Amount: </span>
              <span class='data-value ml-1'
                    v-if='deal.properties && deal.properties.amount'>
                  <q-tooltip anchor='top middle'
                             self='center middle'>
                    {{ deal.properties.amount | toCurrency }}
                  </q-tooltip>
                  {{ deal.properties.amount | toCurrency }}
                </span>
            </p>
            <p class='mb-1 d-flex' data-testid='integration-hubspot-pipeline'>
              <span class='data-icon-label'>Pipeline: </span>
              <span class='data-value ml-1'>
                  <q-tooltip anchor='top middle'
                             self='center middle'>
                    {{ deal.pipeline_label }}
                  </q-tooltip>
                  {{ deal.pipeline_label }}
                </span>
            </p>
            <p class='mb-1 d-flex' data-testid='integration-hubspot-stage'>
              <span class='data-icon-label'>Stage: </span>
              <span class='data-value ml-1'>
                  <q-tooltip anchor='top middle'
                             self='center middle'>
                    {{ deal.dealstage_label }}
                  </q-tooltip>
                  {{ deal.dealstage_label }}
                </span>
            </p>
          </q-card-section>
        </q-card-section>
      </q-card>
    </q-card-section>
  </div>
</template>
<script>
import { hubspotIntegrationMixin } from 'src/plugins/mixins'
import PencilOIcon from 'components/icons/pencil-o-icon.vue'
import talk2Api from 'src/plugins/api/api'
import { mapState } from 'vuex'

export default {
  name: 'integration-hubspot-one-contact',
  mixins: [
    hubspotIntegrationMixin
  ],
  props: {
    integrationData: {
      type: Object,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    lifecycleStagesOptions: {
      type: Array,
      required: true
    },
    contactId: {
      type: [String, Number],
      required: true
    },
    isReadOnly: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  components: {
    PencilOIcon
  },
  data () {
    return {
      showEditLifecycleStageMenu: false,
      selectedLifecycleStage: this.lifecycleStagesOptions.find(stage => stage.value === this.integrationData?.properties?.lifecyclestage) || null,
      previouslySelectedLifecycleStage: null,
      displayedLifecycleStage: this.lifecycleStagesOptions.find(stage => stage.value === this.integrationData?.properties?.lifecyclestage)?.label || 'None',
      lifecycleStageIsSubmitting: false
    }
  },
  computed: {
    ...mapState(['isWidget']),
    hasDuplicates () {
      return this.integrationData && this.integrationData.duplicates && this.integrationData.duplicates.length > 0
    },

    isNameAvailable () {
      return this.integrationData.properties.firstname !== undefined || this.integrationData.properties.lastname !== undefined
    },

    fullName () {
      const firstname = this.integrationData.properties.firstname ? this.integrationData.properties.firstname : ''
      const lastname = this.integrationData.properties.lastname ? this.integrationData.properties.lastname : ''
      return `${firstname} ${lastname}`.trim()
    },

    lifecycleStagesOptionsWithClear () {
      return [
        { label: 'None (Unset)', value: null },
        ...this.lifecycleStagesOptions
      ]
    },

    truncatedDisplayedLifecycleStage () {
      if (!this.displayedLifecycleStage) return ''
      if (this.displayedLifecycleStage.length <= 18) return this.displayedLifecycleStage
      return this.displayedLifecycleStage.substring(0, 18) + '...'
    },

    canUpdateLifecycleStage () {
      return !!this.integrationData?.can_update_lifecycle_stages
    }
  },
  methods: {
    onShowEditLifecycleStageMenu () {
      if (!this.canUpdateLifecycleStage) return

      this.showEditLifecycleStageMenu = true
      this.previouslySelectedLifecycleStage = this.selectedLifecycleStage
    },
    onCancelLifecycleStageMenu () {
      this.showEditLifecycleStageMenu = false

      // Revert to the lifecycle stage previously selected when canceling the menu
      this.selectedLifecycleStage = this.previouslySelectedLifecycleStage
    },

    async onSubmitLifecycleStageMenu () {
      this.lifecycleStageIsSubmitting = true

      const response = await talk2Api.V1.integrations.hubspot.updateLifecycleStage(
        this.contactId,
        this.selectedLifecycleStage?.value,
        this.isMovingBackwardsInLifecycle()
      )

      if (response.status !== 200) {
        // Revert to the previous stage if there is an error from the back-end
        this.selectedLifecycleStage = this.previouslySelectedLifecycleStage
        this.$generalNotification(response.data.message, 'error')
      } else {
        // Update the displayed text in the JIT card based on the selected lifecycle stage
        this.displayedLifecycleStage = this.lifecycleStagesOptions.find(stage => stage.value === this.selectedLifecycleStage.value)?.label || 'None'
        this.$generalNotification(response.data.message, 'success')
      }

      this.lifecycleStageIsSubmitting = false
      this.showEditLifecycleStageMenu = false
    },

    /**
     * It is important to know if the user is moving backwards in the lifecycle stage.
     * This is because we will send a `reset_required` flag to the API to signal if a reset is needed.
     */
    isMovingBackwardsInLifecycle () {
      if (!this.previouslySelectedLifecycleStage.value || !this.selectedLifecycleStage.value) return false

      const previousIndex = this.lifecycleStagesOptions.findIndex(stage => stage.value === this.previouslySelectedLifecycleStage.value)
      const currentIndex = this.lifecycleStagesOptions.findIndex(stage => stage.value === this.selectedLifecycleStage.value)

      return currentIndex < previousIndex
    }
  },

  watch: {
    'integrationData.properties.lifecyclestage': function (newValue) {
      // Update the displayed text in the JIT card when the integration data changes from the parent component
      this.displayedLifecycleStage = this.lifecycleStagesOptions.find(stage => stage.value === newValue)?.label || 'None'

      if (!newValue) this.selectedLifecycleStage = this.lifecycleStagesOptionsWithClear.find(stage => stage.value === null) || null
      else this.selectedLifecycleStage = this.lifecycleStagesOptionsWithClear.find(stage => stage.value === newValue) || null
    }
  },

  mounted () {
    // Set the initial value of the select box to 'None (Unset)' if the lifecycle stage is not set
    if (!this.integrationData?.properties?.lifecyclestage) this.selectedLifecycleStage = this.lifecycleStagesOptionsWithClear.find(stage => stage.value === null) || null
    else this.selectedLifecycleStage = this.lifecycleStagesOptionsWithClear.find(stage => stage.value === this.integrationData?.properties?.lifecyclestage) || null
  }
}

</script>

<style scoped>
.clickable {
  cursor: pointer;
}

.not-clickable {
  cursor: not-allowed;
}

.no-wrap-block {
  white-space: nowrap;
  overflow: hidden;
}

.edit-btn-pos {
  right: 10px;
  bottom: 18px;
}

.lifecycle-stage-form {
  width: 220px;
}
</style>
