<template>
  <div class="flex items-center"
       v-if="!isEmpty(talk_time_analysis)"
       data-testid="comm-talk-time-analysis-wrapper">
    <strong class="mr-2" data-testid="comm-talk-time-analysis-section">Talk Time:</strong>
    <div>
      <!--
          Talk time analysis contains:
              [key]: speaker as a string value.
              [value]: talk time ratio float.
      -->
      <div class="flex inline items-center mr-3"
            :key="speaker_index"
            v-for="(speaker, speaker_index) in speakers">
        <div class="flex mr-2" data-testid="comm-talk-time-analysis-section-speaker">
          {{ speaker }}:<strong class="ml-1">{{ talk_time_analysis[speaker] }}%</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
    isEmpty: {
      type: Function,
      required: true
    }
  }
}
</script>
