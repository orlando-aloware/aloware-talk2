<template>
  <div class="alw-contact-info-header">
    <div class="alw-contact-info-header-main">
      <contact-info-avatar :contact="contact" />
      <contact-info-name :contact="contact" />
      <div class="alw-contact-info-actions-group">
        <!-- Single integration goes inline with actions -->
        <contact-info-integrations
          v-if="activeIntegrations.length === 1"
          :integrations="activeIntegrations"
          inline
        />
        <contact-info-edit-contact
          :is-read-only="isReadOnly"
        />
        <contact-info-open-contact v-if="teamInbox" :contact="contact" />
      </div>
    </div>
  </div>
</template>

<script>
import ContactInfoAvatar from './header/contact-info-avatar.vue'
import ContactInfoName from './header/contact-info-name.vue'
import ContactInfoEditContact from './header/contact-info-edit-contact.vue'
import ContactInfoOpenContact from './header/contact-info-open-contact.vue'
import ContactInfoIntegrations from './contact-info-integrations.vue'

export default {
  name: 'contact-info-header',
  components: {
    ContactInfoAvatar,
    ContactInfoName,
    ContactInfoEditContact,
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
  gap: 8px;
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
