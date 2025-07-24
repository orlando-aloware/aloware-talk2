<template>
  <div :class="{ 'alw-contact-integrations--inline': inline }" class="alw-contact-integrations">
    <contact-info-integration-link
      v-for="integration in integrations"
      :key="integration.name"
      :href="integration.link"
      :inline="inline"
      :integration-name="integration.name"
      :title="`View in ${integration.label}`"
    >
      <contact-info-integration-icon :inline="inline" :name="integration.name" />
    </contact-info-integration-link>
  </div>
</template>

<script>
import contactInfoIntegrationLink from './contact-info-integration-link.vue'
import contactInfoIntegrationIcon from './contact-info-integration-icon.vue'

export default {
  name: 'contact-info-integrations',
  components: {
    contactInfoIntegrationLink,
    contactInfoIntegrationIcon
  },
  props: {
    integrations: {
      type: Array,
      required: true
    },
    inline: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
.alw-contact-integrations {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
}
</style>
