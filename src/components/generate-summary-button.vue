<template>
    <div v-if="isSummarizationAllowed(communication)">
        <b-button id="generate-summary-button"
                  variant="success"
                  class="generate-summary-button"
                  size="sm"
                  data-testid="comm-details-generate-summary-button"
                  :disabled="isGenerating"
                  @click="generateSummary(communication.id)">
            <sparkle-icon width="20" height="20" color="white"/>
            <span v-if="isGenerating">Generating Summary...</span>
            <span v-else>Generate Summary</span>
        </b-button>
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
  name: 'generate-summary-button',

  props: {
    communication: {
      type: Object,
      required: true
    },
    isGenerating: {
      type: Boolean,
      required: true
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
     * @description Generate summary for the given communication.
     */
    generateSummary: _.debounce(function (communicationId) {
      this.$generalNotification('Summary generation started.', 'success')
      this.$emit('updateGenerating', true)
      talk2Api.V1.transcription.generateSummary(communicationId)
        .catch(error => {
          const errorMessage = error.response?.data?.message || 'Failed to start summary generation.'
          this.$generalNotification(errorMessage, 'error')
          this.$emit('updateGenerating', false) // Reset on error
        })
    }, 1000)
  }
}
</script>

<style scoped>
.generate-summary-button {
  display: flex;
  justify-content: center;
}
</style>
