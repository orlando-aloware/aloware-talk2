<template>
  <div data-testid="transcription-modal-wrapper">
    <span
      v-if="noButton"
      @click="fetchSmartTranscriptionData"
    >
      {{ buttonText }}
    </span>

    <q-btn
      icon="chat"
      color="primary"
      flat
      round
      dense
      :size="buttonSize"
      data-testid="comm-transcription-modal-single-btn"
      v-else
      @click="fetchSmartTranscriptionData"
    >
      <q-tooltip>
        <span>
          {{ buttonText }}
        </span>
      </q-tooltip>
    </q-btn>

    <!-- AloAi Voice Analytics modal. -->
    <q-dialog
      v-model="show_form"
      data-testid="comm-transcription-modal-dialog"
    >
      <q-card class="transcription w-100 max-w-85">
        <q-card-section class="row items-center no-wrap px-4">
          <!--COMM TYPE-->
          <q-card-section
            class="comm-type-container"
            data-testid="comm-details-comm-type-card-section"
          >
            <div
              class="text-h6 d-inline-flex align-items-center"
              :class="[!communication.duration ? 'flex-grow-1 text-left' : '']"
            >
              <component
                :is="stateToIcon(communication.disposition_status2, communication.type, communication.direction, communication.callback_status)"
                v-if="communication.disposition_status2"
              >
              </component>
              <div class="comm-type-wrapper pl-3">
                <span
                  v-if="![CommunicationTypes.NOTE, CommunicationTypes.SYSNOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type)"
                >
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
          <q-btn
            icon="close"
            flat
            round
            data-testid="comm-transcription-modal-close-dialog-btn"
            @click="handleClose"
          >
          </q-btn>
        </q-card-section>

        <q-card-section class="q-pt-none px-4">
          <div
            class="mx-3 py-2"
            v-if="remoteUrl && !isLoading"
          >
            <div class="d-flex flex-row align-items-center">
              <waveform
                :remote-url="remoteUrl"
                :unique-id="communication.id"
                :height="40"
                :split-channels="splitChannels"
                :communication="communication"
                :messages="messages"
                data-testid="comm-transcription-modal-waveform"
                ref="waveformComponent"
                @time-update="updateCurrentTime"
              >
              </waveform>
              <download-button
                v-if="fileUuid"
                data-testid="communication-audio-download-button"
                is-simple
                :communication-id="communication.id"
                :filename="filename"
                :file-mime-type="mimeType"
                :file-uuid="fileUuid"
              />
            </div>
            <div class="d-flex flex-row align-items-center mt-2">
              <talk-time-analysis-section
                :communication="communication"
                :contact="contact"
                :talk_time_analysis="talk_time_analysis"
                :speakers="speakers"
                :is-empty="isEmpty"
                data-testid="comm-transcription-modal-talk-time-analysis-section"
              />

              <sentiment-analysis-section
                :sentiment_analysis="sentiment_analysis"
                :sentiment-chip-colors="sentimentChipColors"
                :is-empty="isEmpty"
                :calculate-over-all-sentiment-by-speaker="calculateOverAllSentimentBySpeaker"
                class="ml-2"
                data-testid="comm-transcription-modal-sentiment-analysis-section"
              />
            </div>
          </div>

          <div
            class="row py-4"
            v-if="!isLoading"
          >
            <div
              id="reference-column"
              class="col-6 pt-10"
            >
              <categories-section
                :categories="iab_categories"
                :is-empty="isEmpty"
                data-testid="comm-transcription-modal-category-section"
              />

              <highlights-section
                :highlights="highlights"
                :speakers="speakers"
                :is-empty="isEmpty"
                data-testid="comm-transcription-modal-highlights-section"
              />

              <entities-section
                :entities="entities"
                :entity-types="entity_types"
                :speakers="speakers"
                :is-empty="isEmpty"
                data-testid="comm-transcription-modal-entities-section"
              />

              <custom-keywords-section
                :custom-keywords="custom_keywords"
                :speakers="speakers"
                :is-empty="isEmpty"
                data-testid="comm-transcription-modal-custom-keywords-section"
              />
            </div>

            <div class="col-6">
              <q-tabs
                v-model="tabName"
                no-caps
                inline-label
                dense
                :mobile-arrows="false"
                align="left"
                class="bg-white text-black border-bottom"
                content-class="flex-nowrap"
              >
                <q-tab
                  name="summary"
                  label="Summary"
                  :disable="!currentCompany?.transcription_settings?.summarization_enabled"
                />
                <q-tab
                  name="transcription"
                  label="Transcription"
                />
                <q-tab name="ask_aloai">
                  <template v-slot:default>
                    <div class="flex items-center">
                      <span class="ai-effect-gradient-text font-weight-bold">
                        <sparkle-icon
                          width="16"
                          height="16"
                          color="#9333EA"
                          class="mr-1"
                        />
                        Ask AloAi
                      </span>
                    </div>
                  </template>
                </q-tab>
              </q-tabs>
              <q-tab-panels v-model="tabName">
                <q-tab-panel
                  class="p-0"
                  name="summary"
                >
                  <section
                    class="transcription chat-area"
                    id="summary"
                    data-testid="comm-summary-section"
                    ref="summaryArea"
                  >
                    <div
                      v-if="communication.call_summary"
                      style="display: flex; justify-content: flex-end; gap: 4px; margin-top: -8px;"
                    >
                      <!-- Hide edit summary button for now [PLA-424] -->
                      <!-- <q-btn
                        color="text-dark-greenish"
                        class="btn btn-inline px-1 py-0"
                        title="Edit Summary"
                        flat
                        rounded
                        dense
                        no-caps
                        data-testid="update-summary-btn"
                        @click="startEditing"
                      >
                        <pencil-o-icon
                          width="20"
                          height="20"
                          data-testid="contact-phones-list-items-edit-icon"
                          color="#007bff">
                        </pencil-o-icon>
                      </q-btn> -->
                      <q-btn
                        color="text-dark-greenish"
                        class="btn btn-inline px-1 py-0"
                        title="Download Summary"
                        flat
                        rounded
                        dense
                        no-caps
                        data-testid="download-button-download-btn"
                        @click="onDownload()"
                      >
                        <download-icon
                          height="20"
                          width="20"
                          data-testid="download-button-download-icon"
                        >
                        </download-icon>
                      </q-btn>
                      <q-btn
                        color="text-dark-greenish"
                        class="btn btn-inline px-1 py-0"
                        title="Copy Summary"
                        v-if="!isWidget"
                        flat
                        rounded
                        dense
                        no-caps
                        data-testid="copy-button-copy-btn"
                        @click="onCopy()"
                      >
                        <copy-icon
                          height="20"
                          width="20"
                          color="#007bff"
                          data-testid="copy-button-copy-icon"
                        >
                        </copy-icon>
                      </q-btn>
                      <q-btn
                        color="text-dark-greenish"
                        class="btn btn-inline px-1 py-0"
                        title="Regenerate Summary"
                        flat
                        rounded
                        dense
                        no-caps
                        :loading="isRegenerating"
                        data-testid="regenerate-summary-btn"
                        @click="onRegenerateSummary"
                      >
                        <sparkle-icon
                          height="20"
                          width="20"
                          color="#007bff"
                          data-testid="regenerate-summary-icon"
                        >
                        </sparkle-icon>
                      </q-btn>
                    </div>
                    <div class="ai-effect-container mt-2">
                      <div class="ai-effect-gradient"></div>
                      <div class="ai-effect-blur"></div>
                      <div class="ai-effect-content p-2">
                        <div
                          class="flex items-center justify-between"
                          :class="[ communication.call_summary ? 'mb-2' : '']"
                        >
                          <div class="flex items-center gap-2">
                            <h3
                              class="ai-effect-gradient-text"
                              @click="handlePromotionClick"
                            >
                              <sparkle-icon
                                width="16"
                                height="16"
                                color="#9333EA"
                              />
                              Powered by AloAi
                              <template
                                v-if="currentCompany?.plan?.included_transcription_min > 0 && currentCompany?.transcription_settings?.is_trial"
                              >
                                (free {{ currentCompany.plan.included_transcription_min / 1000 }}K trial)
                              </template>
                            </h3>
                          </div>
                          <div class="transcription-summary-container">
                            <span
                              class="transcription-message text-decoration-none"
                              v-if="currentCompany?.transcription_settings?.summarization_enabled && communication.call_transcription_status === TranscriptionStatus.STATUS_PARSED"
                            >
                              <span
                                v-if="communication.call_summary_status === SummaryStatus.STATUS_QUEUED">Summarization
                                pending</span>
                              <span
                                v-else-if="communication.call_summary_status === SummaryStatus.STATUS_PROCESSING">Summarization
                                in progress</span>
                            </span>
                          </div>
                        </div>
                        <div
                          class="text-left-align"
                          v-if="communication.call_summary"
                        >
                          <div
                            v-if="communication.call_summary"
                            class="call_summary"
                          >
                            <div v-if="!is_editing_summary" class="call_summary"
                                 v-html="parseMarkdown(communication.call_summary)"/>

                            <div v-else class="edit-mode">
                              <div class="toolbar">
                                <q-btn
                                  flat
                                  dense
                                  round
                                  icon="format_bold"
                                  title="Bold"
                                  color="primary"
                                  @click="applyFormatting(TEXT_FORMATTING.TEXT.BOLD)"
                                />
                                <q-btn
                                  flat
                                  dense
                                  round
                                  icon="format_italic"
                                  title="Italic"
                                  color="primary"
                                  @click="applyFormatting(TEXT_FORMATTING.TEXT.ITALIC)"
                                />
                                <q-btn
                                  flat
                                  dense
                                  round
                                  icon="format_underline"
                                  title="Underline"
                                  color="primary"
                                  @click="applyFormatting(TEXT_FORMATTING.TEXT.UNDERLINE)"
                                />
                                <q-btn
                                  flat
                                  dense
                                  round
                                  icon="format_list_bulleted"
                                  title="Bullet List"
                                  color="primary"
                                  @click="applyList(TEXT_FORMATTING.LIST.BULLET)"
                                />
                                <q-btn
                                  flat
                                  dense
                                  round
                                  icon="format_list_numbered"
                                  title="Numbered List"
                                  color="primary"
                                  @click="applyList(TEXT_FORMATTING.LIST.NUMBERED)"
                                />
                                <q-btn
                                  flat
                                  dense
                                  round
                                  icon="code"
                                  title="Code Block"
                                  color="primary"
                                  @click="applyBlockFormatting(TEXT_FORMATTING.BLOCK.CODE)"
                                />
                              </div>
                              <textarea
                                ref="textarea"
                                class="markdown-editor"
                                placeholder="Edit the summary here..."
                                rows="10"
                                v-model="edited_call_summary"
                              ></textarea>
                              <div class="row justify-end q-gutter-sm mt-2">
                                <q-btn
                                  flat
                                  label="Cancel"
                                  color="grey-7"
                                  @click="cancelEditing"
                                  data-testid="cancel-editing-btn"
                                />
                                <q-btn
                                  unelevated
                                  label="Save Changes"
                                  color="primary"
                                  :loading="is_saving_summary"
                                  @click="saveSummary"
                                  data-testid="save-summary-btn"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="summary-status-container">
                          <div v-if="!communication.call_summary_status">
                            <generate-summary-button
                              class="mr-2"
                              data-testid="comm-details-generate-summary-button"
                              :is-generating="isGenerating"
                              :communication="communication"
                              v-if="fileUuid && isMigrated"
                              @updateGenerating="updateGenerating"
                            >
                            </generate-summary-button>
                          </div>
                          <div
                            v-else-if="communication.call_summary_status === SummaryStatus.STATUS_FAILED"
                            class="status-message"
                          >
                            <q-icon
                              name="error"
                              color="red"
                              size="md"
                            />
                            <div>Summary generation failed. Please try again later. </div>
                            <br>
                            <generate-summary-button
                              class="mr-2"
                              data-testid="comm-details-generate-summary-button"
                              :is-generating="isGenerating"
                              :communication="communication"
                              v-if="fileUuid && isMigrated"
                              @updateGenerating="updateGenerating"
                            >
                            </generate-summary-button>
                          </div>
                          <div
                            v-else-if="communication.call_summary_status === SummaryStatus.STATUS_PROCESSING || communication.call_summary_status === SummaryStatus.STATUS_QUEUED"
                            class="status-message"
                          >
                            <q-icon
                              name="hourglass_empty"
                              color="blue"
                              size="md"
                            />
                            <span>Your summary is being processed. Please wait...</span>
                          </div>
                        </div>
                        <div
                          v-if="communication.call_summary || communication.call_summary_status === SummaryStatus.STATUS_COMPLETED"
                          class="summary-feedback-section mt-2 d-flex justify-end align-items-center"
                        >
                          <span class="evaluation-text pr-2">Please evaluate the accuracy of this summary.</span>
                          <img
                            class="clickable-icon"
                            :src="upvote_active ? 'app-icons/menu/thumb-up-green.svg' : 'app-icons/menu/thumb-up-outline.svg'"
                            @click="submitFeedback('upvote')"
                          />
                          <span class="mx-1"></span>
                          <img
                            class="clickable-icon"
                            :src="downvote_active ? 'app-icons/menu/thumb-down-red.svg' : 'app-icons/menu/thumb-down-outline.svg'"
                            @click="submitFeedback('downvote')"
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                </q-tab-panel>

                <q-tab-panel
                  class="p-0"
                  name="transcription"
                >
                  <conversation-section
                    :communication="communication"
                    :contact="contact"
                    :messages="messages"
                    :formatted-messages="formattedMessages"
                    :is-empty="isEmpty"
                    ref="conversationSection"
                    data-testid="comm-transcription-modal-conversation-section"
                    @seek-audio="handleSeekAudio"
                  >
                  </conversation-section>
                </q-tab-panel>

                <q-tab-panel
                  class="p-0"
                  name="ask_aloai"
                >
                  <transcription-chat
                    :communication="communication"
                    @seek-audio="handleSeekAudio"
                  />
                </q-tab-panel>
              </q-tab-panels>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <aloai-promotion-dialog
      :dialogVisible="show_promotion_box"
      @update:dialogVisible="show_promotion_box = $event"
    />
  </div>
</template>

<script>
import AloaiPromotionDialog from 'components/aloai-voice-analytics/aloai-promotion-dialog.vue'
import DownloadButton from 'components/download-button.vue'
import GenerateSummaryButton from 'components/generate-summary-button'
import SparkleIcon from 'components/icons/ai/sparkle-bold-icon.vue'
import DownloadIcon from 'components/icons/contact-activity/download-icon'
import CopyIcon from 'components/icons/copy-icon'
import PencilOIcon from 'components/icons/pencil-o-icon'
import Waveform from 'components/waveform'
import DOMPurify from 'dompurify'
import { isEmpty } from 'lodash'
import { marked } from 'marked'
import * as CommunicationDirection from 'src/constants/communication-direction'
import * as CommunicationTypes from 'src/constants/communication-types'
import * as FeedbackConstants from 'src/constants/feedback-types'
import * as SummaryStatus from 'src/constants/summary-status'
import * as TranscriptionStatus from 'src/constants/transcription-status'
import * as UploadedFileTypes from 'src/constants/uploaded-file-types'
import talk2Api from 'src/plugins/api/api'
import { communicationInfoMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'
import CategoriesSection from './transcription-components/categories-section'
import ConversationSection from './transcription-components/conversation-section'
import CustomKeywordsSection from './transcription-components/custom-keywords-section'
import EntitiesSection from './transcription-components/entities-section'
import HighlightsSection from './transcription-components/highlights-section'
import SentimentAnalysisSection from './transcription-components/sentiment-analysis-section'
import TalkTimeAnalysisSection from './transcription-components/talk-time-analysis-section'
import TranscriptionChat from './transcription-components/transcription-chat.vue'

// Text Formatting constants
const TEXT_FORMATTING = {
  TEXT: {
    BOLD: '**',
    ITALIC: '*',
    UNDERLINE: '__'
  },
  LIST: {
    BULLET: '- ',
    NUMBERED: '1. '
  },
  BLOCK: {
    CODE: '```'
  }
}

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
    PencilOIcon,
    GenerateSummaryButton,
    SparkleIcon,
    AloaiPromotionDialog,
    TranscriptionChat
  },

  props: {
    communication: {
      type: Object,
      required: true
    },
    contact: {
      type: Object,
      required: false
    },
    type: {
      required: true
    },
    buttonText: {
      type: String,
      default: 'Show Transcription'
    },
    buttonSize: {
      type: String,
      default: 'sm'
    },
    noButton: {
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
      downloadUrl: null,
      fileUuid: null,
      filename: '',
      mimeType: '',
      isMigrated: false,
      speakers: [],
      iab_categories: [],
      highlights: [],
      entities: [],
      entity_types: [],
      custom_keywords: [],
      sentiment_analysis: [],
      talk_time_analysis: [],
      messages: [],
      summary_engine: null,
      summary_prompt: null,
      feedback: null,
      upvote_active: false,
      downvote_active: false,
      isRegenerating: false,
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
      isGenerating: false,
      show_promotion_box: false,
      TranscriptionStatus,
      SummaryStatus,
      CommunicationTypes,
      is_editing_summary: false,
      is_saving_summary: false,
      edited_call_summary: '',
      TEXT_FORMATTING
    }
  },

  computed: {
    ...mapState(['isWidget']),
    ...mapState('cache', ['currentCompany']),

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
          type: this.type
        }
      }

      window.axios.get(`/api/v1/communication/${this.communication.id}/file-url`, options)
        .then(res => {
          this.fileUuid = this.getUuidFromURL(res.data.download_url)
          this.filename = this.getFilenameFromURL(res.data.download_url)
          this.remoteUrl = res.data.url
          this.downloadUrl = res.data.download_url
          this.mimeType = res.data.mimetype || ''
          this.isMigrated = res.data.is_migrated
        }).catch(err => {
          console.log('Couldn\'t fetch call recording.', err)
        })
    },

    /**
     * Sets AloAi Voice Analytics panel data.
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
      this.summary_prompt = data.summary_prompt
      this.feedback = data.feedback
      this.upvote_active = this.feedback === FeedbackConstants.FEEDBACK_UPVOTE
      this.downvote_active = this.feedback === FeedbackConstants.FEEDBACK_DOWNVOTE
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
      if (this.currentCompany?.transcription_settings?.summarization_enabled) {
        this.tabName = 'summary'
      }

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
      if (!this.communication.call_summary) return

      // Create a Blob with the custom summary content
      const blob = new Blob([this.communication.call_summary], { type: 'text/plain' })
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
      if (!this.communication.call_summary) return

      navigator.clipboard.writeText(this.communication.call_summary)
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
      // Sanitize after markdown parsing
      const rawHtml = DOMPurify.sanitize(marked(summaryText))
      return rawHtml
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
          this.upvote_active = type === 'upvote'
          this.downvote_active = type === 'downvote'
          this.$generalNotification('Feedback received. Thank you!')
        })
        .catch(err => {
          this.$generalNotification('Failed to submit feedback.', 'error')
          console.log('Error submitting summary feedback:', err)
        })
    },

    handleSeekAudio (startTime) {
      this.$refs.waveformComponent.seekAudio(startTime)
      this.$refs.waveformComponent.play()
    },

    scrollToBottom () {
      const chatContainer = this.$el.querySelector('.chat-container')
      if (chatContainer) {
        setTimeout(() => {
          chatContainer.scrollTop = chatContainer.scrollHeight
        }, 100) // Small delay to ensure content is rendered
      }
    },

    sendQuestion () {
      if (!this.userQuestion.trim() || this.isAsking) return

      const question = this.userQuestion.trim()
      this.chatMessages.push({
        text: question,
        sent: true,
        name: 'You',
        stamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })

      this.scrollToBottom()
      this.userQuestion = ''
      this.isAsking = true

      // Reset textarea height
      if (this.$refs.textarea) {
        this.$refs.textarea.style.height = '40px'
      }

      // Add loading message
      const loadingMessageIndex = this.chatMessages.length
      this.chatMessages.push({
        text: '',
        sent: false,
        name: 'AloAi',
        isLoading: true
      })

      // Make API call to get answer
      talk2Api.V2.communication.askQuestion(this.communication.id, {
        params: {
          question
        }
      })
        .then(response => {
          let messages = []
          const { response: data } = response.data

          if (Array.isArray(data)) {
            // Handle array of answers with timestamps
            messages = data.map(item => ({
              text: this.parseMarkdown(item.answer),
              sent: false,
              name: 'AloAi',
              stamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              hasTimestamp: !!(item.start && item.end),
              start: item.start,
              end: item.end
            }))
          } else if (typeof data === 'object') {
            // Handle single answer with optional timestamps
            messages = [{
              text: this.parseMarkdown(data.answer),
              sent: false,
              name: 'AloAi',
              stamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              hasTimestamp: !!(data.start && data.end),
              start: data.start,
              end: data.end
            }]
          } else {
            // Handle string response (no timestamps)
            messages = [{
              text: this.parseMarkdown(data),
              sent: false,
              name: 'AloAi',
              stamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              hasTimestamp: false
            }]
          }

          // Replace loading message with actual response(s)
          this.chatMessages.splice(loadingMessageIndex, 1, ...messages)
          this.scrollToBottom()
        })
        .catch(error => {
          // Remove loading message on error
          this.chatMessages.splice(loadingMessageIndex, 1)
          console.error('Failed to get answer:', error)
          this.$generalNotification('Failed to get answer', 'error')
        })
        .finally(() => {
          this.isAsking = false
        })
    },

    autoResize () {
      const textarea = this.$refs.textarea
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'
      }
    },

    onRegenerateSummary () {
      if (this.isRegenerating) return

      this.isRegenerating = true
      this.$generalNotification('Regenerating summary...')

      talk2Api.V1.transcription.generateSummary(this.communication.id)
        .catch(err => {
          console.error('Failed to regenerate summary:', err)
          this.$generalNotification('Failed to regenerate summary', 'error')
        })
        .finally(() => {
          this.isRegenerating = false
        })
    },

    startEditing () {
      this.edited_call_summary = this.communication.call_summary
      this.is_editing_summary = true
    },

    cancelEditing () {
      this.is_editing_summary = false
      this.edited_call_summary = ''
    },

    // Apply inline formatting like bold, italic, underline
    applyFormatting (format) {
      const textarea = this.$refs.textarea
      if (!textarea) return

      const { selectionStart, selectionEnd, value } = textarea
      const selectedText = value.slice(selectionStart, selectionEnd)

      const formattedText = format === TEXT_FORMATTING.TEXT.UNDERLINE
        ? `<u>${selectedText}</u>`
        : `${format}${selectedText}${format}`

      this.edited_call_summary =
        value.slice(0, selectionStart) +
        formattedText +
        value.slice(selectionEnd)

      this.$nextTick(() => {
        textarea.focus()
        textarea.setSelectionRange(
          selectionStart + format.length,
          selectionEnd + format.length
        )
      })
    },

    // Apply list formatting (bullet or numbered)
    applyList (prefix) {
      const textarea = this.$refs.textarea
      if (!textarea) return

      const { selectionStart, selectionEnd, value } = textarea

      const selectedText = value.slice(selectionStart, selectionEnd)
      const lines = selectedText.split('\n')

      // Check if all lines are already prefixed
      const allPrefixed = lines.every((line) => line.startsWith(prefix))

      const toggledLines = lines.map((line) =>
        allPrefixed ? line.slice(prefix.length) : `${prefix}${line}`
      )

      // Update the summary with the modified text
      this.edited_call_summary =
        value.slice(0, selectionStart) +
        toggledLines.join('\n') +
        value.slice(selectionEnd)

      this.$nextTick(() => {
        textarea.focus()
        textarea.setSelectionRange(
          selectionStart,
          selectionEnd + (allPrefixed ? -prefix.length * lines.length : prefix.length * lines.length)
        )
      })
    },

    // Apply block formatting like code blocks
    applyBlockFormatting (blockFormat) {
      const textarea = this.$refs.textarea
      const { selectionStart, selectionEnd, value } = textarea
      const selectedText = value.slice(selectionStart, selectionEnd)

      const formattedText = `\n${blockFormat}\n${selectedText}\n${blockFormat}\n`
      this.edited_call_summary =
        value.slice(0, selectionStart) +
        formattedText +
        value.slice(selectionEnd)

      this.$nextTick(() => {
        textarea.focus()
        textarea.setSelectionRange(
          selectionStart + blockFormat.length + 2,
          selectionEnd + blockFormat.length + 2
        )
      })
    },

    saveSummary () {
      if (this.is_saving_summary) return
      this.is_saving_summary = true

      // Sanitize the edited summary before saving
      const sanitizedSummary = DOMPurify.sanitize(this.edited_call_summary)

      talk2Api.V1.transcription
        .updateSummary(this.communication.id, sanitizedSummary) // Save sanitized content
        .then((response) => {
          this.communication.call_summary = DOMPurify.sanitize(response.data.summary) // Update the summary with sanitized content
          this.is_editing_summary = false
          this.$generalNotification('Summary updated successfully!')
        })
        .catch((err) => {
          console.error('Failed to update summary:', err)
          this.$generalNotification('Failed to update summary!', 'error')
        })
        .finally(() => {
          this.is_saving_summary = false // Reset save state
        })
    },

    handlePromotionClick () {
      if (this.currentCompany?.transcription_settings?.call_transcription_enabled) {
        this.show_promotion_box = true
      }
    }
  },

  watch: {
    communication (newVal) {
      if (newVal) {
        this.checkAndShowTranscriptionModal()
      }
    },

    feedback (newValue) {
      this.upvote_active = newValue === FeedbackConstants.FEEDBACK_UPVOTE
      this.downvote_active = newValue === FeedbackConstants.FEEDBACK_DOWNVOTE
    },

    show_form (newVal) {
      if (newVal) {
        this.checkAndShowTranscriptionModal()
      }
    }
  }
}
</script>

<style scoped>
.pt-10 {
  padding-top: 10px;
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

.chat-container {
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 1rem;
  scroll-behavior: smooth;
  margin-top: 1px;
  max-height: 400px;
}

.chat-input-container {
  background: rgba(255, 255, 255, 0.95);
  position: relative;
  z-index: 2000;
  backdrop-filter: blur(10px);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 8px;
  transition: all 0.3s ease;
  padding: 4px 8px;
  border: 1px solid rgba(147, 51, 234, 0.2);
}

.input-wrapper:hover {
  border-color: rgba(147, 51, 234, 0.4);
}

.input-wrapper:focus-within {
  border-color: rgba(147, 51, 234, 0.6);
  box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.1);
}

textarea {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px;
  font-size: 14px;
  color: #000;
  outline: none;
  resize: none;
  max-height: 150px;
  min-height: 40px;
  line-height: 1.5;
  overflow-y: auto;
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #9333EA;
  opacity: 0.8;
  transition: all 0.3s ease;
  border-radius: 50%;
  margin: 0;
}

.send-button:hover {
  opacity: 1;
  transform: scale(1.05);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

textarea::placeholder {
  color: rgba(0, 0, 0, 0.5);
  opacity: 1;
}

.seek-button {
  display: block;
}

:deep(.q-btn__wrapper) {
  padding-left: 15px;
  padding-right: 15px;
}

:deep(.q-message-text) {
  width: 100%;
}

:deep(.q-message-text > div) {
  margin-bottom: 0;
}

.markdown-editor {
  width: 100%;
  min-height: 200px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid #ccc;
  border-radius: 8px;
  resize: vertical;
  font-family: 'Arial', sans-serif;
}

.toolbar {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
  justify-content: flex-end;
}

</style>
