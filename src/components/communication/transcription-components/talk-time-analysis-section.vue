<template>
  <div v-if="!isEmpty(talk_time_analysis)"
       data-testid="comm-talk-time-analysis-wrapper">
    <!--
          Talk time analysis contains:
              [key]: speaker as a string value.
              [value]: talk time ratio float.
      -->
    <div class="d-flex flex-row align-items-center justify-content-between lh-30 width-200"
         :key="speaker_index"
         v-for="(speaker, speaker_index) in speakers">
      <div>
        <i class="fa-solid fa-circle mr-2" :style="getSpeakerClass(speaker_index)"></i>
        <span>{{ speaker }}:</span>
      </div>
      <div data-testid="comm-talk-time-analysis-section-speaker">
        <strong class="ml-1">{{ talk_time_analysis[speaker] }}% </strong>
        <span>talk time</span>
      </div>
    </div>
  </div>
</template>

<script>
import * as CommunicationDirection from 'src/constants/communication-direction'

export default {
  name: 'TalkTimeAnalysisSection',

  props: {
    talk_time_analysis: {
      type: Object,
      required: true
    },
    speakers: {
      type: Array,
      required: true
    },
    direction: {
      type: Number,
      required: true
    },
    isEmpty: {
      type: Function,
      required: true
    }
  },

  methods: {
    getSpeakerClass (speakerIndex) {
      let style = {}

      if (this.direction === CommunicationDirection.INBOUND) {
        style = {
          color: 'rgb(0, 200, 200)'
        }

        if (speakerIndex === 1) {
          style.color = 'rgb(200, 0, 200)'
        }
      }

      if (this.direction === CommunicationDirection.OUTBOUND) {
        style = {
          color: 'rgb(200, 0, 200)'
        }

        if (speakerIndex === 1) {
          style.color = 'rgb(0, 200, 200)'
        }
      }

      return style
    }
  }
}
</script>

<style scoped>
.lh-30 {
  line-height: 30px;
}
</style>
