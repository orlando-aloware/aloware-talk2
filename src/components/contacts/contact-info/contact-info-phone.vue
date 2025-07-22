<template>
  <div class="alw-contact-phone-wrapper">
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
    <span v-else class="alw-contact-phone-unavailable">
      Phone number unavailable
    </span>
  </div>
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
.q-btn.alw-contact-phone-btn {
  padding: 0 8px;
  color: inherit;
  border-radius: 20px;

  &:hover {
    .alw-contact-phone-number {
      text-decoration: underline;
    }

    .alw-contact-phone-copy-icon {
      color: rgba(0, 0, 0, 0.7);
    }
  }
}

.alw-contact-phone-content {
  display: flex;
  align-items: center;
  font-size: 16px;

  @media (min-width: 768px) {
    font-size: 14px;
  }
}

.alw-contact-phone-number {
  line-height: 1.2;
  font-weight: 500;
}

.alw-contact-phone-copy-icon {
  color: rgba(0, 0, 0, 0.54);
  transition: color 0.3s ease;
  margin-left: 8px;
  font-size: inherit;
}

.alw-contact-phone-unavailable {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.54);

  @media (min-width: 768px) {
    font-size: 14px;
  }
}
</style>
