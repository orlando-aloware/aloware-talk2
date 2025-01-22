<template>
    <div class="ai-effect-container mt-2">
        <div class="ai-effect-gradient"></div>
        <div class="ai-effect-blur"></div>
        <div class="ai-effect-content p-4">
            <!-- Input Section -->
            <div class="chat-input-container mb-4">
                <div class="input-wrapper ai-effect-gradient-input">
                    <textarea
                        v-model="userQuestion"
                        :placeholder="placeholder"
                        @keydown.enter.exact.prevent="sendQuestion"
                        @input="autoResize"
                        @focus="onFocus"
                        @blur="onBlur"
                        ref="textarea"
                        rows="1"
                        :disabled="isAsking"
                    ></textarea>
                    <q-btn
                        v-if="userQuestion"
                        flat
                        dense
                        round
                        icon="close"
                        class="clear-button"
                        @click="clearQuestion"
                    />
                    <button
                        class="send-button"
                        :disabled="isAsking || !userQuestion.trim()"
                        @click="sendQuestion"
                    >
                        <i
                            class="material-icons"
                            v-if="!isAsking"
                        >send</i>
                        <q-spinner-dots
                            v-else
                            size="1em"
                        />
                    </button>
                </div>
                <div
                    v-if="showSuggestions"
                    class="suggestions-container"
                >
                    <div class="suggestions-title">Suggested questions</div>
                    <div class="suggestions-content">
                        <div
                            v-for="(question, index) in suggestedQuestions"
                            :key="index"
                            class="suggestion-item"
                            @click="selectSuggestion(question)"
                        >
                            {{ question }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Latest Answer Section -->
            <div
                v-if="latestMessages.length > 0 || isAsking"
                class="latest-answer mb-4"
            >
                <h4 class="answer-title">Answer by AloAi</h4>
                <div
                    v-if="isAsking"
                    class="loading-state"
                >
                    <q-spinner-dots
                        size="2em"
                        color="primary"
                    />
                    <span class="ml-2">Thinking...</span>
                </div>
                <template v-else>
                    <ul v-if="latestMessages.length > 1" class="answer-list">
                        <li
                            v-for="(message, index) in latestMessages"
                            :key="index"
                            class="answer-message"
                        >
                            <div class="answer-content" v-html="message.text"></div>
                            <div class="d-flex align-items-center gap-2 mt-2">
                                <q-btn
                                    v-if="message.hasTimestamp"
                                    outline
                                    rounded
                                    size="sm"
                                    color="primary"
                                    class="seek-button"
                                    @click="handleSeekAudio(message.start)"
                                >
                                    <q-icon
                                        name="play_circle"
                                        class="q-mr-xs"
                                        left
                                    />
                                    Play
                                </q-btn>
                                <q-btn
                                    flat
                                    dense
                                    round
                                    size="sm"
                                    icon="content_copy"
                                    @click="copyText(message.text)"
                                >
                                    <q-tooltip>Copy text</q-tooltip>
                                </q-btn>
                            </div>
                        </li>
                    </ul>
                    <div v-else class="answer-message">
                        <div class="answer-content" v-html="latestMessages[0].text"></div>
                        <div class="d-flex align-items-center gap-2 mt-2">
                            <q-btn
                                v-if="latestMessages[0].hasTimestamp"
                                outline
                                rounded
                                size="sm"
                                color="primary"
                                class="seek-button"
                                @click="handleSeekAudio(latestMessages[0].start)"
                            >
                                <q-icon
                                    name="play_circle"
                                    class="q-mr-xs"
                                    left
                                />
                                Play
                            </q-btn>
                            <q-btn
                                flat
                                dense
                                round
                                size="sm"
                                icon="content_copy"
                                @click="copyText(latestMessages[0].text)"
                            >
                                <q-tooltip>Copy text</q-tooltip>
                            </q-btn>
                        </div>
                    </div>
                </template>
            </div>

            <!-- Chat History Section -->
            <div v-if="chatMessages.length > 0">
                <div
                    class="chat-history-header"
                    @click="showHistory = !showHistory"
                >
                    <span>Chat History</span>
                    <q-icon
                        :name="showHistory ? 'expand_less' : 'expand_more'"
                        size="24px"
                    />
                </div>
                <div
                    v-show="showHistory"
                    class="chat-container"
                >
                    <q-chat-message
                        v-for="(message, index) in historicalMessages"
                        :key="index"
                        :sent="message.sent"
                        :name="message.name"
                        :bg-color="message.sent ? 'primary' : 'grey-3'"
                        :text-color="message.sent ? 'white' : 'black'"
                        :stamp="message.stamp"
                        size="12"
                    >
                        <div>
                            <div v-html="message.text"></div>
                            <div class="d-flex align-items-center gap-2 mt-2">
                                <q-btn
                                    v-if="message.hasTimestamp"
                                    outline
                                    rounded
                                    size="sm"
                                    color="primary"
                                    class="seek-button"
                                    @click="handleSeekAudio(message.start)"
                                >
                                    <q-icon
                                        name="play_circle"
                                        class="q-mr-xs"
                                        left
                                    />
                                    Play
                                </q-btn>
                            </div>
                        </div>
                        <template
                            v-if="message.isLoading"
                            v-slot:stamp
                        >
                            <q-spinner-dots size="2em" />
                        </template>
                        <template
                            v-else
                            v-slot:stamp
                        >
                            <div class="d-flex align-items-center gap-2">
                                <span>{{ message.stamp }}</span>
                                <q-btn
                                    flat
                                    dense
                                    round
                                    size="xs"
                                    icon="content_copy"
                                    @click.stop="copyText(message.text)"
                                >
                                    <q-tooltip>Copy text</q-tooltip>
                                </q-btn>
                            </div>
                        </template>
                    </q-chat-message>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import talk2Api from 'src/plugins/api/api'

export default {
  name: 'TranscriptionChat',

  props: {
    communication: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      userQuestion: '',
      chatMessages: [],
      isAsking: false,
      placeholder: 'Ask anything about this conversation...',
      showSuggestions: false,
      showHistory: false,
      suggestedQuestions: [
        'Is the customer trying to solve a specific problem?',
        'What are the customer\'s expectations?',
        'What questions did the customer ask?',
        'What did the customer say about the price of our offer?',
        'Please summarize all of the customer\'s objections and provide the answer in bullet form.',
        'When is the next scheduled meeting?',
        'Summarize and put in bullet form the business pain points brought up by the customer.',
        'Was specific pricing discussed?',
        'How could the sales team do better on this call?',
        'Please give me a summary of items that the customer preferred about our product over other products.',
        'Create a bulleted list of what the customer preferred about our product. Create a separate bulleted list of what they prefer about competitor\'s products. Make sure to include the names of any competitors that the customer mentioned.',
        'Based on what the customer said, recap the current and desired state of customer success. Format the recap in 4 bullets for each state.',
        'Generate a follow-up email thanking the customer for their time, and emphasizing next steps. Provide the next steps in bullet form.'
      ]
    }
  },

  computed: {
    latestMessages () {
      // Find the last user message index
      const lastUserIndex = [...this.chatMessages].reverse().findIndex(message => message.sent)
      if (lastUserIndex === -1) return []

      // Get all AI messages after the last user message and filter out empty/loading messages
      const messages = this.chatMessages.slice(-(lastUserIndex + 1))
        .filter(m => !m.sent && m.text && !m.isLoading)

      return messages
    },
    historicalMessages () {
      // Return all messages
      return this.chatMessages
    }
  },

  methods: {
    scrollToBottom () {
      const chatContainer = this.$el.querySelector('.chat-container')
      if (chatContainer) {
        setTimeout(() => {
          chatContainer.scrollTop = chatContainer.scrollHeight
        }, 100) // Small delay to ensure content is rendered
      }
    },

    handleSeekAudio (startTime) {
      this.$emit('seek-audio', startTime)
    },

    parseMarkdown (text) {
      const rawHtml = marked(text)
      return DOMPurify.sanitize(rawHtml)
    },

    sendQuestion () {
      if (!this.userQuestion.trim() || this.isAsking) return

      this.showSuggestions = false
      const question = this.userQuestion.trim()
      this.chatMessages.push({
        text: question,
        sent: true,
        name: 'You',
        stamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })

      this.scrollToBottom()
      this.isAsking = true

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
          this.$q.notify({
            message: 'Failed to get answer',
            color: 'negative',
            position: 'top',
            timeout: 2000
          })
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

    onFocus () {
      this.showSuggestions = true
    },

    onBlur () {
      // Small delay to allow clicking on suggestions
      setTimeout(() => {
        this.showSuggestions = false
      }, 200)
    },

    selectSuggestion (question) {
      this.userQuestion = question
      this.showSuggestions = false
      this.$refs.textarea.focus()
      // Add a small delay to ensure the value is updated
      this.$nextTick(() => {
        this.autoResize()
      })
    },

    clearQuestion () {
      this.userQuestion = ''
      this.$refs.textarea.style.height = '40px'
      this.$refs.textarea.focus()
    },

    copyText (text) {
      // Remove HTML tags from the text
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = text
      const plainText = tempDiv.textContent || tempDiv.innerText

      navigator.clipboard.writeText(plainText).then(() => {
        this.$q.notify({
          message: 'Text copied to clipboard',
          color: 'positive',
          position: 'top',
          timeout: 2000
        })
      }).catch(err => {
        console.error('Failed to copy text:', err)
        this.$q.notify({
          message: 'Failed to copy text',
          color: 'negative',
          position: 'top',
          timeout: 2000
        })
      })
    }
  },

  mounted () {
    // Listen for seek-audio events from the dynamically created buttons
    document.addEventListener('seek-audio', (e) => {
      this.handleSeekAudio(e.detail)
    })
  },

  beforeDestroy () {
    // Clean up the event listener
    document.removeEventListener('seek-audio', this.handleSeekAudio)
  }
}
</script>

<style scoped>
.ai-effect-container {
  min-height: 600px;
  display: flex;
  flex-direction: column;
}

.ai-effect-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 1rem;
  scroll-behavior: smooth;
  margin-top: 1px;
  min-height: 400px;
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
  background: transparent;
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

.suggestions-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-top: 8px;
  z-index: 1000;
  max-height: 300px;
  overflow: hidden;
}

.suggestions-title {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  padding: 16px 16px 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: sticky;
  top: 0;
  background: inherit;
  backdrop-filter: blur(10px);
  margin: 0;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.suggestions-content {
  padding: 0 16px 16px;
  max-height: 232px; /* 300px - title height - paddings */
  overflow-y: auto;
}

/* Add custom scrollbar styling */
.suggestions-content::-webkit-scrollbar {
  width: 8px;
}

.suggestions-content::-webkit-scrollbar-track {
  background: transparent;
}

.suggestions-content::-webkit-scrollbar-thumb {
  background-color: rgba(147, 51, 234, 0.2);
  border-radius: 4px;
}

.suggestions-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(147, 51, 234, 0.4);
}

.suggestion-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
  font-size: 14px;
  border-radius: 8px;
}

.suggestion-item:hover {
  background-color: rgba(147, 51, 234, 0.1);
  color: #9333EA;
}

.chat-history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgba(147, 51, 234, 0.05);
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s ease;
}

.chat-history-header:hover {
  background: rgba(147, 51, 234, 0.1);
}

.latest-answer {
  border-radius: 8px;
}

.chat-container {
  max-height: 300px;
  overflow-y: auto;
  transition: max-height 0.3s ease;
}

.answer-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.answer-content {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

.answer-content :deep(ul) {
  list-style-type: disc;
  padding-left: 24px;
  margin: 12px 0;
}

.answer-content :deep(li) {
  margin-bottom: 12px;
}

.answer-message {
  margin-bottom: 16px;
}

.answer-message:last-child {
  margin-bottom: 0;
}

.answer-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.answer-list li {
  position: relative;
  padding-left: 20px;
}

.answer-list li:before {
  content: "•";
  position: absolute;
  left: 0;
  color: #9333EA;
}

.clear-button {
  margin-right: 4px;
  opacity: 0.6;
}

.clear-button:hover {
  opacity: 1;
}
</style>
