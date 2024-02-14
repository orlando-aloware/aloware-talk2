<template>
  <div>
    <!-- Custom Keywords section. -->
    <h2 class="mt-4 mb-1 text-dark">Custom Keywords Frequency</h2>
    <hr class="my-1">
    <!-- Sanity check. -->
    <div v-if="!isEmpty(custom_keywords)">
      <!-- We want to show the custom keywords by speaker. -->
      <div v-for="(speaker, speaker_index) in speakers" :key="speaker_index">
        <!-- Check if the current speaker said any custom keyword -->
        <div v-if="custom_keywords[speaker]" class="mt-2">
          <div class="speaker--title">{{ speaker }}</div>
          <!-- custom_keywords[speaker] contains an object in which the keys represent the custom keywords. -->
          <q-chip class="q-mr-sm q-mt-sm q-chip__content white-color"
                  color="amber-2"
                  text-color="white"
                  dense
                  :key="idx"
                  v-for="(keyword, idx) in Object.keys(custom_keywords[speaker])">
            {{ keyword | ucfirst }}<span class="ml-1 text-grey-30">{{ ` x ${custom_keywords[speaker][keyword]}` }}</span>
          </q-chip>
        </div>
      </div>
    </div>

    <!-- If no custom keywords were detected. -->
    <div v-else>
      <span>
        We couldn't find any custom keywords in this call. For more information please check
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
  name: 'CustomKeywordsSection',

  props: {
    custom_keywords: {
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
