<template>
  <confirm-dialog id="contact-remove-from-lists-confirmation"
                  title="Remove from Power Dialer Lists"
                  @close="onClose">
    <div slot="content">
      <p v-html="messageText"/>
    </div>
    <div slot="footer">
      <div class="d-flex w-100">
        <div class="flex-grow-1"/>
        <button class="btn btn-sm btn-outline-dark mr-2"
                @click="onClose">
          Cancel
        </button>
        <button class="btn btn-sm btn-danger"
                :disabled="isLoading"
                @click="onConfirm">
          <span v-if="isLoading">
            <i class="fas fa-circle-notch fa-spin"></i>
          </span>
          Yes, I'm sure
        </button>
      </div>
    </div>
  </confirm-dialog>
</template>

<script>
import ConfirmDialog from 'components/confirm-dialog.vue'
import talk2Api from 'src/plugins/api/api'
import { POWER_DIALER_LIST } from 'src/constants/contact-list-types'

export default {
  name: 'contact-remove-from-lists-confirmation',

  components: {
    ConfirmDialog
  },

  props: {
    contact: {
      type: Object,
      required: true
    },

    type: {
      type: Number,
      default: POWER_DIALER_LIST,
      required: true
    }
  },

  data () {
    return {
      isLoading: false
    }
  },

  computed: {
    messageText () {
      if (!this.contact.first_name && !this.contact.last_name) {
        if (this.type === POWER_DIALER_LIST) {
          return `Are you sure you want to remove this contact from all Power Dialer lists?`
        }

        return `Are you sure you want to remove this contact from all lists?`
      }

      if (this.type === POWER_DIALER_LIST) {
        return `Are you sure you want to remove <strong>${this.contact.first_name} ${this.contact.last_name}</strong> from all Power Dialer lists?`
      }

      return `Are you sure you want to remove <strong>${this.contact.first_name} ${this.contact.last_name}</strong> from all lists?`
    },

    confirmationMessage () {
      if (this.type === POWER_DIALER_LIST) {
        return 'Contact has been removed from all Power Dialer lists successfully.'
      }

      return 'Contact has been removed from all lists successfully.'
    }
  },

  methods: {
    onClose () {
      this.$emit('close')
    },

    onConfirm () {
      if (!this.contact.id) {
        return
      }

      this.isLoading = true
      talk2Api.V2.contacts.removeContactFromList(this.contact.id, { type: this.type })
        .then(() => {
          this.$generalNotification(this.confirmationMessage)
          this.$emit('confirm')
        })
        .catch((error) => {
          this.$emit('error', error)
        })
        .finally(() => {
          this.isLoading = false
        })
    }
  }
}
</script>
