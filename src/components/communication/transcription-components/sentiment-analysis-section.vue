<template>
  <div v-if="!isEmpty(sentiment_analysis)"
       data-testid="comm-sentiment-analysis-wrapper">
    <!--
        Sentiment analysis object contains:
            1. speaker.
            2. overall: speaker's overall sentiment.
    -->
    <div class="d-flex flex-row align-items-center"
         :key="sentiment_index"
         v-for="(sentimentSummary, sentiment_index) in sentiment_analysis">
      <q-chip text-color="black"
              dense
              data-testid="comm-sentiment-analysis-section-chip"
              :color="sentimentChipColors[sentimentSummary.overall]">
        <strong>{{ sentimentSummary.overall }}</strong>
        <q-tooltip data-testid="comm-sentiment-analysis-section-tooltip">
          {{ calculateOverAllSentimentBySpeaker(sentimentSummary) }}
        </q-tooltip>
      </q-chip>
      sentiment
    </div>
  </div>
</template>

<script>
export default {
  name: 'SentimentAnalysisSection',

  props: {
    sentiment_analysis: {
      type: Array,
      required: true
    },
    sentimentChipColors: {
      type: Object,
      required: true
    },
    isEmpty: {
      type: Function,
      required: true
    },
    calculateOverAllSentimentBySpeaker: {
      type: Function,
      required: true
    }
  }
}
</script>
