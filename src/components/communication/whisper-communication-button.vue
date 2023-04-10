<template>
  <button :class="['btn', 'btn-sm', customClass]"
          v-if="userCanBargeAndWhisper(communication)"
          @click="dialog(communication)">
    <i class="material-icons">
      hearing
    </i>
    <q-tooltip>
      Whisper
    </q-tooltip>
  </button>
</template>

<script>
import { aclMixin, agentMixin, communicationMixin } from 'src/plugins/mixins'

export default {
  name: 'whisper-communication-button',

  mixins: [
    aclMixin,
    agentMixin,
    communicationMixin
  ],

  props: {
    communication: {
      type: Object,
      required: true
    },

    customClass: {
      required: false,
      default: null
    }
  },

  methods: {
    dialog () {
      this.$bvModal.msgBoxConfirm('Do you want to whisper to the agent of this call? Note that you will be muted by default.', {
        buttonSize: 'sm',
        okTitle: 'Yes',
        cancelTitle: 'Cancel',
        centered: true
      }).then(confirm => {
        if (confirm) {
          this.whisper()
        }
      })
    },

    whisper () {
      this.$VueEvent.fire('make_new_call', {
        phone_number: 'whisper:' + this.communication.lead_number
      })
    }
  }
}
</script>
