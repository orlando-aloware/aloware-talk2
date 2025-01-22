<template>
  <div data-testid='contact-crm-links-wrapper'>
    <div class='integration-wrapper integration-wrapper-generic'
         :key='integration.name'
         v-for='integration in activeCrmIntegrations'>
      <q-card class='integration-card'
              data-testid='integration-salesforce-card'
              flat>
        <q-item class='p-0'>
                <span class='integration-jit-card-header'>
                  <span class='integrations-logo integration-icon-in-header'
                        :class='integration.name + "-icon"'
                        :style="`background: url('integrations/${integration.logo}') no-repeat center center`"></span>
                  <span class='integration-title'>{{ integration.label }}</span>
                </span>
          <a class='external-contact-integration-link-icon color-primary'
             target='_blank'
             :href='integration.link'>
            <i class='fa fa-external-link' aria-hidden='true' />
          </a>
        </q-item>
      </q-card>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'contact-crm-links',
  props: {
    contact: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapState('cache', ['currentCompany']),
    integrations () {
      return [
        {
          name: 'stripe',
          label: 'Stripe',
          link: this.stripeLink,
          logo: 'stripe-icon.svg'
        },
        {
          name: 'bats',
          label: 'BATS',
          link: this.batsLink,
          logo: 'bats-icon.png'
        },
        {
          name: 'custom_link_builder',
          label: 'Custom Link',
          link: this.contact?.custom_link,
          logo: 'link-solid.svg'
        }
      ]
    },
    activeCrmIntegrations () {
      return this.integrations.filter(integration => integration.link)
    },
    batsLink () {
      // @custom for Direct Auto
      if (this.currentCompany &&
        this.currentCompany.id === 460 &&
        this.contact &&
        this.contact.phone_number) {
        // eslint-disable-next-line camelcase
        const phoneNumber = this.contact.phone_number.replace('+1', '')
        return `https://www.batscrm.com/search/phone/${phoneNumber}`
      }

      return false
    },
    stripeLink () {
      if (this.currentCompany &&
        this.currentCompany.stripe_integration_enabled &&
        this.contact &&
        this.contact.first_name) {
        return `https://dashboard.stripe.com/test/search?query=${this.contact.first_name}`
      }

      return false
    }
  }
}
</script>
