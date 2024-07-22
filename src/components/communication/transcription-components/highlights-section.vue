<template>
  <div>
    <!-- Highlights section. -->
    <h2 class="mt-4 mb-1 text-dark" data-testid="comm-highlights-section">Highlights</h2>
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
                data-testid="comm-highlights-section-chip"
                v-for="(highlight, highlight_index) in highlights[speaker]">
          {{ highlight }}
        </q-chip>
      </div>
    </div>

    <!-- If no highlights were detected. -->
    <div v-else-if="!isSimpSocial">
      <span class="mt-3">
        We couldn't find any highlights in this call. For more information please check
        <a style="color: blue"
           data-testid="comm-highlights-section-this-article-link"
           href="https://support.aloware.com/en/articles/9037887-frequently-asked-questions-smart-transcription">
          this article.
        </a>
      </span>
    </div>
  </div>
</template>

<script>
import { simpsocialMixin } from 'src/plugins/mixins'

export default {
  name: 'HighlightsSection',

  mixins: [simpsocialMixin],

  props: {
    highlights: {
      type: [Object, Array],
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
