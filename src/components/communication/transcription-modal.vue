<template>
  <div>
    <q-btn icon="chat"
           color="primary"
           flat
           round
           dense
           v-if="singleButton"
           @click="fetchSmartTranscriptionData">
      <q-tooltip>
        <span>
          {{ buttonText }}
        </span>
      </q-tooltip>
    </q-btn>
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
          <div class="q-pa-md mx-3 py-0 border border-rounded"
               v-if="remote_url && !isLoading">
            <waveform :remote-url="remote_url"
                      :unique-id="communication.id"/>
          </div>

          <div class="loading-overlay"
               v-if="isLoading">
            <div>
              <img class="loading-icon"
                   alt="Loading"
                   src="/assets/images/loading.svg"/>
            </div>
          </div>

          <div class="flex row py-4" v-else>
            <div class="col-6">
              <categories-section :categories="iab_categories"
                                  :is-empty="isEmpty"/>

              <highlights-section :highlights="highlights"
                                  :speakers="speakers"
                                  :is-empty="isEmpty"/>

              <entities-section :entities="entities"
                                :entity-types="entity_types"
                                :speakers="speakers"
                                :is-empty="isEmpty"/>

              <custom-keywords-section :custom_keywords="custom_keywords"
                                       :speakers="speakers"
                                       :is-empty="isEmpty"/>
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
                          <strong>{{ sentimentSummary.overall }}</strong>
                          <q-tooltip>
                            {{ calculateOverAllSentimentBySpeaker(sentimentSummary) }}
                          </q-tooltip>
                        </q-chip>

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
                <section class="transcription chat-area"
                         ref="chatArea">
                  <!-- Sanity check. -->
                  <div v-if="!isEmpty(messages)">
                    <div :key="message_index"
                         v-for="(message, message_index) in formattedMessages">
                      <!--
                        Any agent message will prompt on the left side of conversation.
                        Any customer message will prompt on the right side of conversation.
                        Also, we need to change the background color based on the message sentiment.
                      -->
                      <p class="message-box break-word"
                         :class="message.classes.messageBoxClass"
                         :style="{ border: message.sentimentBorder }">
                        <strong>Speaker: {{ message.speaker }}</strong>
                        <br>
                        <span style="line-height: 1.6"
                              v-html="message.formattedText">
                        </span>
                      </p>

                      <!-- Show the speaker's sentiment below each message. -->
                      <span class="sentiment flex items-center justify-start"
                            :class="message.classes.sentimentClass">
                        <span class="sentiment-circle"
                              :style="{ background: message.sentimentBackgroundColor }" />
                        <span class="sentiment-description">{{ message.sentiment_possibility }}% {{ message.sentiment }}</span>
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
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import Waveform from 'components/waveform'
import * as UploadedFileTypes from 'src/constants/uploaded-file-types'
import { isEmpty } from 'lodash'
import CategoriesSection from './transcription-components/categories-section'
import HighlightsSection from './transcription-components/highlights-section'
import EntitiesSection from './transcription-components/entities-section'
import CustomKeywordsSection from './transcription-components/custom-keywords-section'

export default {
  name: 'TranscriptionModal',

  components: {
    Waveform,
    CategoriesSection,
    HighlightsSection,
    EntitiesSection,
    CustomKeywordsSection
  },

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
      isLoading: false,
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
        'NEUTRAL': 'blue-grey-2',
        'NEGATIVE': 'red-6'
      },
      sentimentColors: {
        'POSITIVE': '#b9f6ca',
        'NEUTRAL': '#d0d8dc',
        'NEGATIVE': '#f44336'
      },
      UploadedFileTypes,
      isEmpty
    }
  },

  computed: {
    formattedMessages () {
      return this.messages.map(message => ({
        ...message,
        classes: this.getMessageClasses(message.speaker),
        formattedText: this.circleText(message.speaker, message.text),
        sentimentBorder: `3px solid ${this.sentimentColors[message.sentiment]}`,
        sentimentBackgroundColor: this.sentimentColors[message.sentiment]
      }))
    },

    sentimentSummaryText () {
      return this.sentiment_analysis.map(sentiment => this.calculateOverAllSentimentBySpeaker(sentiment))
    }
  },

  methods: {
    fetchSmartTranscriptionData () {
      this.isLoading = true
      this.show_form = true
      this.remote_url = null

      // Fetch communication transcription.
      window.axios.get(`/api/v1/transcription/communication/${this.communication.id}`)
        .then(res => {
          this.setSmartTranscriptionData(res.data)
          this.isLoading = false
        }).catch(err => {
          console.log("Couldn't fetch transcription information.", err)
          this.isLoading = false
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
          let backupMessageText = messageText
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

    handleClose () {
      this.show_form = false
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
      const positiveSum = sentimentSummary.positive
      const neutralSum = sentimentSummary.neutral
      const negativeSum = sentimentSummary.negative
      const wholeSentimentsSum = positiveSum + neutralSum + negativeSum

      let sentimentPercentages = ''

      // If we had no sentiments, don't do anything.
      if (wholeSentimentsSum === 0) {
        return sentimentPercentages
      }

      // Let's build each sentiment percentage.
      for (const sentiment of this.sentiments) {
        let percentage = 0
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

    getMessageClasses (speaker) {
      const isAgent = ['AGENT', 'A'].includes(speaker)

      return {
        messageBoxClass: isAgent ? 'message-box-out' : 'message-box-in',
        sentimentClass: isAgent ? 'sentiment-out' : 'sentiment-in'
      }
    }
  }
}
</script>
