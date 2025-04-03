<template>
  <div>
    <!-- Custom Keywords section. -->
    <h2 class="mt-4 mb-1 text-dark" data-testid="comm-custom-keywords-section">Custom Keywords Frequency</h2>
    <hr class="my-1">
    <!-- Sanity check. -->
    <div v-if="!isEmpty(customKeywords)">
      <!-- We want to show the custom keywords by speaker. -->
      <div v-for="(speaker, speaker_index) in speakers" :key="speaker_index">
        <!-- Check if the current speaker said any custom keyword -->
        <div v-if="customKeywords[speaker]" class="mt-2">
          <div class="speaker--title">{{ speaker }}</div>
          <!-- customKeywords[speaker] contains an object in which the keys represent the custom keywords. -->
          <q-chip class="q-mr-sm q-mt-sm q-chip__content white-color"
                  color="amber-2"
                  text-color="white"
                  dense
                  data-testid="comm-custom-keywords-section-chip"
                  :key="idx"
                  v-for="(keyword, idx) in Object.keys(customKeywords[speaker])">
            {{ keyword | ucfirst }}<span class="ml-1 text-grey-30">{{ ` x ${customKeywords[speaker][keyword]}` }}</span>
          </q-chip>
        </div>
      </div>
    </div>

    <!-- If no custom keywords were detected. -->
    <div v-else>
      <span>
        We couldn't find any custom keywords in this call. For more information please check
        <a style="color: blue"
           data-testid="comm-custom-keywords-section-this-article-link"
           href="https://support.aloware.com/en/articles/9037887-frequently-asked-questions-smart-transcription">
          this article.
        </a>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomKeywordsSection',

  props: {
    customKeywords: {
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
