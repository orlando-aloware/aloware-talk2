<template>
  <div class="w-100">
    <b-card
      class="ai-effect-container w-100"
      no-body
    >
      <div class="ai-effect-gradient"></div>
      <div class="ai-effect-blur"></div>
      <b-card-body class="ai-effect-content">
        <div class="w-100">
          <h4
            class="ai-effect-gradient-text"
            @click="onExpanded"
          >
            <sparkle-icon
              width="16"
              height="16"
              color="#9333EA"
            />
            AloAi Conversation Insights
          </h4>
        </div>
        <div :class="`information-container mt-3 mb-4 ${autoHeightClass}`">
          <div
            class="card-text"
            v-if="insightsLoaded"
          >
            <!-- Introduction -->
            <section
              class="summary-section"
              v-if="insights?.summary?.introduction"
            >
              <h3 class="section-title">Introduction</h3>
              <p
                class="section-content"
                v-html="parseMarkdown(insights.summary.introduction)"
              >
              </p>
            </section>

            <!-- Key Topics -->
            <section
              class="summary-section"
              v-if="insights?.summary?.key_topics?.length > 0"
            >
              <h3 class="section-title">Key Topics</h3>
              <ul class="topics-list">
                <li
                  v-for="(topic, index) in insights.summary.key_topics"
                  :key="index"
                  v-html="parseMarkdown(topic)"
                >
                </li>
              </ul>
            </section>

            <!-- Outcome -->
            <section
              class="summary-section"
              v-if="insights?.summary?.outcome"
            >
              <h3 class="section-title">Outcome</h3>
              <p
                class="section-content"
                v-html="parseMarkdown(insights.summary.outcome)"
              >
              </p>
            </section>

            <!-- Follow-up Actions -->
            <section
              class="summary-section"
              v-if="insights?.summary?.follow_up_actions?.agents?.length > 0 || insights?.summary?.follow_up_actions?.contact?.length > 0"
            >
              <h3 class="section-title">Follow-up Actions</h3>
              <div
                class="follow-up-column"
                v-if="insights?.summary?.follow_up_actions?.agents?.length > 0"
              >
                <h4 class="column-title">Agents</h4>
                <ul class="action-list">
                  <li
                    v-for="(action, index) in insights.summary.follow_up_actions.agents"
                    :key="index"
                  >
                    <strong>{{ action.name }}:</strong>
                    <div
                      class="no-p-margin"
                      v-html="parseMarkdown(action.action)"
                    ></div>
                  </li>
                </ul>
              </div>
              <div
                class="follow-up-column"
                v-if="insights?.summary?.follow_up_actions?.contact?.length > 0"
              >
                <h4 class="column-title">Contact</h4>
                <ul class="action-list">
                  <li
                    v-for="(action, index) in insights.summary.follow_up_actions.contact"
                    :key="index"
                  >
                    <strong>{{ action.name }}:</strong>
                    <div
                      class="no-p-margin"
                      v-html="parseMarkdown(action.action)"
                    ></div>
                  </li>
                </ul>
              </div>
            </section>

            <!-- Coaching Opportunities -->
            <section
              class="summary-section"
              v-if="insights?.summary?.coaching_opportunities?.length > 0"
            >
              <h3 class="section-title">Coaching Opportunities</h3>
              <ul class="topics-list">
                <li
                  v-for="(opportunity, index) in insights.summary.coaching_opportunities"
                  :key="index"
                >
                  <template v-if="opportunity.agent && opportunity.opportunity">
                    <strong>{{ opportunity.agent }}:</strong>
                    <div
                      class="no-p-margin"
                      v-html="parseMarkdown(opportunity.opportunity)"
                    ></div>
                  </template>
                </li>
              </ul>
            </section>

            <!-- Footer -->

            <!-- Action buttons container -->
            <div class="d-flex gap-2 mb-2">
              <b-button
                class="flex-grow-1"
                size="sm"
                variant="light"
                tabindex="0"
                @click="copyToClipboard"
              >
                📋 Copy
              </b-button>

              <b-button
                class="flex-grow-1"
                size="sm"
                variant="dark"
                tabindex="0"
                :disabled="isAddingNote || isReadOnly"
                @click="createNote"
              >
                <q-spinner-bars
                  v-if="isAddingNote"
                  color="white"
                >
                </q-spinner-bars>
                {{ isAddingNote ? 'Adding Note...' : '📝 Add Note' }}
              </b-button>
            </div>

            <!-- Add this before the Regenerate Insights button, around line 115 -->
            <b-button
              class="text-white mb-2"
              size="sm"
              variant="primary"
              tabindex="0"
              block
              @click="showQuestionDrawer = true"
            >
              <sparkle-icon
                width="16"
                height="16"
                color="#ffffff"
                class="mr-1"
              />
              Ask AloAi
            </b-button>

            <!-- Regenerate Insights -->
            <b-button
              size="sm"
              variant="warning"
              tabindex="0"
              block
              :disabled="isGenerating || isReadOnly"
              @click="handleRegenerate"
            >
              {{ !isGenerating ? '🧙‍♂️️🪄 Regenerate Insights' : '' }}
              <q-spinner-bars
                v-if="isGenerating"
                color="white"
              >
              </q-spinner-bars>
            </b-button>

            <div
              class="timestamp"
              v-if="insights?.updated_at"
            >
              Last updated: {{ insights.updated_at | fixDateTime }}
            </div>
          </div>
          <div
            class="text-center"
            v-else
          >
            <q-spinner-bars
              color="primary"
              size="2em"
            />
          </div>
        </div>

        <b-button
          class="expand-toggle"
          variant="light"
          size="sm"
          v-if="insightsLoaded"
          pill
          @click="onExpanded"
        >
          <i class="material-icons icon">{{ isExpanded ? 'expand_less' : 'expand_more' }}</i>
        </b-button>
      </b-card-body>
    </b-card>

    <div
      class="custom-drawer"
      :class="{ 'is-open': showQuestionDrawer }"
      :style="{
        top: drawerTopPosition,
        height: `calc(100vh - ${drawerTopPosition})`
      }"
    >
      <div class="drawer-content d-flex flex-column">
        <!-- Fixed Header -->
        <div class="drawer-header">
          <div class="d-flex justify-content-between align-items-center">
            <h4 class="ai-effect-gradient-text m-0">
              <sparkle-icon
                width="16"
                height="16"
                color="#9333EA"
              />
              Ask AloAi
            </h4>
            <b-button
              variant="light"
              size="sm"
              @click="showQuestionDrawer = false"
            >
              <i class="material-icons">close</i>
            </b-button>
          </div>
        </div>

        <!-- Scrollable Chat Container -->
        <div class="chat-container flex-grow-1 p-2">
          <q-chat-message
            v-for="(message, index) in chatMessages"
            :key="index"
            :text="[message.text]"
            :sent="message.sent"
            :name="message.name"
            :bg-color="message.sent ? 'primary' : 'grey-3'"
            :text-color="message.sent ? 'white' : 'black'"
            :stamp="message.stamp"
            size="12"
          >
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

        <!-- Fixed Input Container -->
        <div class="chat-input-container">
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
            <button
              class="send-button"
              :disabled="isAsking"
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SparkleIcon from 'components/icons/ai/sparkle-bold-icon.vue'
import DOMPurify from 'dompurify'
import _ from 'lodash'
import { marked } from 'marked'
import { QSpinnerBars } from 'quasar'
import * as CommunicationTypes from 'src/constants/communication-types'
import talk2Api from 'src/plugins/api/api'
import talk2TeamInboxApi from 'src/plugins/api/teamInboxApi'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'ContactConversationInsights',

  components: {
    SparkleIcon,
    QSpinnerBars
  },

  props: {
    contact: {
      type: Object,
      required: true
    },
    isReadOnly: {
      type: Boolean,
      default: false
    },
    fromTeamInbox: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    autoHeightClass () {
      return this.isExpanded ? 'auto-height' : 'overflow-hidden'
    },

    isContactValid () {
      return this.contact && this.contact.id
    },

    isRouteMatch () {
      return this.$route.params.id === this.contact.id.toString() || this.$route.name === 'Power Dialer'
    },

    isContactAndRouteValid () {
      return this.isContactValid && this.isRouteMatch
    },

    ...mapState('auth', ['profile'])
  },

  data () {
    return {
      insights: null,
      isExpanded: false,
      insightsLoaded: false,
      isGenerating: false,
      isAddingNote: false,
      showQuestionDrawer: false,
      userQuestion: '',
      chatMessages: [],
      isAsking: false,
      drawerTopPosition: '0px',
      placeholder: 'Ask anything about this conversation',
      showSuggestions: false,
      suggestedQuestions: [
        'What are the main topics discussed across all conversations?',
        'What are the recurring pain points mentioned by the customer?',
        'Has the customer\'s sentiment changed over time?',
        'What commitments or promises have been made in these conversations?',
        'What are the key objections raised across different conversations?',
        'Summarize the pricing discussions across all conversations.',
        'What are the next steps or action items from recent conversations?',
        'How has the customer\'s requirements evolved over time?',
        'What competitors have been mentioned across conversations?',
        'What features or solutions has the customer shown most interest in?',
        'Have there been any escalations or urgent issues mentioned?',
        'What is the overall timeline of engagement with this customer?',
        'Generate a follow-up email.'
      ]
    }
  },

  async mounted () {
    if (this.contact && this.contact.id) {
      await this.getData()
    }
    this.updateDrawerPosition()
    window.addEventListener('resize', this.updateDrawerPosition)
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.updateDrawerPosition)
  },

  methods: {
    getData (force = false) {
      return talk2Api.V2.contact.getConversationSummary(this.contact.id, {
        params: {
          force
        }
      }).then(response => {
        this.insights = response.data
        // Filter out key_topics that are objects or empty
        if (this.insights?.summary?.key_topics && Array.isArray(this.insights.summary.key_topics)) {
          this.insights.summary.key_topics = this.insights.summary.key_topics.filter(topic =>
            typeof topic === 'string' && topic.trim() !== ''
          )
        }
      }).finally(() => {
        this.insightsLoaded = true
      })
    },

    onExpanded () {
      this.isExpanded = !this.isExpanded
    },

    handleRegenerate () {
      this.isGenerating = true
      this.getData(true).finally(() => {
        this.isGenerating = false
      })
    },

    /**
     * Parse markdown text to HTML.
     * @param {string} summaryText
     *
     * @returns {string}
     */
    parseMarkdown (text) {
      if (typeof text !== 'string') return ''
      let renderer = new marked.Renderer()
      renderer.link = function (href, title, text) {
        var link = marked.Renderer.prototype.link.apply(this, arguments)
        return link.replace('<a', '<a target=\'_blank\'')
      }

      // Use the custom renderer with marked
      const rawHtml = marked(text, { renderer })
      return DOMPurify.sanitize(rawHtml)
    },

    /**
     * Copies the insights content to clipboard
     */
    copyToClipboard () {
      const sections = []

      if (this.insights?.summary?.introduction) {
        sections.push(`Introduction:\n${this.insights.summary.introduction}`)
      }

      if (this.insights?.summary?.key_topics?.length) {
        sections.push(`Key Topics:\n${this.insights.summary.key_topics.join('\n')}`)
      }

      if (this.insights?.summary?.outcome) {
        sections.push(`Outcome:\n${this.insights.summary.outcome}`)
      }

      if (this.insights?.summary?.follow_up_actions) {
        const actions = []
        if (this.insights.summary.follow_up_actions.agents?.length) {
          actions.push('Agents:')
          this.insights.summary.follow_up_actions.agents.forEach(action => {
            actions.push(`- ${action.name}: ${action.action}`)
          })
        }
        if (this.insights.summary.follow_up_actions.contact?.length) {
          actions.push('Contact:')
          this.insights.summary.follow_up_actions.contact.forEach(action => {
            actions.push(`- ${action.name}: ${action.action}`)
          })
        }
        if (actions.length) {
          sections.push(`Follow-up Actions:\n${actions.join('\n')}`)
        }
      }

      if (this.insights?.summary?.coaching_opportunities?.length) {
        const opportunities = ['Coaching Opportunities:']
        this.insights.summary.coaching_opportunities.forEach(opp => {
          if (opp.agent && opp.opportunity) {
            opportunities.push(`- ${opp.agent}: ${opp.opportunity}`)
          }
        })
        sections.push(opportunities.join('\n'))
      }

      const content = sections.join('\n\n')
      navigator.clipboard.writeText(content)
        .then(() => {
          this.$q.notify({
            message: 'Content copied to clipboard!',
            color: 'positive',
            position: 'top',
            timeout: 2000
          })
        })
        .catch(err => {
          console.error('Failed to copy content:', err)
          this.$q.notify({
            message: 'Failed to copy content',
            color: 'negative',
            position: 'top',
            timeout: 2000
          })
        })
    },

    /**
     * Creates a note from the insights content
     */
    createNote () {
      this.isAddingNote = true
      const sections = []

      if (this.insights?.summary?.introduction) {
        sections.push(`**Introduction:**\n${this.insights.summary.introduction}`)
      }

      if (this.insights?.summary?.key_topics?.length) {
        sections.push(`**Key Topics:**\n${this.insights.summary.key_topics.map(topic => `• ${topic}`).join('\n')}`)
      }

      if (this.insights?.summary?.outcome) {
        sections.push(`**Outcome:**\n${this.insights.summary.outcome}`)
      }

      if (this.insights?.summary?.follow_up_actions) {
        const actions = []
        if (this.insights.summary.follow_up_actions.agents?.length) {
          actions.push('**Agents:**')
          this.insights.summary.follow_up_actions.agents.forEach(action => {
            actions.push(`• ${action.name}: ${action.action}`)
          })
        }
        if (this.insights.summary.follow_up_actions.contact?.length) {
          actions.push('**Contact:**')
          this.insights.summary.follow_up_actions.contact.forEach(action => {
            actions.push(`• ${action.name}: ${action.action}`)
          })
        }
        if (actions.length) {
          sections.push(`**Follow-up Actions:**\n${actions.join('\n')}`)
        }
      }

      if (this.insights?.summary?.coaching_opportunities?.length) {
        const opportunities = ['**Coaching Opportunities:**']
        this.insights.summary.coaching_opportunities.forEach(opp => {
          if (opp.agent && opp.opportunity) {
            opportunities.push(`• ${opp.agent}: ${opp.opportunity}`)
          }
        })
        sections.push(opportunities.join('\n'))
      }

      const content = sections.join('\n\n')

      // Create and send the note
      const message = {
        time: null,
        date: null,
        timezone: this.profile.timezone,
        body: content,
        type: CommunicationTypes.NOTE
      }

      const apiCall = this.fromTeamInbox
        ? talk2TeamInboxApi.calendar.createEvent(this.contact.id, message)
        : talk2Api.V1.contact.addEngagement(this.contact.id, message)

      apiCall.then(response => {
        this.$generalNotification('Note has been added.')
      })
        .catch(error => {
          console.error(error)
          this.$handleErrors(error.response)
        })
        .finally(() => {
          this.isAddingNote = false
        })
    },

    scrollToBottom () {
      const chatContainer = this.$el.querySelector('.chat-container')
      if (chatContainer) {
        setTimeout(() => {
          chatContainer.scrollTop = chatContainer.scrollHeight
        }, 100) // Small delay to ensure content is rendered
      }
    },

    async sendQuestion () {
      if (!this.userQuestion.trim()) return

      const question = this.userQuestion.trim()
      this.chatMessages.push({
        text: question,
        sent: true,
        name: 'You',
        stamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })

      this.scrollToBottom()
      this.isAsking = true
      this.userQuestion = ''

      // Reset textarea height
      if (this.$refs.textarea) {
        this.$refs.textarea.style.height = '40px' // Reset to initial height
      }

      // Add loading message
      const loadingMessageIndex = this.chatMessages.length
      this.chatMessages.push({
        text: '',
        sent: false,
        name: 'AloAi',
        isLoading: true
      })

      this.scrollToBottom() // Scroll to show loading message

      try {
        const response = await talk2Api.V2.contact.askQuestion(this.contact.id, {
          params: {
            question
          }
        })

        // Process the response - handle both array and string cases
        const processedText = Array.isArray(response.data.response)
          ? response.data.response.map(item => this.parseMarkdown(item))
          : [this.parseMarkdown(response.data.response)]

        // Replace loading message with actual response
        this.chatMessages.splice(loadingMessageIndex, 1, {
          text: processedText,
          sent: false,
          name: 'AloAi',
          stamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })

        this.scrollToBottom() // Scroll after response received
      } catch (error) {
        // Remove loading message on error
        this.chatMessages.splice(loadingMessageIndex, 1)
        console.error('Failed to get answer:', error)
        this.$q.notify({
          message: 'Failed to get answer',
          color: 'negative',
          position: 'top',
          timeout: 2000
        })
      } finally {
        this.isAsking = false
      }
    },

    updateDrawerPosition () {
      if (window.innerWidth < 1085) {
        this.drawerTopPosition = '0px'
        return
      }

      const header = document.querySelector('.q-header')
      if (header) {
        const headerHeight = header.offsetHeight
        this.drawerTopPosition = `${headerHeight}px`
      }
    },

    autoResize (event) {
      const textarea = this.$refs.textarea
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'
      }
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

    ...mapActions('contacts', ['setMessageComposerNoteBody', 'resetMessageComposerNote'])
  },

  watch: {
    'contact.id': _.debounce(function () {
      if (this.isContactAndRouteValid) {
        this.insightsLoaded = false
        this.getData()
      }
    }, 500),

    showQuestionDrawer (newValue) {
      if (!newValue) {
        // Reset input when drawer closes
        this.userQuestion = ''
      }
    }
  }
}
</script>

<style scoped>
.information-container {
  max-height: 235px;
}

.information-container.auto-height {
  max-height: 10000px;
}

.summary-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #040404;
  margin-bottom: 8px;
  text-align: left;
}

.section-content {
  font-size: 13px;
  color: #040404;
  line-height: 1.6;
  margin: 0;
  text-align: left;
}

.topics-list {
  list-style: none;
  padding: 0 0 0 0px;
  margin: 0;
  text-align: left;
}

.topics-list li {
  margin-bottom: 8px;
  color: #040404;
  line-height: 1.6;
  padding-left: 14px;
  position: relative;
  font-size: 13px;
}

.topics-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #646cff;
}

.follow-up-column {
  text-align: left;
}

.column-title {
  font-size: 13px;
  font-weight: 600;
  color: #040404;
  margin-bottom: 8px;
  text-align: left;
}

.action-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.action-list li {
  margin-bottom: 8px;
  color: #040404;
  line-height: 1.6;
  padding-left: 14px;
  position: relative;
  text-align: left;
  font-size: 13px;
}

.action-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #646cff;
}

.timestamp {
  font-size: 12px;
  text-align: center;
  color: #666;
}

.custom-drawer {
  position: fixed;
  right: -346px;
  width: 346px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 2000;
}

.custom-drawer.is-open {
  right: 0;
}

.drawer-content {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  height: 100%;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

/* Update existing drawer styles to work with new implementation */
.drawer-header {
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(147, 51, 234, 0.1);
  position: sticky;
  top: 0;
  z-index: 2000;
  backdrop-filter: blur(10px);
  padding: 0 16px;

  > div {
    height: 44px;
  }
}

.chat-container {
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 1rem;
  scroll-behavior: smooth;
  margin-top: 1px;
}

.chat-input-container {
  padding: 0 16px 16px 16px;
  position: relative;
}

.suggestions-container {
  position: absolute;
  bottom: 100%;
  left: 16px;
  right: 16px;
  background: rgba(255, 255, 255);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  margin-bottom: 8px;
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

.ai-effect-gradient-input {
  width: 100%;
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

.prepend-icon {
  margin: 0 8px;
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
  opacity: 1; /* Firefox */
}
</style>
