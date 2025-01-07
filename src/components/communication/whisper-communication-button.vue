<template>
  <div>
    <span class="cursor-pointer"
          data-testid="comm-whisper-button-whisper-span"
          @click="dialog">
      <ear-icon :height="iconHeight"
                :width="iconWidth"/>
      <q-tooltip>
        Whisper
      </q-tooltip>
    </span>
  </div>
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
