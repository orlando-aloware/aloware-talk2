<template>
  <div data-testid="transcription-modal-wrapper">
    <q-btn icon="chat"
           color="primary"
           flat
           round
           dense
           data-testid="comm-transcription-modal-single-btn"
           :size="buttonSize"
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
         data-testid="comm-transcription-modal-btn"
         @click="fetchSmartTranscriptionData">
      <span class="text-blue cursor-pointer">
        {{ buttonText }}
      </span>
    </div>

    <!-- Smart Transcription modal. -->
    <q-dialog v-model="show_form" data-testid="comm-transcription-modal-dialog">
      <q-card class="transcription w-100 max-w-85">
        <q-card-section class="row items-center no-wrap px-4">
          <!--COMM TYPE-->
          <q-card-section class="comm-type-container" data-testid="comm-details-comm-type-card-section">
            <div class="text-h6 d-inline-flex align-items-center"
                 :class="[!communication.duration ? 'flex-grow-1 text-left' : '']">
              <component :is="stateToIcon(communication.disposition_status2, communication.type, communication.direction, communication.callback_status)"
                         v-if="communication.disposition_status2">
              </component>
              <div class="comm-type-wrapper pl-3">
                <span v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)">
                  {{ communication.direction | fixCommDirection }}
                </span>
                {{ communication.type | fixCommType }}

                <span v-if="communication?.contact">
                  {{ communication.direction | getCommPrepositions }} {{ communication.contact.name | fixContactName }}
                </span>
                <span v-else-if="contact">
                  {{ communication.direction | getCommPrepositions }} {{ contact.name | fixContactName }}
                </span>
              </div>
            </div>
          </q-card-section>

          <q-space></q-space>
          <q-btn icon="close"
                 flat
                 round
                 data-testid="comm-transcription-modal-close-dialog-btn"
                 @click="handleClose">
          </q-btn>
        </q-card-section>

        <q-card-section class="q-pt-none px-4">
          <div class="mx-3 py-2"
               v-if="remoteUrl && !isLoading">
            <div class="d-flex flex-row align-items-center">
              <waveform :remote-url="remoteUrl"
                        :unique-id="communication.id"
                        :height="40"
                        :split-channels="splitChannels"
                        data-testid="comm-transcription-modal-waveform"
                        @time-update="updateCurrentTime">
              </waveform>
              <download-button v-if="fileUuid"
                               data-testid="communication-audio-download-button"
                               is-simple
                               :communication-id="communication.id"
                               :filename="filename"
                               :file-mime-type="mimeType"
                               :file-uuid="fileUuid"/>
            </div>
            <div class="d-flex flex-row align-items-center mt-2">
              <talk-time-analysis-section :talk_time_analysis="talk_time_analysis"
                                          :direction="communication.direction"
                                          :speakers="speakers"
                                          :is-empty="isEmpty"
                                          data-testid="comm-transcription-modal-talk-time-analysis-section"/>

              <sentiment-analysis-section :sentiment_analysis="sentiment_analysis"
                                          :sentiment-chip-colors="sentimentChipColors"
                                          :is-empty="isEmpty"
                                          :calculate-over-all-sentiment-by-speaker="calculateOverAllSentimentBySpeaker"
                                          class="ml-2"
                                          data-testid="comm-transcription-modal-sentiment-analysis-section"/>
            </div>
          </div>

          <div class="row py-4"
               v-if="!isLoading">
            <div id="reference-column"
                 class="col-6 pt-12">
              <categories-section :categories="iab_categories"
                                  :is-empty="isEmpty"
                                  data-testid="comm-transcription-modal-category-section"/>

              <highlights-section :highlights="highlights"
                                  :speakers="speakers"
                                  :is-empty="isEmpty"
                                  data-testid="comm-transcription-modal-highlights-section"/>

              <entities-section :entities="entities"
                                :entity-types="entity_types"
                                :speakers="speakers"
                                :is-empty="isEmpty"
                                data-testid="comm-transcription-modal-entities-section"/>

              <custom-keywords-section :custom-keywords="custom_keywords"
                                       :speakers="speakers"
                                       :is-empty="isEmpty"
                                       data-testid="comm-transcription-modal-custom-keywords-section"/>
            </div>

            <div class="col-6">
              <q-tabs v-model="tabName"
                      no-caps
                      inline-label
                      dense
                      :mobile-arrows="false"
                      align="left"
                      class="bg-white text-black border-bottom"
                      content-class="flex-nowrap">
                <q-tab name="transcription"
                       label="Transcription"/>
                <q-tab name="summary"
                       label="Summary"
                       :disable="!currentCompany?.transcription_settings?.summarization_enabled"/>
              </q-tabs>
              <q-tab-panels v-model="tabName">
                <q-tab-panel class="p-0"
                             name="transcription">
                  <conversation-section :messages="messages"
                                        :formatted-messages="formattedMessages"
                                        :is-empty="isEmpty"
                                        ref="conversationSection"
                                        data-testid="comm-transcription-modal-conversation-section"/>
                </q-tab-panel>

                <q-tab-panel class="p-0"
                             name="summary">
                  <section class="transcription chat-area"
                           id="summary"
                           data-testid="comm-summary-section"
                           ref="summaryArea">
                    {{ customSummary }}
                  </section>
                </q-tab-panel>
              </q-tab-panels>
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
import SentimentAnalysisSection from './transcription-components/sentiment-analysis-section'
import TalkTimeAnalysisSection from './transcription-components/talk-time-analysis-section'
import ConversationSection from './transcription-components/conversation-section'
import DownloadButton from 'components/download-button.vue'
import { communicationInfoMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'
import * as CommunicationTypes from 'src/constants/communication-types'

export default {
  name: 'TranscriptionModal',

  mixins: [
    communicationInfoMixin
  ],

  components: {
    DownloadButton,
    Waveform,
    CategoriesSection,
    HighlightsSection,
    EntitiesSection,
    CustomKeywordsSection,
    SentimentAnalysisSection,
    TalkTimeAnalysisSection,
    ConversationSection
  },

  props: {
    communication: {
      required: true
    },
    contact: {
      required: false
    },
    buttonText: {
      type: String,
      default: 'Show Transcription'
    },
    buttonSize: {
      type: String,
      default: 'sm'
    },
    singleButton: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      tabName: 'transcription',
      isLoading: true,
      show_form: false,
      remoteUrl: null,
      iab_categories: [],
      highlights: [],
      entities: [],
      entity_types: [],
      custom_keywords: [],
      sentiment_analysis: [],
      talk_time_analysis: [],
      messages: [],
      summaryEngine: null,
      customSummary: null,
      summaryPrompt: null,
      summaryFeedback: null,
      sentiments: [
        'POSITIVE',
        'NEUTRAL',
        'NEGATIVE'
      ],
      sentimentChipColors: {
        'POSITIVE': 'green-11',
        'NEUTRAL': 'blue-grey-2',
        'NEGATIVE': 'red-3'
      },
      sentimentColors: {
        'POSITIVE': '#b9f6ca',
        'NEUTRAL': '#d0d8dc',
        'NEGATIVE': '#ff7d74'
      },
      splitChannels: [
        {
          waveColor: 'rgb(200, 0, 200)',
          progressColor: 'rgb(100, 0, 100)',
          barAlign: 'bottom'
        },
        {
          waveColor: 'rgb(0, 200, 200)',
          progressColor: 'rgb(0, 100, 100)',
          barAlign: 'top'
        }
      ],
      UploadedFileTypes,
      isEmpty
    }
  },

  computed: {
    CommunicationTypes () {
      return CommunicationTypes
    },
    ...mapState('cache', ['currentCompany']),

    formattedMessages () {
      return this.messages.map(message => ({
        ...message,
        classes: this.getMessageClasses(message.speaker),
        formattedText: this.circleText(message.speaker, message.text),
        sentimentBorder: `2px solid ${this.sentimentColors[message.sentiment]}`,
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
      this.remoteUrl = null

      // Fetch communication transcription.
      window.axios.get(`/api/v1/transcription/communication/${this.communication.id}`)
        .then(res => {
          this.setSmartTranscriptionData(res.data)
          this.isLoading = false
        }).catch(err => {
          console.log('Couldn\'t fetch transcription information.', err)
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
          this.fileUuid = this.getUuidFromURL(res.data.download_url)
          this.filename = this.getFilenameFromURL(res.data.download_url)
          this.remoteUrl = res.data.url
          this.downloadUrl = res.data.download_url
          this.mimeType = res.data.mimetype || ''
        }).catch(err => {
          console.log('Couldn\'t fetch call recording.', err)
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
      this.speakers = data.speakers?.sort()
      this.iab_categories = data.iab_categories
      this.highlights = data.highlights
      this.highlights_summary = data.auto_highlights_summary
      this.entities = data.entities
      this.entity_types = data.entity_types
      this.custom_keywords = data.custom_keywords
      this.messages = data.messages
      this.sentiment_analysis = data.sentiment_analysis_summary
      this.talk_time_analysis = data.talk_time_analysis
      this.summaryEngine = data.summary_engine
      this.customSummary = data.custom_summary
      this.summaryPrompt = data.summary_prompt
      this.summaryFeedback = data.summary_feedback
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
        sentimentClass: isAgent ? 'justify-start' : 'justify-end'
      }
    },

    updateCurrentTime (time) {
      if (this.tabName === 'transcription') {
        this.$refs.conversationSection.syncScroll(time)
      }
    }
  }
}
</script>

<style scoped>
.pt-12 {
  padding-top: 12px;
}
</style>
