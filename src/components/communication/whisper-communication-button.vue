<template>
  <span class="cursor-pointer"
        data-testid="comm-whisper-button-whisper-span"
        :id="`action-whisper-${_uid}`"
        v-if="userCanBargeAndWhisper(communication)"
        @click="dialog">
    <ear-icon :height="iconHeight"
              :width="iconWidth"/>
    <span class="ml-1"
          v-if="showButtonText">
      Whisper
    </span>
    <b-tooltip custom-class="talk-table__tooltip"
               :target="`action-whisper-${_uid}`"
               v-else>
      {{ isAiAgentUser(communication.user) ? 'Listen' : 'Whisper' }}
    </b-tooltip>
  </span>
</template>

<script>
import EarIcon from 'src/components/icons/ear-icon.vue'
import { aclMixin, agentMixin, communicationMixin, userMixin } from 'src/plugins/mixins'

export default {
  name: 'whisper-communication-button',

  mixins: [
    aclMixin,
    agentMixin,
    communicationMixin,
    userMixin
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

    showButtonText: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    dialog () {
      const message = this.isAiAgentUser(this.communication.user)
        ? `Do you want to listen to the AI agent call? Note that you cannot unmute yourself while listening to the AloAi agent.`
        : `Do you want to whisper to the agent of this call? Note that you will be muted by default.`

      this.$bvModal.msgBoxConfirm(message, {
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
      // Set flag to indicate this is a whisper call
      this.$store.dispatch('setDialerIsBargeOrWhisperCall', true)

      this.$VueEvent.fire('make_new_call', {
        phone_number: `whisper:${this.communication.id}`
      })
    }
  }
}
</script>
