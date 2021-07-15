<script>
import phone from 'components/icons/phone-icon.vue'
import hideMinimize from 'components/icons/hide-minimize-icon.vue'
import showContent from 'components/icons/show-content-icon.vue'
import task from 'components/icons/task-icon.vue'
import inbox from 'components/icons/inbox/inbox-icon.vue'
import call from 'components/icons/inbox/call-icon.vue'
import message from 'components/icons/inbox/message-icon.vue'
import mention from 'components/icons/inbox/mention-icon.vue'
import voicemail from 'components/icons/inbox/voicemail-icon.vue'
import record from 'components/icons/inbox/record-icon.vue'

export default {
  /* eslint-disable */
  components: {
    phone,
    hideMinimize,
    showContent,
    task,
    voicemail,
    inbox,
    call,
    message,
    mention,
    record
    /* eslint-enable */
  },
  props: {
    icon: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<template>
  <component v-bind:is="icon"></component>
</template>
