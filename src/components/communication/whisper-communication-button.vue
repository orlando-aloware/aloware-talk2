<template>
  <span class="cursor-pointer"
        data-testid="comm-whisper-button-whisper-span"
        :id="`action-whisper-${_uid}`"
        @click="dialog"
        v-if="userCanBargeAndWhisper(communication)">
    <ear-icon :height="iconHeight"
              :width="iconWidth"/>

    <b-tooltip custom-class="talk-table__tooltip"
               :target="`action-whisper-${_uid}`"
               v-if="blackTooltip">
      Whisper
    </b-tooltip>
    <q-tooltip v-else>
      Whisper
    </q-tooltip>
  </span>
</template>

<script>
import EarIcon from 'src/components/icons/ear-icon.vue'
import { aclMixin, agentMixin, communicationMixin, simpsocialMixin } from 'src/plugins/mixins'

export default {
  name: 'whisper-communication-button',

  mixins: [
    aclMixin,
    agentMixin,
    communicationMixin,
    simpsocialMixin
  ],

  components: {
    EarIcon
  },

  props: {
    communication: {
      type: Object,
      required: true
    },

    defaultClick: {
      type: Boolean,
      default: true,
      required: false
    },

    iconHeight: {
      type: [Number, String],
      default: 22
    },

    iconWidth: {
      type: [Number, String],
      default: 22
    },

    blackTooltip: {
      type: Boolean,
      default: false
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
        phone_number: `whisper:${this.communication.id}`
      })
    }
  }
}
</script>
