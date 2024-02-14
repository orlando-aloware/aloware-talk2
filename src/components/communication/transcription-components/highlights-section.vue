<template>
  <div>
    <!-- Highlights section. -->
    <h2 class="mt-4 mb-1 text-dark">Highlights</h2>
    <hr class="my-1">
    <!-- Sanity check. -->
    <div v-if="!isEmpty(highlights)">
      <!-- To get the highlights by speaker, first we iterate over speakers array. -->
      <div class="mt-2"
           :key="speaker_index"
           v-for="(speaker, speaker_index) of speakers">
        <div class="speaker--title">{{ speaker }}</div>
        <!-- The highlight[speaker] contains the array of highlights. -->
        <q-chip class="q-mr-sm q-chip__content white-color"
                color="blue-3"
                text-color="white"
                dense
                :key="highlight_index"
                v-for="(highlight, highlight_index) in highlights[speaker]">
          {{ highlight }}
        </q-chip>
      </div>
    </div>

    <!-- If no highlights were detected. -->
    <div v-else>
      <span class="mt-3">
        We couldn't find any highlights in this call. For more information please check
        <a style="color: blue"
           href="https://support.aloware.com/frequently-asked-questions-smart-transcription-1">
          this article.
        </a>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HighlightsSection',

  props: {
    highlights: {
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
