<template>
  <div v-if="!isEmpty(talk_time_analysis)"
       data-testid="comm-talk-time-analysis-wrapper">
    <!--
          Talk time analysis contains:
              [key]: speaker as a string value.
              [value]: talk time ratio float.
      -->
    <div class="d-flex flex-row align-items-center justify-content-between lh-30 gap-30"
         :key="speaker_index"
         v-for="(speaker, speaker_index) in speakers">
      <div>
        <i class="fa-solid fa-circle mr-2"
           :style="getSpeakerClass(speaker_index)"></i>
        <b>{{ speaker }}</b>
        <b v-if="getSpeakerName(speaker)">: </b>
        <span>
          {{ getSpeakerName(speaker) }}
        </span>
      </div>

      <div data-testid="comm-talk-time-analysis-section-speaker">
        <strong class="ml-1">{{ talk_time_analysis[speaker] }}% </strong>
        <span>talk time</span>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'TalkTimeAnalysisSection',

  props: {
    communication: {
      type: Object,
      required: true
    },
    contact: {
      type: Object,
      required: false
    },
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
  },

  methods: {
    getSpeakerClass (speakerIndex) {
      let style = {
        color: 'rgb(200, 0, 200)'
      }

      if (speakerIndex === 1) {
        style.color = 'rgb(0, 200, 200)'
      }

      return style
    },

    getSpeakerName (speaker) {
      return (speaker === 'AGENT') ? this.communication?.user?.name : (this.communication?.contact?.name ?? this.contact?.name)
    }
  }
}
</script>

<style scoped>
.lh-30 {
  line-height: 30px;
}

.gap-30 {
  gap: 30px;
}
</style>
