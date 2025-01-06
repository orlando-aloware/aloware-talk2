<template>
  <div class="d-flex justify-content-center context-menu">
    <reply-communication-button class="operation-button mx-1"
                                :communication="row" />

    <call-communication-button class="operation-button mx-1"
                               :communication="row" />

    <details-communication-button class="operation-button mx-1"
                                  :communication="row" />

<!--    <operation-archive :communication="row" />-->

<!--    <operation-terminate :communication="row" />-->

<!--    <operation-barge :communication="row" />-->

<!--    <operation-whisper :communication="row" />-->
  </div>
</template>

<script>
import ReplyCommunicationButton from 'components/communication/reply-communication-button.vue'
import CallCommunicationButton from 'components/communication/call-communication-button.vue'
import DetailsCommunicationButton from 'components/communication/details-communication-button.vue'

export default {
  name: 'CommunicationsOperations',

  components: {
    ReplyCommunicationButton,
    CallCommunicationButton,
    DetailsCommunicationButton
  },

  props: {
    row: {
      type: Object,
      required: true
    }
  }
}
</script>
