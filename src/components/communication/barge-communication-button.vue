<template>
  <span class="cursor-pointer"
        v-if="userCanBargeAndWhisper(communication)"
        @click="dialog">
    <volume-high-icon height="22"
                      width="22"/>
    <q-tooltip>
      Barge
    </q-tooltip>
  </span>
</template>

<script>
import VolumeHighIcon from 'src/components/icons/volume-high-icon.vue'
import { aclMixin, agentMixin, communicationMixin } from 'src/plugins/mixins'

export default {
  name: 'barge-communication-button',

  mixins: [
    aclMixin,
    agentMixin,
    communicationMixin
  ],

  components: {
    VolumeHighIcon
  },

  props: {
    communication: {
      type: Object,
      required: true
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
        phone_number: `barge:${this.communication.id}`
      })
    }
  }
}
</script>
