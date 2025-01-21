<template>
  <div class="d-flex justify-content-end context-menu">
    <reply-communication-button class="operation-button mx-1"
                                :communication="row" />

    <call-communication-button class="operation-button mx-1"
                               :communication="row" />

    <details-communication-button class="operation-button mx-1"
                                  :communication="row" />

    <archive-communication-button class="operation-button mx-1"
                                  :communication="row"
                                  @archived="$emit('archived', $event)"/>

    <terminate-communication-button class="operation-button mx-1"
                                    icon-height="16"
                                    icon-width="16"
                                    :communication="row"
                                    @terminated="$emit('terminated', $event)"/>

    <barge-communication-button class="operation-button mx-1"
                                icon-height="16"
                                icon-width="16"
                                :communication="row" />

    <whisper-communication-button class="operation-button mx-1"
                                  icon-height="16"
                                  icon-width="16"
                                  :communication="row" />
  </div>
</template>

<script>
import ReplyCommunicationButton from 'components/communication/reply-communication-button.vue'
import CallCommunicationButton from 'components/communication/call-communication-button.vue'
import DetailsCommunicationButton from 'components/communication/details-communication-button.vue'
import ArchiveCommunicationButton from 'components/communication/archive-communication-button.vue'
import TerminateCommunicationButton from 'components/communication/terminate-communication-button.vue'
import BargeCommunicationButton from 'components/communication/barge-communication-button.vue'
import WhisperCommunicationButton from 'components/communication/whisper-communication-button.vue'

export default {
  name: 'CommunicationsOperations',

  components: {
    WhisperCommunicationButton,
    ReplyCommunicationButton,
    CallCommunicationButton,
    DetailsCommunicationButton,
    ArchiveCommunicationButton,
    TerminateCommunicationButton,
    BargeCommunicationButton
  },

  props: {
    row: {
      type: Object,
      required: true
    }
  }
}
</script>
