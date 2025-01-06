<template>
  <div class="d-flex justify-content-center context-menu">
    <reply-communication-button custom-class="operation-button mx-1"
                                :communication="row" />

    <call-communication-button custom-class="operation-button mx-1"
                               :communication="row" />

<!--    <operation-info :communication="row" />-->

<!--    <operation-archive :communication="row" />-->

<!--    <operation-terminate :communication="row" />-->

<!--    <operation-barge :communication="row" />-->

<!--    <operation-whisper :communication="row" />-->
  </div>
</template>

<script>
import ReplyCommunicationButton from 'components/communication/reply-communication-button.vue'
import CallCommunicationButton from 'components/communication/call-communication-button.vue'

export default {
  name: 'CommunicationsOperations',

  components: {
    ReplyCommunicationButton,
    CallCommunicationButton
  },

  props: {
    row: {
      type: Object,
      required: true
    }
  }
}
</script>
