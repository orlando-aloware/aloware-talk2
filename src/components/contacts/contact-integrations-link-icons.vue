<template>
  <span v-if="hubspot_link">
    <a
      :href="hubspot_link"
      target="_blank"
      rel="noopener noreferrer"
      title="View in HubSpot"
      class="integration-link-icon"
    >
      <hubspot-icon background_color="#FFFFFF" foreground_color="#FF7A59" :background_opacity="background_opacity" />
    </a>
  </span>
</template>

<script>
import HubspotIcon from 'components/icons/hubspot-icon.vue'

export default {
  name: 'contact-integrations-link-icons',
  components: { HubspotIcon },
  props: {
    contact: {
      type: Object,
      required: true
    },
    background_opacity: {
      type: [Number, String],
      default: 1
    }
  },
  computed: {
    hubspot_link () {
      // If the link for an HS contact object exists, use it, use the company link if it does not
      return (this.contact?.integration_data?.hubspot?.link || this.contact?.integration_data?.hubspot?.company_link) || null
    }
  }
}
</script>

<style scoped>
.integration-link-icon {
  margin-left: 4px;
  vertical-align: middle;
}
</style>
