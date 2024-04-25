<template>
  <div class="contact-crm-integrations-wrapper contact-integration-wrapper" data-testid="contact-crm-links-wrapper">
    <b-link class="md-btn md-raised white integrations-link d-flex"
            target="_blank"
            :href="integration.link"
            :key="integration.name"
            data-testid="contact-crm-link"
            v-for="integration in activeCrmIntegrations">
      <div class="integrations-logo mr-3" :style="`background: url('integrations/${integration.logo}') no-repeat center center`"></div>
      <span class="integration-title">{{ integration.label }}</span>
    </b-link>
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
          name: 'zoho',
          label: 'ZohoCRM Contact',
          link: this.zohoContactLink,
          logo: 'zoho-icon.svg'
        },
        {
          name: 'zoho',
          label: 'ZohoCRM Lead',
          link: this.zohoLeadLink,
          logo: 'zoho-icon.svg'
        },
        {
          name: 'helpscout',
          label: 'Help Scout',
          link: this.helpscoutLink,
          logo: 'help-scout-icon.png'
        },
        {
          name: 'guesty',
          label: 'Guesty',
          link: this.guestyLink,
          logo: 'guesty-icon.png'
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
    pipedriveLink () {
      if (this.currentCompany &&
        this.currentCompany.pipedrive_integration_enabled &&
        this.contact &&
        this.contact.integration_data &&
        this.contact.integration_data.pipedrive &&
        this.contact.integration_data.pipedrive.person_id &&
        this.currentCompany.pipedrive_company_domain) {
        return `https://${this.currentCompany.pipedrive_company_domain}.pipedrive.com/person/${this.contact.integration_data.pipedrive.person_id}`
      }

      return false
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
    },
    zohoContactLink () {
      if (this.currentCompany &&
        this.currentCompany.zoho_integration_enabled &&
        this.contact &&
        this.contact.integration_data &&
        this.contact.integration_data.zoho &&
        this.contact.integration_data.zoho.contact_link) {
        return this.contact.integration_data.zoho.contact_link
      }

      return false
    },
    zohoLeadLink () {
      if (this.currentCompany &&
        this.currentCompany.zoho_integration_enabled &&
        this.contact &&
        this.contact.integration_data &&
        this.contact.integration_data.zoho &&
        this.contact.integration_data.zoho.lead_link) {
        return this.contact.integration_data.zoho.lead_link
      }

      return false
    },
    helpscoutLink () {
      if (this.currentCompany &&
        this.currentCompany.helpscout_integration_enabled &&
        this.contact &&
        this.contact.integration_data &&
        this.contact.integration_data.helpscout &&
        this.contact.integration_data.helpscout.customer_id &&
        this.currentCompany.helpscout_mailbox_id) {
        return `https://secure.helpscout.net/customer/${this.contact.integration_data.helpscout.customer_id}/${this.currentCompany.helpscout_mailbox_id}`
      }

      return false
    },
    guestyLink () {
      if (this.currentCompany &&
        this.currentCompany.guesty_integration_enabled &&
        this.contact &&
        this.contact.integration_data &&
        this.contact.integration_data.guesty &&
        this.contact.integration_data.guesty.guest_id) {
        return `https://app.guesty.com/people/contact/${this.contact.integration_data.guesty.guest_id}/profile`
      }

      return false
    }
  }
}
</script>
