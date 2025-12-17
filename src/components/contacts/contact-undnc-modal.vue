<template>
  <b-modal
    title="Un-DNC"
    id="contact-undnc-modal"
    hide-header-close
    no-close-on-backdrop
    data-testid="contact-undnc-modal"
    @show="onShow"
    @shown="onShown"
  >
    <p class="my-4">Are you sure you want to Un-DNC {{ contactName }}? <br><br>
    <p>Please enter a reason:</p>
    <b-form-input placeholder="Reason"
                  ref="inputReason"
                  data-testid="contact-undnc-reason-input"
                  v-model="reason"></b-form-input>

    <template #modal-footer="{ hide }">
      <b-button
        variant="success"
        class="custom-btn"
        size="sm"
        :disabled="isProcessingDNC"
        data-testid="contact-undnc-cancel-button"
        @click="hide"
      >
        Cancel
      </b-button>
      <b-button
        variant="primary"
        class="custom-btn"
        size="sm"
        :disabled="isProcessingDNC || reason.trim().length < 1"
        data-testid="contact-undnc-confirm-button"
        @click="unDncContact"
      >
        <q-spinner-bars v-if="isProcessingDNC" color="white"/>
        {{ isProcessingDNC ? 'Please wait...' : 'Confirm' }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>

import talk2Api from 'src/plugins/api/api'

export default {
  name: 'contact-undnc-modal',

  props: {
    contact: {
      type: Object,
      required: true
    }
  },

  computed: {
    contactName () {
      if (this.contact) {
        return this.contact.name || 'No Name'
      }

      return 'No Name'
    }
  },

  data () {
    return {
      isProcessingDNC: false,
      reason: ''
    }
  },
  methods: {
    onShown () {
      this.$refs.inputReason.focus()
    },
    onShow () {
      this.reason = ''
    },
    unDncContact (e) {
      this.isProcessingDNC = true
      talk2Api.V1.contact.unDnc(this.contact.id, this.reason).then(() => {
        this.isProcessingDNC = false
        this.$emit('contactUnDnc')
        this.$bvModal.hide('contact-undnc-modal')
        this.$generalNotification('Contact was successfully un-DNC.', 'success')
      })
    }
  }
}
</script>
