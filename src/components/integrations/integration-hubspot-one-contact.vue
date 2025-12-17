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
      <p class='mb-0'
         data-testid='integration-hubspot-phone'
         v-if='integrationData.properties?.phone'>
        <span class='data-icon-label'>Phone: </span>
        <span class='data-value'>
          {{ integrationData.properties.phone }}
          <span
            v-if="isPrimary && isPhoneConflicted"
            class='ml-1'
            aria-label='More info'
            style='cursor: pointer'
            @mouseenter='showPhoneConflictTooltip = true'
            @mouseleave='showPhoneConflictTooltip = false'
          >
            <i class='fa fa-exclamation-triangle' aria-hidden='true'></i>
          </span>
        </span>
        <q-tooltip
          v-if="isPrimary && isPhoneConflicted"
          v-model='showPhoneConflictTooltip'
          anchor='top middle'
          self='bottom middle'
          :offset='[0, 8]'
        >
          <div>This number is linked to another Aloware contact.</div>
          <div class='mt-1'>Merge duplicates in HubSpot or assign a different unique number to re-link.</div>
        </q-tooltip>
      </p>
      <p class='mb-0'
         data-testid='integration-hubspot-mobilephone'
         v-if='integrationData.properties?.mobilephone'>
        <span class='data-icon-label'>Mobile Phone: </span>
        <span class='data-value'>
          {{ integrationData.properties.mobilephone }}
          <span
            v-if="isPrimary && isMobilePhoneConflicted"
            class='ml-1'
            aria-label='More info'
            style='cursor: pointer'
            @mouseenter='showMobileConflictTooltip = true'
            @mouseleave='showMobileConflictTooltip = false'
          >
            <i class='fa fa-exclamation-triangle' aria-hidden='true'></i>
          </span>
        </span>
        <q-tooltip
          v-if="isPrimary && isMobilePhoneConflicted"
          v-model='showMobileConflictTooltip'
          anchor='top middle'
          self='bottom middle'
          :offset='[0, 8]'
        >
          <div>This number is linked to another Aloware contact.</div>
          <div class='mt-1'>Merge duplicates in HubSpot or assign a different unique number to re-link.</div>
        </q-tooltip>
      </p>
      <!-- Start Lifecycle Stage Section -->
      <div v-if="lifecycleStagesOptions.length > 1" class="lifecycle-stage-container" data-testid="integration-hubspot-lifecycle-stage">
        <div class="d-flex justify-content-between align-items-center">
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
          <div v-if="isPrimary">
            <b-link :class="canUpdateLifecycleStage ? 'clickable' : 'not-clickable'"
                    :disabled="isReadOnly" @click="onShowEditLifecycleStageMenu">
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
      </div>

      <p class='mb-0 mt-2'
         data-testid='integration-hubspot-aloware-contact-link'
         v-if='integrationData.aloware_contact_id'>
        <span class='data-icon-label'>
          <router-link :to="{ path: '/contacts/' + integrationData.aloware_contact_id }" style="margin-left: 0">Aloware Contact Link</router-link>
        </span>
      </p>

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
      <!-- Start Deals Section -->
      <div v-if="integrationData.deals && integrationData.deals.length > 0" class="mt-2">
        <q-card class='deals mb-1'
                v-for='(deal, index) in integrationData.deals'
                :key='index'
                flat bordered>
          <q-card-section>
            <q-card-section class='p-0'>
              <h6 class='mb-0'>
                <b-link class='deals-title ml-0'
                          :href="deal.link"
                          data-testid='integration-hubspot-deal-link'
                          target='_blank'>
                  <div class='d-flex justify-content-between align-items-center mb-2'>
                      <span>{{ deal.properties.dealname }}</span>
                      <span class='font-weight-bold'>$</span>
                  </div>
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
      </div>
      <!-- End Deals Section -->
    </q-card-section>
    <!-- Start See All Matches Link -->
    <b-button
      v-if="hasDuplicates"
      size="sm"
      variant="link"
      tabindex="0"
      block
      class="see-all-matches"
      @click="$emit('toggle-duplicates')"
    >
      {{ showDuplicates ? 'See less contact matches' : 'See all contact matches' }}
    </b-button>
    <!-- End See All Matches Link -->
    <slot name="duplicates-section"></slot>
    <slot name="conversation-threads-section"></slot>
    <slot name="company-section"></slot>
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
    },
    showDuplicates: {
      type: Boolean,
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
      lifecycleStageIsSubmitting: false,
      showNoPhoneTooltip: false,
      showPhoneConflictTooltip: false,
      showMobileConflictTooltip: false
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
    },

    isPhoneConflicted () {
      return this.isNumberConflictedForAnotherAlowareContact(this.integrationData?.properties?.phone)
    },

    isMobilePhoneConflicted () {
      return this.isNumberConflictedForAnotherAlowareContact(this.integrationData?.properties?.mobilephone)
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
    },

    isNumberConflictedForAnotherAlowareContact (number) {
      if (!number || !this.integrationData || !this.integrationData.duplicates) return false
      // Highlight only if this number is tied to another Aloware contact
      const conflicts = this.integrationData.duplicates
        .filter(d => (d.duplicated_by || []).some(db => db.value === number && !db.is_primary))
      return conflicts.length !== 0
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

.lifecycle-stage-form {
  width: 220px;
}

</style>
