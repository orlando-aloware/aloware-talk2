<template>
  <div>
    <span v-if="isBlockedFrom('barge & whisper')"
        class="cursor-pointer"
        data-testid="comm-barge-comm-button-section">
      <b-popover target="barge-popover"
                 triggers="hover"
                 placement="top"
                 custom-class="btn-primary"
                 data-testid="comm-barge-comm-button-popover"
                 delay="100">
        <span class="text-white">
          The barge option is not included in your current plan, to use it, you have
          to upgrade to one of our plans that offers it!
          <u class="cursor-pointer"
             data-testid="comm-barge-comm-button-read-more"
             @click="openKnowledgeBaseLink">Read more</u>
          or
          <u class="cursor-pointer"
             data-testid="comm-barge-comm-button-request-plan-upgrade"
             @click="checkClick">Request Plan Upgrade</u>
        </span>
      </b-popover>
      <volume-high-icon id="barge-popover"
                        data-testid="comm-barge-comm-button-volume-high-icon-1"
                        height="22"
                        width="22"/>
    </span>
    <span class="cursor-pointer"
          data-testid="comm-barge-comm-button-dialog-click"
          @click="dialog"
          v-if="!isBlockedFrom('barge & whisper') && userCanBargeAndWhisper(communication)">
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
