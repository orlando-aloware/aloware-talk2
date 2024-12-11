<template>
  <div>
    <span class="cursor-pointer"
          data-testid="comm-barge-comm-button-dialog-click"
          @click="dialog"
          v-if="userCanBargeAndWhisper(communication)">
      <volume-high-icon height="22"
                        data-testid="comm-barge-comm-button-volume-high-icon-2"
                        width="22"/>
      <q-tooltip>
        Barge
      </q-tooltip>
    </span>
  </div>
</template>

<script>
import VolumeHighIcon from 'src/components/icons/volume-high-icon.vue'
import { aclMixin, agentMixin, communicationMixin, simpsocialMixin } from 'src/plugins/mixins'

export default {
  name: 'barge-communication-button',

  mixins: [
    aclMixin,
    agentMixin,
    communicationMixin,
    simpsocialMixin
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
