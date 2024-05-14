<template>
  <section class="transcription chat-area"
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
                :style="{ background: message.sentimentBackgroundColor }" />
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
  }
}
</script>
