<template>
  <div v-if="isTranscriptionAllowed(communication)">
      <!-- Render as button -->
      <b-button variant="success"
                size="sm"
                data-testid="comm-details-generate-transcription-button"
                v-if="variant === 'button'"
                :disabled="isGenerating"
                @click="generateTranscription(communication.id)">
          <sparkle-icon width="20" height="20" color="white"/>
          <span v-if="isGenerating">Generating Transcription...</span>
          <span v-else>Generate Transcription</span>
      </b-button>
      <!-- Render as icon-only -->
      <q-btn class="btn btn-inline px-1 py-0"
             color="text-dark-greenish"
             flat
             rounded
             dense
             no-caps
             title="Generate Transcription"
             data-testid="comm-generate-transcription-icon"
             v-else-if="variant === 'icon'"
             :disabled="isGenerating"
             @click="generateTranscription(communication.id)">
          <sparkle-icon width="16" height="16" color="#007bff" />
      </q-btn>
      <q-tooltip v-if="isGenerating">
          The process might take some time. Consider refreshing the page later to see the updates.
      </q-tooltip>
  </div>
</template>

<script>
import _ from 'lodash'
import talk2Api from 'src/plugins/api/api'
import { transcriptionMixin } from 'src/plugins/mixins'
import SparkleIcon from 'components/icons/ai/sparkle-bold-icon.vue'

export default {
  name: 'generate-transcription-button',

  props: {
    communication: {
      type: Object,
      required: true
    },

    variant: {
      type: String,
      default: 'button',
      validator: value => ['button', 'icon'].includes(value)
    }
  },

  components: {
    SparkleIcon
  },

  mixins: [
    transcriptionMixin
  ],

  data () {
    return {
      isGenerating: false
    }
  },

  methods: {
    /**
     * @param {int} communicationId
     * @returns {void}
     * @description Generate transcription for the given communication.
     */
    generateTranscription: _.debounce(function (communicationId) {
      this.$generalNotification('Transcription generation started.', 'success')
      this.isGenerating = true
      talk2Api.V1.transcription.generateTranscription(communicationId)
        .catch(error => {
          const errorMessage = error.response?.data?.message || 'Failed to start transcription generation.'
          this.$generalNotification(errorMessage, 'error')
          this.isGenerating = false
        })
    }, 1000)
  }
}
</script>
