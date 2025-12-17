<template>
  <a
    :href="hubspotLink"
    target="_blank"
    rel="noopener noreferrer"
    title="View in HubSpot"
    class="integration-link-icon"
    @click.stop
  >
    <hubspot-icon background_color="#FFFFFF" foreground_color="#FF7A59" :background_opacity="backgroundOpacity" />
  </a>
</template>

<script>
import HubspotIcon from 'components/icons/hubspot-icon.vue'

export default {
  name: 'contact-integrations-link-icons',

  components: { HubspotIcon },

  props: {
    hubspotLink: {
      type: String,
      required: true
    },

    backgroundOpacity: {
      type: [Number, String],
      default: 1
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
