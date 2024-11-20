<template>
    <div v-if="isTranscriptionAllowed(communication)">
        <!-- Render as button -->
        <b-button variant="success"
                  size="sm"
                  data-testid="comm-details-generate-transcription-button"
                  v-if="variant === 'button'"
                  @click="generateTranscription(communication.id)">
            <sparkle-icon width="20" height="20" color="white"/>
            Generate Transcription
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
               @click="generateTranscription(communication.id)">
            <sparkle-icon width="16" height="16" color="#007bff" />
        </q-btn>
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

  methods: {
    /**
     * @param {int} communicationId
     * @returns {void}
     * @description Generate transcription for the given communication.
     */
    generateTranscription: _.debounce(function (communicationId) {
      this.$generalNotification('Transcription generation started.', 'success')
      talk2Api.V1.transcription.generateTranscription(communicationId)
        .catch(error => {
          const errorMessage = error.response?.data?.message || 'Failed to start transcription generation.'
          console.error('Failed to generate transcription:', error)
          this.$generalNotification(errorMessage, 'error')
        })
    }, 1000)
  }
}
</script>
