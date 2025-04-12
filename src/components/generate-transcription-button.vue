<template>
  <div v-if="isTranscriptionAllowed(communication)">
    <!-- Render as button -->
    <b-button
      variant="success"
      size="sm"
      data-testid="comm-details-generate-transcription-button"
      v-if="variant === 'button'"
      :disabled="isGenerating(communication.id)"
      @click="handleGenerateTranscription">
      <span v-if="isGenerating(communication.id)">Generating Transcription...</span>
      <span v-else>Generate Transcription</span>
    </b-button>

    <!-- Render as icon-only -->
    <q-btn
      class="btn btn-inline px-1 py-0"
      color="text-dark-greenish"
      flat
      rounded
      dense
      no-caps
      title="Generate Transcription"
      data-testid="comm-generate-transcription-icon"
      v-else-if="variant === 'icon'"
      :disabled="isGenerating(communication.id)"
      @click="handleGenerateTranscription">
      <sparkle-icon width="16" height="16" color="#007bff"/>
    </q-btn>

    <q-tooltip v-if="isGenerating(communication.id)">
      The process might take some time.
    </q-tooltip>
  </div>
</template>

<script>
import SparkleIcon from 'components/icons/ai/sparkle-bold-icon.vue'
import * as TranscriptionStatus from 'src/constants/transcription-status'
import talk2Api from 'src/plugins/api/api'
import { communicationInfoMixin } from 'src/plugins/mixins'
import { mapActions, mapGetters } from 'vuex'

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
      validator: (value) => ['button', 'icon'].includes(value)
    }
  },

  mixins: [communicationInfoMixin],

  data () {
    return {
      TranscriptionStatus
    }
  },

  components: {
    SparkleIcon
  },

  computed: {
    ...mapGetters('transcriptions', {
      isGenerating: 'isGenerating'
    })
  },

  methods: {
    ...mapActions('transcriptions', ['setGeneratingStatus']),

    /**
     * Handles the transcription generation process.
     */
    handleGenerateTranscription () {
      const communicationId = this.communication.id
      this.$generalNotification('Transcription generation started.', 'success')
      this.setGeneratingStatus({
        communicationId,
        status: true
      })
      return talk2Api.V1.transcription.generateTranscription(communicationId).catch((error) => {
        const errorMessage = error.response?.data?.message || 'Failed to start transcription generation.'
        this.$generalNotification(errorMessage, 'error')
        this.setGeneratingStatus({
          communicationId,
          status: false
        })
      })
    }
  },

  watch: {
    'communication.call_transcription_status': function (newStatus) {
      if (newStatus === TranscriptionStatus.STATUS_ERROR) {
        this.setGeneratingStatus({
          communicationId: this.communication.id,
          status: false
        })
      }
    }
  }
}
</script>
