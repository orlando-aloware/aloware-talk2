<template>
  <div class="w-100">
    <b-card class="ai-effect-container w-100"
            no-body>
      <div class="ai-effect-gradient"></div>
      <div class="ai-effect-blur"></div>
      <b-card-body class="ai-effect-content">
        <div class="w-100">
          <h4 class="ai-effect-gradient-text">AloAi Conversation Insights
            <sparkle-icon width="16" height="16" color="#9333EA"/>
          </h4>
        </div>
        <div :class="`information-container mt-3 mb-4 ${autoHeightClass}`">
          <div class="card-text"
               v-if="insightsLoaded">
            <!-- Introduction -->
            <section class="summary-section"
                     v-if="insights?.summary?.introduction">
              <h3 class="section-title">Introduction</h3>
              <p class="section-content"
                 v-html="parseMarkdown(insights.summary.introduction)">
              </p>
            </section>

            <!-- Key Topics -->
            <section class="summary-section"
                     v-if="insights?.summary?.key_topics?.length > 0">
              <h3 class="section-title">Key Topics</h3>
              <ul class="topics-list">
                <li v-for="(topic, index) in insights.summary.key_topics"
                    :key="index"
                    v-html="parseMarkdown(topic)">
                </li>
              </ul>
            </section>

            <!-- Outcome -->
            <section class="summary-section"
                     v-if="insights?.summary?.outcome">
              <h3 class="section-title">Outcome</h3>
              <p class="section-content"
                 v-html="parseMarkdown(insights.summary.outcome)">
              </p>
            </section>

            <!-- Follow-up Actions -->
            <section class="summary-section">
              <h3 class="section-title">Follow-up Actions</h3>
              <div class="follow-up-column"
                   v-if="insights?.summary?.follow_up_actions?.agents?.length > 0">
                <h4 class="column-title">Agents</h4>
                <ul class="action-list">
                  <li v-for="(action, index) in insights.summary.follow_up_actions.agents" :key="index">
                    <strong>{{ action.name }}:</strong>
                    <div class="no-p-margin" v-html="parseMarkdown(action.action)"></div>
                  </li>
                </ul>
              </div>
              <div class="follow-up-column"
                   v-if="insights?.summary?.follow_up_actions?.contact?.length > 0">
                <h4 class="column-title">Contact</h4>
                <ul class="action-list">
                  <li v-for="(action, index) in insights.summary.follow_up_actions.contact" :key="index">
                    <strong>{{ action.name }}:</strong>
                    <div class="no-p-margin" v-html="parseMarkdown(action.action)"></div>
                  </li>
                </ul>
              </div>
            </section>

            <!-- Coaching Opportunities -->
            <section class="summary-section"
                     v-if="insights?.summary?.coaching_opportunities?.length > 0">
              <h3 class="section-title">Coaching Opportunities</h3>
              <ul class="topics-list">
                <li v-for="(opportunity, index) in insights.summary.coaching_opportunities"
                    :key="index">
                  <template v-if="opportunity.agent && opportunity.opportunity">
                    <strong>{{ opportunity.agent }}:</strong>
                    <div class="no-p-margin" v-html="parseMarkdown(opportunity.opportunity)"></div>
                  </template>
                </li>
              </ul>
            </section>

            <!-- Footer -->
            <b-button class="text-white"
                      size="sm"
                      variant="primary"
                      tabindex="0"
                      block
                      @click="handleRegenerate">
              {{ isGenerating ? '🧙‍♂️️🪄✨' : '🪄 Regenerate Insights' }}
            </b-button>

            <div class="timestamp"
                 v-if="insights?.updated_at">
              Last updated: {{ formatDate(insights.updated_at) }}
            </div>
          </div>
          <div class="text-center"
               v-else>
            <q-spinner-bars
              color="primary"
              size="2em"
            />
          </div>
        </div>

        <b-button class="expand-toggle"
                  variant="light"
                  size="sm"
                  pill
                  data-testid="contact-information-toggle"
                  @click="onExpanded">
          <i class="material-icons icon">{{ isExpanded ? 'expand_less' : 'expand_more' }}</i>
        </b-button>
      </b-card-body>
    </b-card>
  </div>
</template>

<script>
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import _ from 'lodash'
import { QSpinnerBars } from 'quasar'
import talk2Api from 'src/plugins/api/api'
import SparkleIcon from 'components/icons/ai/sparkle-bold-icon.vue'

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
    }
  },

  data () {
    return {
      insights: null,
      isExpanded: false,
      insightsLoaded: false,
      isGenerating: false
    }
  },

  async mounted () {
    if (this.contact && this.contact.id) {
      await this.getData()
    }
  },

  methods: {
    getData (force = false) {
      return talk2Api.V2.contact.getConversationSummary(this.contact.id, {
        params: {
          force
        }
      }).then(response => {
        this.insights = response.data
      }).finally(() => {
        this.insightsLoaded = true
      })
    },

    formatDate (dateString) {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
      const rawHtml = marked(text)
      return DOMPurify.sanitize(rawHtml)
    }
  },

  watch: {
    'contact.id': _.debounce(function () {
      if (this.isContactAndRouteValid) {
        this.insightsLoaded = false
        this.getData()
      }
    }, 500)
  }
}
</script>

<style scoped>
.information-container {
  max-height: 150px;
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
</style>
