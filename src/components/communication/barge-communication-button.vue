<template>
  <span class="cursor-pointer"
        data-testid="comm-barge-comm-button-dialog-click"
        :id="`action-barge-${_uid}`"
        v-if="userCanBargeAndWhisper(communication)"
        @click="dialog">
    <volume-high-icon data-testid="comm-barge-comm-button-volume-high-icon-2"
                      :height="iconHeight"
                      :width="iconWidth"/>
    <span class="ml-1"
          v-if="showButtonText">
      Barge
    </span>
    <b-tooltip custom-class="talk-table__tooltip"
               :target="`action-barge-${_uid}`"
               v-else>
      {{ isAiAgentUser(communication.user) ? 'Take over' : 'Barge' }}
    </b-tooltip>
  </span>
</template>

<script>
import VolumeHighIcon from 'src/components/icons/volume-high-icon.vue'
import { aclMixin, agentMixin, communicationMixin, userMixin } from 'src/plugins/mixins'

export default {
  name: 'barge-communication-button',

  mixins: [
    aclMixin,
    agentMixin,
    communicationMixin,
    userMixin
  ],

  components: {
    VolumeHighIcon
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
        ? 'Do you want to take over this AI agent call? You\'ll be muted by default. If you unmute yourself, AI agent will be dropped from the call completely.'
        : 'Do you want to barge into this call? You\'ll be muted by default. If you unmute yourself, both parties will hear you.'

      this.$bvModal.msgBoxConfirm(message, {
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
      // Set flag to indicate this is a barge call
      this.$store.dispatch('setDialerIsBargeOrWhisperCall', true)

      this.$VueEvent.fire('make_new_call', {
        phone_number: `barge:${this.communication.id}`
      })
    },

    openKnowledgeBaseLink () {
      window.open('https://support.aloware.com/en/articles/9034191-introducing-aloware-wallboard-your-real-time-communication-metrics-dashboard', '_blank')
    },

    checkClick () {
      if (this.defaultClick) {
        const defaultLink = (this.isModGen)
          ? 'https://moderategeni.us/aloware-info'
          : 'https://aloware.com/get-demo/'

        window.open(defaultLink, '_blank')
        return
      }

      this.$emit('click')
    }
  }
}
</script>
