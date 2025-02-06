<template>
  <div class="d-flex flex-column"
       data-testid="duration-row">
    <div class="ellipse"
         v-if="row.contact">
      <router-link class="text-primary"
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
    </div>

    <div>
      {{ row.lead_number | fixPhone('NATIONAL', true) }}
    </div>
  </div>
</template>

<script>
import ExternalLinkIcon from 'components/icons/external-link-icon.vue'
import communicationsMixin from 'src/plugins/mixins/communications.mixin'

export default {
  name: 'Contact',

  components: {
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

  methods: {
    handleContactClick (e) {
      const url = `/contacts/${this.row.contact.id}`
      // Only handle navigation in Electron, let browser handle it normally
      this.handleElectronNavigation(e, url)
    }
  }
}
</script>
