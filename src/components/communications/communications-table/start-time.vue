
<template>
  <div class="">
    <span>{{ value | fixDateTime }}</span>
    <div class="mt-1 d-flex align-items-center justify-content-center text-xs"
         data-testid="start-time-row"
         v-if="row.call_disposition_id" >
      <i class="fa fa-bolt"
         :style="{ color: callDispositionColor(row.call_disposition_id) }"></i>
        <span class="ml-1 text-grey-900">{{ callDispositionName(row.call_disposition_id)}}</span>
    </div>

    <!--TODO: here goes the actions, meanwhile just icons to define if has the things -->
    <div class="mt-1 col-12 d-flex justify-content-around text-xs gutter-2">
      <span  class="fa fa-microphone"
          v-if="row.has_recording || row.recording_is_deleted"
          :style="{ color: row.has_recording ? 'green' : 'grey' }"
      >
          <q-tooltip trigger="hover">
            has recording
          </q-tooltip>
        </span>

      <span class="fa fa-voicemail text-negative"
          v-if="row.has_voicemail"
          >
          <q-tooltip trigger="hover">
            has voice mail
          </q-tooltip>
        </span>

      <span class="fa fa-file-text text-primary"
            v-if="row.has_transcription && !row.transcription_is_deleted"
          >
          <q-tooltip trigger="hover">
              has transcription
            </q-tooltip>
        </span>
    </div>

      <!--  <div class="row mt-2"
                    data-testid="start-time-row"
                    v-if="scope.row.has_recording || scope.row.recording_is_deleted">
                  <div class="col-12">
                      <communication-audio :communication="scope.row"
                                            data-testid="comm-log-communication-audio"
                                            :type="UploadedFileTypes.TYPE_CALL_RECORDING">
                      </communication-audio>
                  </div>
              </div>
              <div class="row mt-2"
                    data-testid="start-time-row"
                    v-if="scope.row.has_voicemail">
                  <div class="col-12">
                      <communication-audio :communication="scope.row"
                                            data-testid="comm-log-communication-voicemail"
                                            :type="UploadedFileTypes.TYPE_CALL_VOICEMAIL">
                      </communication-audio>
                  </div>
              </div>
              <div class="row mt-2"
                    v-if="scope.row.has_transcription && !scope.row.transcription_is_deleted">
                  <div class="col-12">
                      <communication-transcription-button
                          data-testid="comm-log-communication-transcription-button"
                          :communication="scope.row"
                          :button_text="'Show Transcription'"
                      ></communication-transcription-button>
                  </div>
              </div> -->
    </div>
</template>

<script>
import { callDispositionMixin } from 'src/plugins/mixins'

export default {
  name: 'StartTime',
  mixins: [callDispositionMixin],
  props: {
    value: {
      type: String,
      required: false
    },
    row: {
      type: Object,
      required: false
    }
  },
  computed: {}
}
</script>
