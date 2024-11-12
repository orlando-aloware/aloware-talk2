<template>
  <section class="transcription chat-area"
           id="transcript"
           data-testid="comm-conversation-section"
           ref="chatArea">
    <div v-if="!isEmpty(messages)">
      <div style="display: flex; justify-content: flex-end; gap: 4px; margin-top: -8px">
        <q-btn color="text-dark-greenish"
              class="btn btn-inline px-1 py-0"
              title="Download Transcription"
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
              title="Copy Transcription"
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
      <div :key="message_index"
           v-for="(message, message_index) in formattedMessages">
        <!--
          Any agent message will prompt on the left side of conversation.
          Any customer message will prompt on the right side of conversation.
          Also, we need to change the background color based on the message sentiment.
        -->
        <p class="message-box break-word"
           data-testid="comm-conversation-section-message-box"
           :data-start="message.start"
           :data-end="message.end"
           :data-talk-time="message.talk_time"
           :id="'msg-' + message_index"
           :class="message.classes.messageBoxClass"
           :style="{ border: message.sentimentBorder }">
          <strong>Speaker: {{ message.speaker }}</strong>
          <br>
          <span style="line-height: 1.6"
                v-html="message.formattedText">
          </span>
        </p>

        <!-- Show the speaker's sentiment below each message. -->
        <span class="sentiment flex items-center"
              data-testid="comm-conversation-section-speaker-sentiment"
              :class="message.classes.sentimentClass">
          <span class="sentiment-circle"
                :style="{ background: message.sentimentBackgroundColor }"/>
          <span class="sentiment-description">{{ message.sentiment_possibility }}% {{ message.sentiment }}</span>
        </span>
      </div>
    </div>

    <!-- If no conversation was detected. -->
    <div class="text-center"
         v-else>
      <span data-testid="comm-conversation-section-no-conversation">No Conversation</span>
    </div>
  </section>
</template>

<script>
import _ from 'lodash'
import DownloadIcon from 'components/icons/contact-activity/download-icon'
import CopyIcon from 'components/icons/copy-icon'

export default {
  name: 'ConversationSection',

  components: {
    DownloadIcon,
    CopyIcon
  },

  props: {
    messages: {
      type: Array,
      required: true
    },
    isEmpty: {
      type: Function,
      required: true
    },
    formattedMessages: {
      type: [Object, Array],
      required: true
    }
  },

  data () {
    return {
      currentMessageIndex: -1
    }
  },

  methods: {
    syncScroll: _.throttle(function (currentTime) {
      // Find the current message
      const msgIndex = this.formattedMessages.findIndex(msg => currentTime * 1000 >= msg.start && currentTime * 1000 <= msg.end)

      if (msgIndex !== -1 && msgIndex !== this.currentMessageIndex) {
        // Remove highlight from previous message
        if (this.currentMessageIndex !== -1) {
          const prevMsg = document.getElementById(`msg-${this.currentMessageIndex}`)

          if (prevMsg) {
            prevMsg.classList.remove('current')
          }
        }

        // Highlight current message
        const currentMsg = document.getElementById(`msg-${msgIndex}`)

        if (currentMsg) {
          currentMsg.classList.add('current')

          // Scroll the message into view
          this.scrollToMessage(currentMsg)

          // Trigger the temporary highlight animation
          this.triggerHighlightAnimation(currentMsg)
        }

        // Update current message index
        this.currentMessageIndex = msgIndex
      }
    }, 200),

    /**
     * Scrolls the transcript container to the specified message element smoothly.
     * @param {HTMLElement} messageElement - The message element to scroll into view.
     */
    scrollToMessage (messageElement) {
      if (!messageElement) return

      const transcriptContainer = document.getElementById('transcript')

      const containerRect = transcriptContainer.getBoundingClientRect()
      const messageRect = messageElement.getBoundingClientRect()

      // Calculate the offset needed to center the message within the container
      const offset = messageRect.top - containerRect.top - (containerRect.height / 2) + (messageRect.height / 2)

      // Calculate the new scrollTop position
      const newScrollTop = transcriptContainer.scrollTop + offset

      // Scroll to the new position smoothly
      transcriptContainer.scrollTo({
        top: newScrollTop,
        behavior: 'smooth' // Enables smooth scrolling
      })
    },

    /**
     * Generates a Markdown-formatted transcription from messages.
     * @returns {string} - The full transcription in Markdown format.
     */
    generateMarkdownTranscription () {
      return this.formattedMessages.map(message => {
        let cleanText = message.formattedText
          .replace(/<\/?(b|strong)>/g, '**') // Replace <b> and <strong> tags with Markdown bold (**)
          .replace(/<\/?(i|em)>/g, '*') // Replace <i> and <em> tags with Markdown italics (*)
          .replace(/<\/?[^>]+(>|$)/g, '') // Remove all other HTML tags
        return `**${message.speaker}:**\n${cleanText}\n`
      }).join('\n---\n\n')
    },

    /**
     * Downloads the transcription as a Markdown file.
     * @public
     *
     * @returns {void}
     */
    onDownload () {
      const markdownTranscription = this.generateMarkdownTranscription()

      // Create a Blob with the transcription content
      const blob = new Blob([markdownTranscription], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      // set filename to include the current date and time
      a.download = `transcript_${new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-')}.txt`
      a.click()

      URL.revokeObjectURL(url)
    },

    /**
     * Copies the Markdown transcription to the clipboard.
     * @public
     *
     * @returns {void}
     */
    onCopy () {
      const markdownTranscription = this.generateMarkdownTranscription()

      navigator.clipboard.writeText(markdownTranscription)
        .then(() => {
          this.$generalNotification('Transcription copied to clipboard')
        })
        .catch(err => {
          console.error('Failed to copy transcription: ', err)
          this.$generalNotification('Failed to copy transcription', 'error')
        })
    },

    /**
     * Triggers a temporary highlight animation on the specified message element.
     * @param {HTMLElement} messageElement - The message element to animate.
     */
    triggerHighlightAnimation (messageElement) {
      // Add the animation class
      messageElement.classList.add('highlight-animation')

      // Listen for the end of the animation to remove the class
      messageElement.addEventListener('animationend', function handleAnimationEnd () {
        messageElement.classList.remove('highlight-animation')
        // Remove this event listener after the animation ends
        messageElement.removeEventListener('animationend', handleAnimationEnd)
      })
    }
  }
}
</script>

<style scoped>
@keyframes highlightPulse {
  0% {
    background-color: #ffff99; /* Start with a light yellow */
  }
  50% {
    background-color: #ffeb3b; /* Pulse to a brighter yellow */
  }
  100% {
    background-color: #85858511; /* Fade back to the 'current' background */
  }
}

.highlight-animation {
  animation: highlightPulse 1s ease; /* Duration and easing of the animation */
}

.current:not(.highlight-animation) {
  background-color: #8cdaff !important; /* Light blue background for the current message */
}
</style>
