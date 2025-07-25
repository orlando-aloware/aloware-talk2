<template>
  <img
    :alt="name"
    :class="['integration-icon', `integration-icon--${name}`]"
    :src="iconPath"
  >
</template>

<script>
export default {
  name: 'contact-info-integration-icon',
  props: {
    name: {
      type: String,
      required: true,
      validator: value => [
        'gohighlevel', 'guesty', 'hubspot', 'pipedrive', 'salesforce', 'zoho'
      ].includes(value)
    },
    inline: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    iconPath () {
      return `app-icons/integrations/${this.name}.svg`
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/breakpoints';

.integration-icon {
  height: 24px;
  width: auto;
  object-fit: contain;
  display: block;
}
</style>
