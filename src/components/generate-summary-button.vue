<template>
    <div v-if="isSummarizationAllowed">
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
          The process might take some time.
        </q-tooltip>
    </div>
</template>

<script>
import _ from 'lodash'
import talk2Api from 'src/plugins/api/api'
import SparkleIcon from 'components/icons/ai/sparkle-bold-icon.vue'
import * as SummaryStatus from 'src/constants/summary-status'

export default {
  name: 'generate-summary-button',

  data () {
    return {
      SummaryStatus
    }
  },

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

  computed: {
    isSummarizationAllowed () {
      return this.communication.has_transcription &&
             ![SummaryStatus.STATUS_QUEUED, SummaryStatus.STATUS_PROCESSING].includes(this.communication.call_summary_status)
    }
  },

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
        })
        .finally(() => {
          this.$emit('updateGenerating', false)
        })
    }, 1000)
  },

  watch: {
    'communication.call_summary_status': function (newStatus) {
      if (newStatus === SummaryStatus.STATUS_FAILED) {
        this.$emit('updateGenerating', false)
      }
    }
  }
}
</script>

<style scoped>
.generate-summary-button {
  display: flex;
  justify-content: center;
}
</style>
