<template>
  <div class="alw-contact-phone-wrapper">
    <div v-if="phoneNumber && phoneNumber !== '0' && phoneNumber !== null" class="alw-contact-phone-container">
      <span class="alw-contact-phone-number text-md">
        {{ phoneNumber | fixPhone }}
      </span>
      <i
        class="material-icons alw-contact-phone-copy-icon"
        @click="copyPhoneNumber"
      >
        <q-tooltip v-if="!isMobile" anchor="top middle" content-class="fs-12" self="center middle">
          Copy phone number
        </q-tooltip>
        content_copy
      </i>
    </div>
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
@import 'src/css/quasar.variables.scss';

.alw-contact-phone-container {
  display: flex;
  align-items: center;
}

.alw-contact-phone-number {
  line-height: 1.2;
  font-weight: 500;
  font-size: 16px;

  @media (min-width: 768px) {
    font-size: 14px;
  }
}

.alw-contact-phone-copy-icon {
  color: $primary;
  transition: color 0.3s ease;
  font-size: 18px;
  cursor: pointer;
  margin-left: 4px;
  padding-bottom: 1px;

  @media (min-width: 768px) {
    font-size: 16px;
  }

  &:hover {
    color: darken($primary, 10%);
  }
}

.alw-contact-phone-unavailable {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.54);

  @media (min-width: 768px) {
    font-size: 14px;
  }
}

// Override extension classes within the component
.alw-contact-phone-number {
  ::v-deep .phone-helper {
    margin-left: 2px !important;

    &:first-of-type {
      margin-left: 0 !important;
    }

    img {
      width: 18px !important;
      height: 18px !important;

      @media (min-width: 768px) {
        width: 16px !important;
        height: 16px !important;
      }
    }
  }
}
</style>
