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

import inbound from 'components/icons/inbound-call-o-icon'
import outbound from 'components/icons/outbound-call-o-icon'
import eye from 'components/icons/eye-icon'
import personalization from 'components/icons/personalization-o-icon'
import diagnosis from 'components/icons/diagnosis-icon'
import person from 'components/icons/person-o-icon'
import notification from 'components/icons/notification-o-icon'
import document from 'components/icons/document-o-icon'

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
    inbound,
    outbound,
    eye,
    personalization,
    diagnosis,
    person,
    notification,
    document
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
