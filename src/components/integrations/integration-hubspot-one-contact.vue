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
      <div class='row justify-between align-center relative'
          @mouseover='showLifecycleStageEditButton = true'
          @mouseleave='showLifecycleStageEditButton = false'
          data-testid='integration-hubspot-lifecycle-stage'
        >
        <p class='mb-0' style="white-space: nowrap; overflow: hidden;">
          <span class='data-icon-label'>Lifecycle Stage: </span>
          <span class='data-value'>
            {{ truncatedDisplayedLifecycleStage }}
          </span>
          <!-- Start Tooltip for full text lifecycle stage if truncated -->
          <q-tooltip v-if="truncatedDisplayedLifecycleStage !== displayedLifecycleStage" anchor='top middle' self='center middle'>
              {{ displayedLifecycleStage }}
          </q-tooltip>
          <!-- End Tooltip for full text lifecycle stage if truncated -->
        </p>
        <div v-if='canUpdateLifecycleStage && showLifecycleStageEditButton && isPrimary' class="absolute" style="right: 10px; bottom: 18px;">
          <b-link class='clickable' @click='onShowEditLifecycleStageMenu'>
            <pencil-o-icon />
            <q-tooltip anchor='top middle' self='center middle'>
              Update Lifecycle Stage
            </q-tooltip>
          </b-link>
        </div>
      </div>
      <!-- Start Lifecycle Stage Menu -->
      <template v-if="isPrimary">
        <q-menu v-model='showEditLifecycleStageMenu'
                no-parent-event
                persistent
                :offset='[290, -120]'
                data-testid='edit-lifecycle-stage-menu'>
          <div class='row no-wrap q-pa-md'>
            <b-form data-testid='edit-lifecycle-stage-form' @submit.prevent='onSubmit'>
              <b-form-group label="Update Lifecycle Stage">
                <b-form-select v-model='selectedLifecycleStage' :options='lifecycleStagesOptionsWithClear'></b-form-select>
              </b-form-group>
              <div class='d-flex justify-content-between'>
                  <b-button type='button'
                            size='sm'
                            variant='light'
                            data-testid='edit-lifecycle-stage-form-cancel-button'
                            @click='onCancelLifecycleStageMenu'>
                    Cancel
                  </b-button>
                  <b-button type='button'
                            size='sm'
                            variant='primary'
                            data-testid='edit-lifecycle-stage-form-save-button'
                            :disabled='lifecycleStageIsSubmitting'
                            @click='onSubmitLifecycleStageMenu'>
                    <template v-if="lifecycleStageIsSubmitting">
                      <b-spinner small label='Small Spinner' type='grow' class='mr-1'></b-spinner>
                      <span class='mx-1'>Saving...</span>
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
import {
  hubspotIntegrationMixin
} from 'src/plugins/mixins'
import PencilOIcon from 'components/icons/pencil-o-icon.vue'

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
    }
  },
  components: {
    PencilOIcon
  },
  data () {
    return {
      showLifecycleStageEditButton: false,
      showEditLifecycleStageMenu: false,
      selectedLifecycleStage: this.integrationData.properties.lifecyclestage || null,
      previouslySelectedLifecycleStage: null,
      displayedLifecycleStage: this.lifecycleStagesOptions.find(stage => stage.value === this.integrationData.properties.lifecyclestage)?.text || 'None',
      lifecycleStageIsSubmitting: false
    }
  },
  computed: {
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
        { text: 'None (Unset)', value: null },
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
      this.showEditLifecycleStageMenu = true
      this.previouslySelectedLifecycleStage = this.selectedLifecycleStage
    },
    onCancelLifecycleStageMenu () {
      this.showEditLifecycleStageMenu = false

      // Revert to the lifecycle stage previously selected when canceling the menu
      this.selectedLifecycleStage = this.previouslySelectedLifecycleStage
    },

    onSubmitLifecycleStageMenu () {
      this.lifecycleStageIsSubmitting = true
      setTimeout(() => {
        this.lifecycleStageIsSubmitting = false
        this.showEditLifecycleStageMenu = false
        this.displayedLifecycleStage = this.lifecycleStagesOptions.find(stage => stage.value === this.selectedLifecycleStage)?.text || 'None'
        this.$generalNotification('HubSpot Lifecycle Stage has been updated.')
        console.log('onSubmitLifecycleStageMenu', 'submitting: ' + this.selectedLifecycleStage)
      }, 1000)
    }
  }
}

</script>

<style scoped>
.clickable {
  cursor: pointer;
}
</style>
