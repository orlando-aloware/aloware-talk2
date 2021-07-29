<template>
<div class="contact-crm-integrations-wrapper contact-integration-wrapper">
    <b-link class="md-btn md-raised white integrations-link d-flex"
            target="_blank"
            :href="integration.link"
            :key="integration.name"
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
  data () {
    return {
      integrations: [
        {
          name: 'pipedrive',
          label: 'Pipedrive',
          link: this.pipedriveLink,
          logo: 'pipedrive-icon.svg'
        },
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
          label: 'ZohoCRM',
          link: this.zohoLink,
          logo: 'zoho-icon.svg'
        },
        {
          name: 'helpscout',
          label: 'Helpscout',
          link: this.helpscoutLink,
          logo: 'help-scout-icon.png'
        },
        {
          name: 'guesty',
          label: 'Guesty',
          link: this.guestyLink,
          logo: 'guesty-icon.png'
        }
      ]
    }
  },
  computed: {
    ...mapState(['currentCompany']),
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
        let phoneNumber = this.contact.phone_number
        phoneNumber = phoneNumber.replace('+1', '')
        return `https://www.batscrm.com/search/phone/` + phoneNumber
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
    zohoLink () {
      if (this.currentCompany &&
        this.currentCompany.zoho_integration_enabled &&
        this.contact &&
        this.contact.integration_data &&
        this.contact.integration_data.zoho &&
        this.contact.integration_data.zoho.contact_id &&
        this.currentCompany.zoho_organization_id &&
        this.currentCompany.zoho_module === 'contacts') {
        return `https://crm.zoho.com/crm/org${this.currentCompany.zoho_organization_id}/tab/Contacts/${this.contact.integration_data.zoho.contact_id}`
      }

      if (this.currentCompany &&
        this.currentCompany.zoho_integration_enabled &&
        this.contact &&
        this.contact.integration_data &&
        this.contact.integration_data.zoho &&
        this.contact.integration_data.zoho.lead_id &&
        this.currentCompany.zoho_organization_id &&
        this.currentCompany.zoho_module === 'leads') {
        return `https://crm.zoho.com/crm/org${this.currentCompany.zoho_organization_id}/tab/Leads/${this.contact.integration_data.zoho.lead_id}`
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
        this.contact.integration_data.guesty.conversation_id) {
        return `https://app.guesty.com/inbox-v2/${this.contact.integration_data.guesty.conversation_id}/reservation`
      }

      return false
    }
  }
}
</script>
