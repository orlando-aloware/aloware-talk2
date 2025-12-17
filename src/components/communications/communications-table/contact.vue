<template>
  <div class="d-flex flex-column"
       data-testid="duration-row">
    <div class="ellipse"
         v-if="row.contact">
      <div class="d-flex align-items-center">
        <router-link class="text-primary text-truncate"
                   :id="`comm-contact-${_uid}`"
                   @click.native="handleContactClick"
                   target="_blank"
                   :to="{ path: `/contacts/${row.contact.id}`}">
          <external-link-icon color="#1976D2"/>
          {{ row.contact.name | fixContactName }}

          <b-tooltip custom-class="talk-table__tooltip"
                     :target="`comm-contact-${_uid}`">
            Click to go to contact's page
          </b-tooltip>
        </router-link>
        <contact-integrations-link-icons
          v-if="contactHubspotLink"
          :hubspot-link="contactHubspotLink"
          class="ml-1 flex-shrink-0"
          background-opacity="0"
        />
      </div>
    </div>
    <div class="deleted"
         v-else>
      Deleted Contact
    </div>

    <div>
      {{ row.lead_number | fixPhone('NATIONAL', true) }}
    </div>
  </div>
</template>

<script>
import ExternalLinkIcon from 'components/icons/external-link-icon.vue'
import communicationsMixin from 'src/plugins/mixins/communications.mixin'
import ContactIntegrationsLinkIcons from 'components/contacts/contact-integrations-link-icons.vue'

export default {
  name: 'Contact',

  components: {
    ContactIntegrationsLinkIcons,
    ExternalLinkIcon
  },

  mixins: [
    communicationsMixin
  ],

  props: {
    row: {
      type: Object,
      required: false
    }
  },

  computed: {
    contactHubspotLink () {
      return this.row?.contact?.integration_data?.hubspot?.link || null
    }
  },

  methods: {
    handleContactClick (e) {
      const url = `/contacts/${this.row.contact.id}`
      // Only handle navigation in Electron, let browser handle it normally
      this.handleElectronNavigation(e, url)
    }
  }
}
</script>
