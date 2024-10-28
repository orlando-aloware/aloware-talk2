<template>
  <confirm-dialog id="power-dialer-remove-contact-from-lists-confirmation"
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

export default {
  name: 'power-dialer-remove-contact-from-lists-confirmation',

  components: {
    ConfirmDialog
  },

  props: {
    contact: {
      type: Object,
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
        return `Are you sure you want to remove this contact from all Power Dialer lists?`
      }

      return `Are you sure you want to remove <strong>${this.contact.first_name} ${this.contact.last_name}</strong> from all Power Dialer lists?`
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
      talk2Api.V2.contactListItem.removeContactFromAllPowerDialerLists(this.contact.id)
        .then(() => {
          this.$generalNotification('Contact has been removed from all Power Dialer lists successfully.')
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
