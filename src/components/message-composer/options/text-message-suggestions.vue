<template>
  <div>
    <div class="ai-effect-gradient"></div>
    <div class="ai-effect-blur"></div>
    <div class="ai-effect-content">
      <q-list>
        <q-item-label class="q-pa-md pb-2">
          <h4 class="ai-effect-gradient-text">
            <sparkle-icon width="16" height="16" color="#9333EA"/>
            AloAi-Crafted Message Suggestions
          </h4>
        </q-item-label>

        <q-item-label class="mt-0">
          <q-input v-model="personalizedMessage"
                   placeholder="Ask AloAi to write a message or personalize it..."
                   input-class="q-px-md text-13"
                   autogrow
                   dense
                   borderless
                   @input="emitChanged">
            <template v-slot:append>
              <q-btn icon="auto_fix_high"
                     type="submit"
                     color="primary"
                     :disabled="isGenerating"
                     round
                     dense
                     flat
                     @click="handleRegenerate">
              </q-btn>
            </template>
          </q-input>
        </q-item-label>

        <q-separator/>

        <div class="text-message-suggestions"
             :class="[ (suggestionsLoaded && (!suggestions || suggestions?.messages?.length === 0)) ? 'no-message' : '' ]">
          <template v-if="!suggestionsLoaded">
            <div v-for="(index) in [1, 2, 3, 4, 5]"
                 :key="index">
              <q-item class="default">
                <q-item-section>
                  <q-skeleton type="text"/>
                  <q-skeleton type="text" width="75%"/>
                  <q-skeleton type="text" width="50%"/>
                </q-item-section>
              </q-item>
              <q-separator/>
            </div>
          </template>
          <template v-else-if="suggestions?.messages?.length > 0">
            <div v-for="(suggestion, index) in suggestions.messages"
                 :key="index">
              <q-item class="default"
                      clickable
                      v-ripple
                      @click="selectSuggestion(suggestion)">
                <q-item-section>{{ suggestion }}</q-item-section>
              </q-item>
              <q-separator v-if="index != suggestions.messages.length - 1"/>
            </div>
          </template>
          <template v-else>
            <q-item class="default">
              <q-item-section>
                <h5 v-if="!contact?.id && !suggestions">Please write a short message above and let us generate something for you.</h5>
                <h5 v-else>Sorry, our wizard failed at suggesting anything!</h5>
              </q-item-section>
            </q-item>
          </template>
        </div>

        <q-item class="default footer bordered-top">
          <q-item-section>
            <div class="timestamp"
                 :class="[ suggestionsLoaded && suggestions ? '' : 'hide']">
              Last updated:
              <template v-if="suggestions?.created_at">{{ suggestions.created_at | fixDateTime }}</template>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script>
import talk2Api from 'src/plugins/api/api'
import SparkleIcon from 'components/icons/ai/sparkle-bold-icon.vue'

export default {
  name: 'text-message-suggestions',

  components: { SparkleIcon },

  props: {
    contact: {
      type: Object,
      required: false
    }
  },

  data () {
    return {
      personalizedMessage: '',
      suggestions: null,
      isGenerating: false,
      suggestionsLoaded: false
    }
  },

  methods: {
    getData (force = false) {
      this.suggestionsLoaded = false
      setTimeout(() => {
        this.$emit('loaded')
      }, 100)
      return talk2Api.V2.contact.getTextMessageSuggestions(this.contact?.id, {
        params: {
          force,
          personalized_message: this.personalizedMessage
        }
      }).then(response => {
        this.suggestions = response.data.content
      }).finally(() => {
        this.suggestionsLoaded = true
        setTimeout(() => {
          this.$emit('loaded')
        }, 100)
      })
    },

    handleRegenerate () {
      this.isGenerating = true
      this.getData(true).finally(() => {
        this.isGenerating = false
      })
    },

    selectSuggestion (suggestion) {
      console.log('Selected suggestion:', suggestion)
      this.$emit('selected', suggestion)
    },

    emitChanged () {
      setTimeout(() => {
        this.$emit('loaded')
      }, 100)
    }
  },

  mounted () {
    if (this.contact?.id) {
      this.getData()
    } else {
      this.suggestionsLoaded = true
    }
  }
}
</script>

<style lang="scss" scoped>
.footer {
  padding: 0;
  min-height: 24px;
}

.text-message-suggestions {
  height: 300px;
  overflow-y: scroll;

  &.no-message {
    height: 50px !important;
  }
}

.q-pa-md {
  padding: 12px 16px;
}

.timestamp {
  font-size: 12px;
  text-align: center;
  color: #666;
}

.hide {
  visibility: hidden;
}
</style>
