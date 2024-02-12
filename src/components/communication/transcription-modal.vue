<template>
  <div>
    <q-btn icon="chat"
           color="primary"
           flat
           round
           dense
           v-if="singleButton"
           @click="fetchSmartTranscriptionData"/>
    <div class="flex items-center mr-1 h-100"
         v-else
         @click="fetchSmartTranscriptionData">
      <span class="text-blue cursor-pointer">
        {{ buttonText }}
      </span>
    </div>

    <!-- Smart Transcription modal. -->
    <q-dialog v-model="show_form">
      <q-card class="transcription w-100 max-w-85">
        <q-card-section class="row items-center no-wrap px-4">
          <div class="text-h6 pl-3">Smart Transcription</div>
          <q-space></q-space>
          <q-btn class="pr-1"
                 icon="close"
                 flat
                 round
                 @click="handleClose">
          </q-btn>
        </q-card-section>

        <q-card-section class="q-pt-none px-4">
          <div class="q-pa-md mx-3 border"
               v-if="remote_url">
            <waveform :remote-url="remote_url"
                      :unique-id="communication.id"/>
          </div>

          <div v-if="loading" class="text-center">Loading...</div>

          <div class="flex row py-4">
            <div class="col-6">
              <!-- Categories section. -->
              <h2 class="mb-1 text-dark">Categories</h2>
              <hr class="my-1">

              <!-- Sanity check. -->
              <div class="q-my-md"
                   v-if="!isEmpty(iab_categories)">
                <!-- Let's iterate over iab categories to extract each category summary. -->
                <div :key="summary_index" class="q-mb-md"
                     v-for="(category_summary, summary_index) in iab_categories">
                  <q-chip class="q-mr-sm"
                          dense
                          :key="category_index"
                          v-for="(category, category_index) in category_summary.categories">
                    {{ category }}
                  </q-chip>
                  <q-tooltip class="float-right"
                             :content="'Relevance between the conversation and this category'">
                    <span style="font-size: 16px">
                      {{ category_summary.relevance }}%
                    </span>
                  </q-tooltip>
                </div>
              </div>

              <!-- If no categories were detected. -->
              <div v-else>
                <span>
                  We couldn't find any categories in this call. For more information please check
                  <a style="color: blue"
                     href="https://support.aloware.com/frequently-asked-questions-smart-transcription-1">
                     this article.
                  </a>
                </span>
              </div>

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
                          color="green-11"
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

              <!-- Entities section. -->
              <h2 class="mt-4 mb-1 text-dark">Entities</h2>
              <hr class="my-1">
              <!-- Sanity check. -->
              <div v-if="!isEmpty(entities)">
                <!-- We want to show the entities by speaker -->
                <div :key="speaker_index"
                     v-for="(speaker, speaker_index) in speakers">
                  <!-- Check if an entity was the detected the current speaker -->
                  <div class="mt-2"
                       v-if="entities[speaker]">
                    <div class="speaker--title">{{ speaker }}</div>
                    <!-- Let's iterate over each entity that belongs to the current speaker and type. -->
                    <q-chip class="q-mx-sm q-my-sm q-chip__content white-color"
                            color="green-11"
                            text-color="white"
                            dense
                            :key="entity_index"
                            v-for="(entity, entity_index) in entities[speaker]">
                      {{ entity }}
                    </q-chip>
                  </div>
                </div>
              </div>

              <!-- If no entities were detected. -->
              <div v-else>
                <span class="mt-3">
                  We couldn't find any specific entities in this call. For more information please check
                  <a style="color: blue"
                     href="https://support.aloware.com/frequently-asked-questions-smart-transcription-1">
                    this article.
                  </a>
                </span>
              </div>

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
                            color="orange"
                            text-color="white"
                            dense
                            :key="idx"
                            v-for="(keyword, idx) in Object.keys(custom_keywords[speaker])">
                      {{ keyword | ucfirst }}<span>{{ ` x ${custom_keywords[speaker][keyword]}` }}</span>
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

            <div class="col-6">
              <div>
                <!-- Overall Sentiment Analysis section. -->
                <div class="mb-2">
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
                          {{ sentimentSummary.overall }}
                        </q-chip>
                        <!-- <q-tooltip :content="calculateOverAllSentimentBySpeaker(sentimentSummary)">

                        </q-tooltip> -->
                      </div>
                    </div>
                  </div>

                  <!-- Talk Time Analysis section. -->
                  <div class="flex items-center"
                       v-if="!isEmpty(talk_time_analysis)">
                    <strong class="mr-2">Talk Time:</strong>
                    <div>
                      <!--
                          Talk time analysis contains:
                              [key]: speaker as a string value.
                              [value]: talk time ratio float.
                      -->
                      <div class="flex inline items-center mr-3"
                           :key="speaker_index"
                           v-for="(speaker, speaker_index) in speakers">
                        <div class="flex mr-2">
                          {{ speaker }}:<strong class="ml-1">{{ talk_time_analysis[speaker] }}%</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Conversation section. -->
                <div>
                  <section class="transcription chat-area"
                           ref="chatArea">
                    <!-- Sanity check. -->
                    <div v-if="!isEmpty(messages)">
                      <div :key="message_index"
                           v-for="(message, message_index) in messages">
                        <!--
                          Any agent message will prompt on the left side of conversation.
                          Any customer message will prompt on the right side of conversation.
                          Also, we need to change the background color based on the message sentiment.
                        -->
                        <p class="message-box break-word"
                           :class="{ 'message-box-out': ['AGENT', 'A'].includes(message.speaker), 'message-box-in': !['AGENT', 'A'].includes(message.speaker) }"
                           :style="{ background: sentimentColors[message.sentiment], borderRadius: '10px', padding: '0.5em', margin: '0.5em 0', color: 'black' }">
                          <strong>Speaker: {{ message.speaker }}</strong>
                          <br>
                          <span style="line-height: 1.6"
                                v-html="circleText(message.speaker, message.text)">
                          </span>
                        </p>

                        <!-- Show the speaker's sentiment below each message. -->
                        <span class="sentiment flex justify-end"
                              :class="{ 'sentiment-out': ['AGENT', 'A'].includes(message.speaker), 'sentiment-in': !['AGENT', 'A'].includes(message.speaker) }">
                          <q-chip text-color="white"
                                  :style="{ background: sentimentColors[message.sentiment] }">
                            {{ message.sentiment_possibility }}% {{ message.sentiment }}
                          </q-chip>
                        </span>
                      </div>
                    </div>

                    <!-- If no conversation was detected. -->
                    <div class="text-center"
                         v-else>
                      <span>No Conversation</span>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import Waveform from 'components/waveform'
import * as UploadedFileTypes from 'src/constants/uploaded-file-types'
import _ from 'lodash'

export default {
  name: 'TranscriptionModal',

  components: { Waveform },

  props: {
    communication: {
      required: true
    },
    buttonText: {
      type: String,
      default: 'Show Transcription'
    },
    singleButton: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      loading: false,
      show_form: false,
      remote_url: null,
      iab_categories: [],
      highlights: [],
      entities: [],
      entity_types: [],
      custom_keywords: [],
      sentiment_analysis: [],
      talk_time_analysis: [],
      messages: [],
      sentiments: [
        'POSITIVE',
        'NEUTRAL',
        'NEGATIVE'
      ],
      sentimentChipColors: {
        'POSITIVE': 'green-11',
        'NEUTRAL': 'blue-grey-3',
        'NEGATIVE': 'red-6'
      },
      sentimentColors: {
        'POSITIVE': '#b9f6ca',
        'NEUTRAL': '#b0bec6',
        'NEGATIVE': '#f44336'
      },
      UploadedFileTypes
    }
  },

  methods: {
    /**
     * Fetches Transcription's data along with communication remote url.
     * @public
     */
    fetchSmartTranscriptionData () {
      this.loading = true
      // Once the button is clicked, let's show the form.
      this.show_form = true
      // Remote url is reset to reload <waveform> component.
      this.remote_url = null
      this.setSidebarFolded(true)

      // Fetch communication transcription.
      window.axios.get(`/api/v1/transcription/communication/${this.communication.id}`)
        .then(res => {
          this.setSmartTranscriptionData(res.data)
          this.loading = false
        }).catch(err => {
          console.log("Couldn't fetch transcription information.", err)
          this.loading = false
        })

      // Fetch communication recording url.
      let options = {
        params: {
          type: this.UploadedFileTypes.TYPE_CALL_RECORDING
        }
      }

      window.axios.get(`/api/v1/communication/${this.communication.id}/file-url`, options)
        .then(res => {
          this.remote_url = res.data.url
        }).catch(err => {
          console.log("Couldn't fetch call recording.", err)
        })
    },

    /**
    * Sets Smart Transcription panel data.
    * @public
    *
    * @param {Object} data
    */
    setSmartTranscriptionData (data) {
      // Sort the speakers to always get AGENT first.
      this.speakers = data.speakers.sort()
      this.iab_categories = data.iab_categories
      this.highlights = data.highlights
      this.highlights_summary = data.auto_highlights_summary
      this.entities = data.entities
      this.entity_types = data.entity_types
      this.custom_keywords = data.custom_keywords
      this.messages = data.messages
      this.sentiment_analysis = data.sentiment_analysis_summary
      this.talk_time_analysis = data.talk_time_analysis
    },

    /**
    * Adds border to highlights in a message text.
    * @public
    *
    * @param {string} messageText
    *
    * @returns {string}
    */
    circleText (speaker, messageText) {
      this.highlights_summary.forEach(function (highlightSummary) {
        if (speaker === highlightSummary.speaker) {
          /** @var {string} messageText Needed to revert doubled highlighted words. */
          let backupMessageText = messageText

          /** @var {string} highlightText Get highlight text to circle. */
          let highlightText = highlightSummary.text

          // Circle the highlight if it exists in the message text.
          messageText = messageText.replace(
            highlightText, `<span style="padding:0.0em 0.1em;border-radius: 5px; color: black;border-style: solid">${highlightText}</span>`
          )

          /**
          * Imagine we have 2 highlights: 'call' and 'outbound call'.
          * At this point 'call' will be highlighted twice.
          *
          * If we find a span tag directly connected to another one,
          * it means a word has already been highlighted twice.
          *
          * Check for existing tag before and after a span.
          */
          if (messageText.includes('><span') || messageText.includes('</span><')) {
            // Revert last highlighted word to prevent double highlighting.
            messageText = backupMessageText
          }
        }
      })

      return messageText
    },

    /**
         * Closes Smart Transcription modal.
         * @public
         */
    handleClose () {
      this.show_form = false
    },

    /**
    * Encapsulates lodash _.isEmpty() function.
    * @public
    *
    * @param {Object} data
    *
    * @returns {boolean}
    */
    isEmpty (data) {
      return _.isEmpty(data)
    },

    /**
    * Create a string with each speaker sentiments' percentages.
    * @public
    *
    * @param {Object} sentimentSummary
    *
    * @returns {string} Ex: POSITIVE: 0%; NEUTRAL: 100%; NEGATIVE: 0%;
    */
    calculateOverAllSentimentBySpeaker (sentimentSummary) {
      /** @var {number} positiveSum */
      const positiveSum = sentimentSummary.positive
      /** @var {number} neutralSum */
      const neutralSum = sentimentSummary.neutral
      /** @var {number} negativeSum */
      const negativeSum = sentimentSummary.negative

      /** @var {number} wholeSentimentsSum */
      const wholeSentimentsSum = positiveSum + neutralSum + negativeSum

      /**  @var {string} sentimentPercentages The actual string shown in the Overall Sentiment Tooltip. */
      let sentimentPercentages = ''

      // If we had no sentiments, don't do anything.
      if (wholeSentimentsSum === 0) {
        return sentimentPercentages
      }

      // Let's build each sentiment percentage.
      for (const sentiment of this.sentiments) {
        /** @var {number} percentage Current sentiment percentage. */
        let percentage = 0

        /** @var {number} currentSentimentSum */
        let currentSentimentSum = 0

        // Match each sentiment with its count
        switch (sentiment) {
          case 'POSITIVE':
            currentSentimentSum = positiveSum
            break
          case 'NEUTRAL':
            currentSentimentSum = neutralSum
            break
          case 'NEGATIVE':
            currentSentimentSum = negativeSum
            break
        }

        // Calculate current sentiment percentage
        percentage = (currentSentimentSum / wholeSentimentsSum) * 100

        // Add current sentiment percentage with 2 decimals to final string.
        sentimentPercentages += `${sentiment}: ${(percentage).toFixed(2)}%; `
      }

      return sentimentPercentages
    },

    ...mapActions('cache', ['setSidebarFolded', 'resetCache'])
  }
}
</script>
