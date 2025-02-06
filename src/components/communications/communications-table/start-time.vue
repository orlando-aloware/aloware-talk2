
<template>
  <div class="d-flex flex-column">
    <span>{{ row.created_at | fixFullDateTime }}</span>
    <div class="d-flex align-items-center text-xs"
         data-testid="start-time-row"
         v-if="row.call_disposition_id">
      <i class="fa fa-bolt"
         :style="{ color: callDispositionColor(row.call_disposition_id) }"/>
        <span class="ml-1 text-grey-900">{{ callDispositionName(row.call_disposition_id)}}</span>
    </div>

    <span class="cursor-pointer text-primary"
          :id="`recording-comm-${row.id}`"
          v-if="row.has_recording || row.recording_is_deleted">
      <i class="fa-solid fa-play"/> Left Recording

      <b-popover triggers="click blur"
                 placement="bottom"
                 :target="`recording-comm-${row.id}`">
        <communication-audio data-testid="comm-log-communication-audio"
                             :communication="row"
                             :unique-id="row.id + '1'"
                             :type="UploadedFileTypes.TYPE_CALL_RECORDING"/>
      </b-popover>
    </span>

    <span class="cursor-pointer text-primary"
          :id="`voicemail-comm-${row.id}`"
          v-if="row.has_voicemail">
      <i class="fa-solid fa-play"/> Left Voicemail

      <b-popover triggers="click blur"
                 placement="bottom"
                 :target="`voicemail-comm-${row.id}`">
        <communication-audio data-testid="comm-log-communication-audio"
                             :communication="row"
                             :unique-id="row.id + '1'"
                             :type="UploadedFileTypes.TYPE_CALL_VOICEMAIL"/>
      </b-popover>
      </span>

    <span class="cursor-pointer text-primary d-flex align-items-center"
          v-if="row.has_transcription && !row.transcription_is_deleted">
      <i class="fa-solid fa-play mr-1"/>
        <transcription-modal no-button
                             data-testid="communication-audio-transcription-modal"
                             ref="transcriptionModal"
                             :communication="row"
                             :type="row.has_voicemail ? UploadedFileTypes.TYPE_CALL_VOICEMAIL : UploadedFileTypes.TYPE_CALL_RECORDING"
                             :contact="row.contact" />
    </span>
  </div>
</template>

<script>
import { callDispositionMixin } from 'src/plugins/mixins'
import CommunicationAudio from 'components/communication-audio.vue'
import * as UploadedFileTypes from 'src/constants/uploaded-file-types'
import TranscriptionModal from 'components/communication/transcription-modal.vue'

export default {
  name: 'StartTime',

  mixins: [callDispositionMixin],

  components: {
    TranscriptionModal,
    CommunicationAudio
  },

  props: {
    row: {
      type: Object,
      required: false
    }
  },

  data: () => ({
    UploadedFileTypes
  })
}
</script>
