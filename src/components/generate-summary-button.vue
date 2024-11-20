<template>
    <div v-if="isSummarizationAllowed(communication)">
        <b-button variant="success"
                  size="sm"
                  data-testid="comm-details-generate-summary-button"
                  @click="generateSummary(communication.id)">
            <sparkle-icon width="20" height="20" color="white"/>
            Generate Summary
        </b-button>
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
      talk2Api.V1.transcription.generateSummary(communicationId)
        .catch(error => {
          const errorMessage = error.response?.data?.message || 'Failed to start summary generation.'
          this.$generalNotification(errorMessage, 'error')
        })
    }, 1000)
  }
}
</script>
