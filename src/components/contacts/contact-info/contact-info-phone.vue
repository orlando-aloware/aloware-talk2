<template>
  <q-btn
    v-if="phoneNumber && phoneNumber !== '0' && phoneNumber !== null"
    class="alw-contact-phone-btn"
    dense
    flat
    no-caps
    @click="copyPhoneNumber"
  >
    <q-tooltip v-if="!isMobile" anchor="top middle" content-class="fs-12" self="center middle">
      Copy phone number
    </q-tooltip>
    <div class="alw-contact-phone-content">
      <span class="alw-contact-phone-number">{{ phoneNumber | fixPhone }}</span>
      <i class="material-icons alw-contact-phone-copy-icon">content_copy</i>
    </div>
  </q-btn>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'contact-info-phone',
  props: {
    contact: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapState(['isMobile']),
    phoneNumber () {
      return this.contact?.phone_number
    }
  },
  methods: {
    copyPhoneNumber () {
      if (this.phoneNumber) {
        this.$copyToClipboard(this.phoneNumber)
        this.$generalNotification('Phone number copied to clipboard.')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// More specific selector to override Quasar's default padding
.q-btn.alw-contact-phone-btn {
  padding: 0 8px; // Only horizontal padding
  color: inherit;
  border-radius: 20px; // Pill shape like integration buttons

  &:hover {
    .alw-contact-phone-number {
      text-decoration: underline;
    }

    .alw-contact-phone-copy-icon {
      color: rgba(0, 0, 0, 0.7); // Darker on hover
    }
  }
}

.alw-contact-phone-content {
  display: flex;
  align-items: center; // Perfect vertical alignment
  font-size: 16px; // Base font size for mobile

  @media (min-width: 768px) {
    font-size: 14px; // Base font size for desktop
  }
}

.alw-contact-phone-number {
  line-height: 1.2;
  font-weight: 500;
}

.alw-contact-phone-copy-icon {
  color: rgba(0, 0, 0, 0.54);
  transition: color 0.3s ease;
  margin-left: 8px; // Space between number and icon
  font-size: inherit; // Inherit from parent
}
</style>
