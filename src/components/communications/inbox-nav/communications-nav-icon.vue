<script>
import phone from 'components/icons/phone-icon'
import hideMinimize from 'components/icons/hide-minimize-icon'
import showContent from 'components/icons/show-content-icon'
import task from 'components/icons/task-icon'
import inbox from 'components/icons/inbox/inbox-icon'
import call from 'components/icons/inbox/call-icon'
import message from 'components/icons/inbox/message-icon'
import mention from 'components/icons/inbox/mention-icon'
import voicemail from 'components/icons/inbox/voicemail-icon'
import record from 'components/icons/inbox/record-icon'
import allCommunications from 'components/icons/inbox/all-communications-icon'
import person from 'components/icons/person-o-icon'

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
    record,
    allCommunications,
    person
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
