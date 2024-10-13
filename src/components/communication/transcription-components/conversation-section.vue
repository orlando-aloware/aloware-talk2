<template>
  <section class="transcription chat-area"
           id="transcript"
           data-testid="comm-conversation-section"
           ref="chatArea">
    <div v-if="!isEmpty(messages)">
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
        <span class="sentiment flex items-center justify-start"
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
export default {
  name: 'ConversationSection',

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
    syncScroll (currentTime) {
      // Find the current message
      const msgIndex = this.formattedMessages.findIndex(msg => currentTime * 1000 >= msg.start && currentTime * 1000 <= msg.end)

      if (msgIndex !== -1 && msgIndex !== this.currentMessageIndex) {
        console.log(msgIndex)

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
    },

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
