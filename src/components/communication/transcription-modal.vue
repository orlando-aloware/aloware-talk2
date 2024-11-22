<template>
  <div data-testid="transcription-modal-wrapper">
    <q-btn icon="chat"
           color="primary"
           flat
           round
           dense
           :size="buttonSize"
           data-testid="comm-transcription-modal-single-btn"
           @click="fetchSmartTranscriptionData">
      <q-tooltip>
        <span>
          {{ buttonText }}
        </span>
      </q-tooltip>
    </q-btn>

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
                        :communication="communication"
                        :messages="messages"
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
                    <div v-if="custom_summary || summary_status === SummaryStatus.STATUS_COMPLETED" style="display: flex; justify-content: flex-end; gap: 4px; margin-top: -8px;">
                      <q-btn color="text-dark-greenish"
                             class="btn btn-inline px-1 py-0"
                             title="Download Summary"
                             flat
                             rounded
                             dense
                             no-caps
                             data-testid="download-button-download-btn"
                             @click="onDownload()">
                        <download-icon height="20"
                                       width="20"
                                       data-testid="download-button-download-icon">
                        </download-icon>
                      </q-btn>
                      <q-btn color="text-dark-greenish"
                             class="btn btn-inline px-1 py-0"
                             title="Copy Summary"
                             flat
                             rounded
                             dense
                             no-caps
                             data-testid="copy-button-copy-btn"
                             @click="onCopy()">
                        <copy-icon height="20"
                                   width="20"
                                   color="#007bff"
                                   data-testid="copy-button-copy-icon">
                        </copy-icon>
                      </q-btn>
                    </div>
                    <div class="summary-status-container">
                      <div v-if="!summary_status">
                        <generate-summary-button class="mr-2"
                                                 data-testid="comm-details-generate-summary-button"
                                                 :is-generating="isGenerating"
                                                 :communication="communication"
                                                 @updateGenerating="updateGenerating">
                        </generate-summary-button>
                      </div>
                      <div v-else-if="summary_status === SummaryStatus.STATUS_FAILED" class="status-message">
                        <q-icon name="error" color="red" size="md" />
                        <div>Summary generation failed. Please try again later.</div>
                        <br>
                        <generate-summary-button class="mr-2"
                                                 data-testid="comm-details-generate-summary-button"
                                                 :is-generating="isGenerating"
                                                 :communication="communication"
                                                 @updateGenerating="updateGenerating">
                        </generate-summary-button>
                      </div>
                      <div v-else-if="summary_status === SummaryStatus.STATUS_PROCESSING || summary_status === SummaryStatus.STATUS_QUEUED" class="status-message">
                        <q-icon name="hourglass_empty" color="blue" size="md" />
                        <span>Your summary is being processed. Please wait...</span>
                      </div>
                    </div>
                    <div v-if="custom_summary || summary_status === SummaryStatus.STATUS_COMPLETED" class="custom-summary" v-html="parseMarkdown(custom_summary)" />
                    <div v-if="custom_summary ||summary_status === SummaryStatus.STATUS_COMPLETED" class="summary-feedback-section mt-2 d-flex justify-end align-items-center">
                      <span class="evaluation-text pr-2">Please evaluate the accuracy of this summary.</span>
                      <img
                        class="clickable-icon"
                        :src="upvoteActive ? 'app-icons/menu/thumb-up-green.svg' : 'app-icons/menu/thumb-up-outline.svg'"
                        @click="submitFeedback('upvote')"
                      />
                      <span class="mx-1"></span>
                      <img
                        class="clickable-icon"
                        :src="downvoteActive ? 'app-icons/menu/thumb-down-red.svg' : 'app-icons/menu/thumb-down-outline.svg'"
                        @click="submitFeedback('downvote')"
                      />
                    </div>
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
import { marked } from 'marked'
import DOMPurify from 'dompurify'
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
import talk2Api from 'src/plugins/api/api'
import * as CommunicationTypes from 'src/constants/communication-types'
import * as FeedbackConstants from 'src/constants/feedback-types'
import * as CommunicationDirection from 'src/constants/communication-direction'
import * as SummaryStatus from 'src/constants/summary-status'
import DownloadIcon from 'components/icons/contact-activity/download-icon'
import CopyIcon from 'components/icons/copy-icon'
import GenerateSummaryButton from 'components/generate-summary-button'

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
    ConversationSection,
    DownloadIcon,
    CopyIcon,
    GenerateSummaryButton
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
      summary_engine: null,
      custom_summary: null,
      summary_prompt: null,
      summary_status: null,
      feedback: null,
      upvoteActive: false,
      downvoteActive: false,
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
      UploadedFileTypes,
      isEmpty,
      isGenerating: false
    }
  },

  computed: {
    splitChannels () {
      if (this.communication.direction === CommunicationDirection.INBOUND) {
        return [
          {
            waveColor: 'rgb(0, 200, 200)',
            progressColor: 'rgb(0, 100, 100)',
            barAlign: 'bottom'
          },
          {
            waveColor: 'rgb(200, 0, 200)',
            progressColor: 'rgb(100, 0, 100)',
            barAlign: 'top'
          }
        ]
      } else {
        return [
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
        ]
      }
    },
    SummaryStatus () {
      return SummaryStatus
    },
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

  mounted () {
    this.checkAndShowTranscriptionModal()

    this.$VueEvent.listen('fetchSmartTranscriptionData', communicationId => this.handleFetchSmartTranscriptionData(communicationId))
  },

  methods: {
    handleFetchSmartTranscriptionData (communicationId) {
      if (this.communication.id === communicationId) {
        this.fetchSmartTranscriptionData()
      }
    },

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
      this.summary_engine = data.summary_engine
      this.custom_summary = data.custom_summary
      this.summary_prompt = data.summary_prompt
      this.summary_status = data.summary_status
      this.feedback = data.feedback
      this.upvoteActive = this.feedback === FeedbackConstants.FEEDBACK_UPVOTE
      this.downvoteActive = this.feedback === FeedbackConstants.FEEDBACK_DOWNVOTE
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

    /**
     * Check if the URL has a query parameter to show the transcription modal.
     * @public
     *
     * @returns {void}
     */
    checkAndShowTranscriptionModal () {
      const urlParams = new URLSearchParams(window.location.search)
      const showTranscription = urlParams.get('showTranscription')

      if (showTranscription === 'true') {
        this.fetchSmartTranscriptionData()
      }
    },

    /**
     * Download the custom summary as a text file.
     * @public
     *
     * @returns {void}
     */
    onDownload () {
      if (!this.custom_summary) return

      // Create a Blob with the custom summary content
      const blob = new Blob([this.custom_summary], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)

      // Create a temporary link to initiate the download
      const a = document.createElement('a')
      a.href = url
      a.href = url
      // Generate filename with the current date and time in "YYYYMMDD_HHMMSS" format
      a.download = `summary_${new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-')}.txt`
      a.click()

      // Revoke the object URL to release memory
      URL.revokeObjectURL(url)
    },

    /**
     * Copy the custom summary to the clipboard.
     * @public
     *
     * @returns {void}
     */
    onCopy () {
      if (!this.custom_summary) return

      navigator.clipboard.writeText(this.custom_summary)
        .then(() => {
          this.$generalNotification('Summary copied to clipboard')
        })
        .catch(err => {
          console.error('Failed to copy summary: ', err)
          this.$generalNotification('Failed to copy summary', 'error')
        })
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

    /**
     * Parse markdown text to HTML.
     * @param {string} summaryText
     *
     * @returns {string}
     */
    parseMarkdown (summaryText) {
      const rawHtml = marked(summaryText)
      return DOMPurify.sanitize(rawHtml)
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
    },

    updateGenerating (status) {
      this.isGenerating = status
    },

    /**
     * Update the summary feedback.
     * @param type
     *
     * @returns {void}
     */
    submitFeedback (type) {
      const feedbackValue = type === 'upvote' ? FeedbackConstants.FEEDBACK_UPVOTE : FeedbackConstants.FEEDBACK_DOWNVOTE

      talk2Api.V1.transcription.submitSummaryFeedback(this.communication.id, feedbackValue)
        .then(() => {
          this.feedback = feedbackValue
          this.upvoteActive = type === 'upvote'
          this.downvoteActive = type === 'downvote'
          this.$generalNotification('Feedback received. Thank you!')
        })
        .catch(err => {
          this.$generalNotification('Failed to submit feedback.', 'error')
          console.log('Error submitting summary feedback:', err)
        })
    }

  },

  watch: {
    communication (newVal) {
      if (newVal) {
        this.checkAndShowTranscriptionModal()
      }
    },

    feedback (newValue) {
      this.upvoteActive = newValue === FeedbackConstants.FEEDBACK_UPVOTE
      this.downvoteActive = newValue === FeedbackConstants.FEEDBACK_DOWNVOTE
    }
  }
}
</script>

<style scoped>
.pt-12 {
  padding-top: 12px;
}

.status-message {
  display: flex;
  align-items: center;
}

.status-message span {
  margin-left: 4px;
}

.clickable-icon {
  cursor: pointer;
}
</style>
