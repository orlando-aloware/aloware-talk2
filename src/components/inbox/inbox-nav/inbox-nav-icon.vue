<script>
import phone from 'components/icons/phone-icon.vue'
import hideMinimize from 'components/icons/hide-minimize-icon.vue'
import message from 'components/icons/message-icon.vue'
import record from 'components/icons/record-icon.vue'
import showContent from 'components/icons/show-content-icon.vue'
import task from 'components/icons/task-icon.vue'
import voicemail from 'components/icons/voicemail-icon.vue'

export default {
  /* eslint-disable */
  components: {
    phone,
    hideMinimize,
    message,
    record,
    showContent,
    task,
    voicemail
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
  <component v-bind:is="icon" :iconColor="isActive ? 'green' : 'grey-mid'"></component>
</template>
