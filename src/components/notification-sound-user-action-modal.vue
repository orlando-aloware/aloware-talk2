<template>
  <b-modal
    :id="modalId"
    centered
    size="md"
    @hidden="onHidden"
  >
    <template #modal-header>
      <div class="d-flex align-items-center">
        <call-incoming-icon class="mr-2" />
        <h5>Allow Ringing Sound</h5>
      </div>
    </template>
    <div class="d-flex align-center">
      The ringing sound will only play after you interact with the page, due to browser audio restrictions.
    </div>
    <template #modal-footer>
      <b-button
        variant="primary"
        class="custom-btn"
        size="sm"
        @click="onHidden"
      >
        Allow ringing sound
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'NotificationSoundUserActionModal',

  data () {
    return {
      modalId: 'notification-sound-user-action-modal'
    }
  },

  methods: {
    ...mapActions(['setEnableAudio']),

    onHidden () {
      // Enable the audio after the user interacts with the page
      this.setEnableAudio(true)
      this.$bvModal.hide(this.modalId)
    }
  }
}
</script>
