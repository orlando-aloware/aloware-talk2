<template>
  <div class="flex items-center">
    <strong class="mr-2">Overall Sentiment:</strong>
    <div v-if="!isEmpty(sentiment_analysis)">
      <!--
          Sentiment analysis object contains:
              1. speaker.
              2. overall: speaker's overall sentiment.
      -->
      <div class="flex inline items-center mr-3"
          :key="sentiment_index"
          v-for="(sentimentSummary, sentiment_index) in sentiment_analysis">
        <div class="mr-2">{{ sentimentSummary.speaker }}:</div>
        <q-chip text-color="black"
                dense
                :color="sentimentChipColors[sentimentSummary.overall]">
          <strong>{{ sentimentSummary.overall }}</strong>
          <q-tooltip>
            {{ calculateOverAllSentimentBySpeaker(sentimentSummary) }}
          </q-tooltip>
        </q-chip>

      </div>
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
