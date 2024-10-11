<template>
  <div>
    <q-card-section v-if='integrationData && integrationData.properties'
                    data-testid='integration-hubspot-card-section-1'>
      <a class="external-contact-hubspot-link-icon color-primary"
         target='_blank'
         :href="getHubspotContactBaseLink() + 'contact/' + integrationData.id">
        <i class="fa fa-external-link" aria-hidden="true"/>
      </a>
      <p class='mb-0 text-bold' v-if='isPrimary'>
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
                      :href="getHubspotContactBaseLink() + 'deal/' + deal.id"
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
    }
  },
  computed: {
    isNameAvailable () {
      return this.integrationData.properties.firstname !== undefined || this.integrationData.properties.lastname !== undefined
    },

    fullName () {
      const firstname = this.integrationData.properties.firstname ? this.integrationData.properties.firstname : ''
      const lastname = this.integrationData.properties.lastname ? this.integrationData.properties.lastname : ''
      return `${firstname} ${lastname}`.trim()
    }
  }
}

</script>
