<template>
  <div>
    <span v-if="isBlockedFrom('barge & whisper')"
        class="cursor-pointer">
      <b-popover target="whisper-popover"
                 triggers="hover"
                 placement="top"
                 custom-class="btn-primary"
                 data-testid="comm-whisper-button-popover"
                 delay="100">
        <span class="text-white">
          The whisper option is not included in your current plan, to use it, you have
          to upgrade to one of our plans that offers it!
          <u class="cursor-pointer"
             data-testid="comm-whisper-button-read-more"
             @click="openKnowledgeBaseLink">Read more</u>
          or
          <u class="cursor-pointer"
             data-testid="comm-whisper-button-read-request-plan"
             @click="checkClick">Request Plan Upgrade</u>
        </span>
      </b-popover>
      <ear-icon id="whisper-popover"
                height="22"
                data-testid="comm-whisper-button-ear-icon"
                width="22"/>
    </span>
    <span class="cursor-pointer"
          data-testid="comm-whisper-button-whisper-span"
          @click="dialog"
          v-if="!isBlockedFrom('barge & whisper') && userCanBargeAndWhisper(communication)">
      <ear-icon height="22"
                width="22"/>
      <q-tooltip>
        Whisper
      </q-tooltip>
    </span>
  </div>
</template>

<script>
import EarIcon from 'src/components/icons/ear-icon.vue'
import { aclMixin, agentMixin, communicationMixin } from 'src/plugins/mixins'

export default {
  name: 'whisper-communication-button',

  mixins: [
    aclMixin,
    agentMixin,
    communicationMixin
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
    },

    openKnowledgeBaseLink () {
      window.open('https://support.aloware.com/en/articles/9034191-introducing-aloware-wallboard-your-real-time-communication-metrics-dashboard', '_blank')
    },

    checkClick () {
      let defaultLink = (this.isModGen) ? 'https://moderategeni.us/aloware-info' : 'https://aloware.com/get-demo/'

      if (this.defaultClick) {
        window.open(defaultLink, '_blank')
      } else {
        this.$emit('click')
      }
    }
  }
}
</script>
