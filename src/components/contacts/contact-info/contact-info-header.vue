<template>
  <div class="alw-contact-info-header">
    <div class="alw-contact-info-header-main">
      <contact-info-avatar :contact="contact" />
      <contact-info-name-editable :contact="contact" :is-read-only="isReadOnly" />
      <div class="alw-contact-info-actions-group">
        <contact-info-integrations
          v-if="activeIntegrations.length > 0"
          :integrations="activeIntegrations"
          inline
        />
        <contact-info-open-contact v-if="teamInbox" :contact="contact" />
      </div>
    </div>
  </div>
</template>

<script>
import ContactInfoAvatar from './header/contact-info-avatar.vue'
import ContactInfoNameEditable from './header/contact-info-name-editable.vue'
import ContactInfoOpenContact from './header/contact-info-open-contact.vue'
import ContactInfoIntegrations from './header/integrations/contact-info-integrations.vue'

export default {
  name: 'contact-info-header',
  components: {
    ContactInfoAvatar,
    ContactInfoNameEditable,
    ContactInfoOpenContact,
    ContactInfoIntegrations
  },
  props: {
    contact: {
      type: Object,
      required: true
    },
    activeIntegrations: {
      type: Array,
      required: true
    },
    isReadOnly: {
      type: Boolean,
      default: false
    },
    teamInbox: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
.alw-contact-info-header {
  display: flex;
  flex-direction: column;
}

.alw-contact-info-header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  flex-wrap: nowrap;
  min-width: 0;

  > * {
    flex-shrink: 0;
  }

  ::v-deep .alw-contact-name-wrapper {
    flex: 1 1 auto;
  }
}

.alw-contact-info-actions-group {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
</style>
