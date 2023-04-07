<template>
  <button :class="['btn', 'btn-sm', customClass]"
          v-if="userCanBargeAndWhisper(communication)"
          @click="dialog(communication)">
    <i class="material-icons">volume_up</i>
    <q-tooltip>
      Barge
    </q-tooltip>
  </button>
</template>

<script>
import { aclMixin, agentMixin, communicationMixin } from 'src/plugins/mixins'

export default {
  name: 'barge-communication-button',

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
      this.$bvModal.msgBoxConfirm('Do you want to barge into this call? You\'ll be muted by default. If you unmute yourself, both parties will hear you.', {
        buttonSize: 'sm',
        okTitle: 'Yes',
        cancelTitle: 'Cancel',
        centered: true
      }).then(confirm => {
        if (confirm) {
          this.barge()
        }
      })
    },

    barge () {
      this.$VueEvent.fire('make_new_call', {
        phone_number: 'barge:' + this.communication.lead_number
      })
    }
  }
}
</script>
