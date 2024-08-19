<template>
  <div class="w-100" data-testid="comm-audio-wrapper">
    <div v-if="!isDeleted && hasAudio">
      <div class="audio-player p-2">
        <div class="d-flex flex-row align-items-center w-100"
             v-if="remoteUrl">
          <waveform :remoteUrl="remoteUrl"
                    :uniqueId="uniqueId"
                    data-testid="communication-audio-waveform"
                    @ready="loading = false">
          </waveform>
          <download-button v-if="fileUuid"
                           data-testid="communication-audio-download-button"
                           is-simple
                           :communication-id="communication.id"
                           :filename="filename"
                           :file-mime-type="this.mimeType"
                           :file-uuid="fileUuid"/>
          <transcription-modal button-text="Show Smart Transcription"
                               data-testid="communication-audio-transcription-modal"
                               :communication="communication"
                               :single-button="true"
                               v-if="!communication?.transcription_is_deleted && communication?.metadata?.transcription_info?.summary"/>
        </div>
      </div>
    </div>
    <span class="text-grey-900 record-was-deleted-label"
          data-testid="communication-audio-record-was-deleted-label"
          v-if="isDeleted">
      record was deleted
    </span>
  </div>
</template>

<script>
import {
  aclMixin,
  communicationInfoMixin
} from 'src/plugins/mixins'
import * as UploadedFileTypes from 'src/constants/uploaded-file-types'
import Waveform from 'components/waveform'
import DownloadButton from 'components/download-button'
import TranscriptionModal from 'components/communication/transcription-modal'

export default {
  name: 'communication-audio',

  mixins: [
    aclMixin,
    communicationInfoMixin
  ],

  components: {
    DownloadButton,
    Waveform,
    TranscriptionModal
  },

  props: {
    communication: {
      required: true
    },

    type: {
      required: true
    },

    uniqueId: {
      required: true
    }
  },

  data () {
    return {
      remoteUrl: null,
      downloadUrl: null,
      fileUuid: null,
      filename: '',
      loading: false,
      mimeType: '',
      UploadedFileTypes
    }
  },

  computed: {
    isMigrated () {
      return (this.type === this.UploadedFileTypes.TYPE_CALL_RECORDING) ? this.communication.recorded_file_is_migrated : this.communication.voicemail_is_migrated
    },

    hasAudio () {
      return (this.type === this.UploadedFileTypes.TYPE_CALL_RECORDING) ? this.communication.has_recording : this.communication.has_voicemail
    },

    isDeleted () {
      return (this.type === this.UploadedFileTypes.TYPE_CALL_RECORDING) ? this.communication.recording_is_deleted : false
    },

    title () {
      return (this.type === this.UploadedFileTypes.TYPE_CALL_RECORDING) ? 'Play Recording' : 'Play Voicemail'
    }
  },

  created () {
    this.onShow()
  },

  methods: {
    onShow () {
      if (this.hasAudio && !this.isDeleted) {
        this.loading = true
        this.remoteUrl = null
        this.downloadUrl = null
        const options = {
          params: {
            type: this.type
          }
        }
        this.$axios.get(`/api/v1/communication/${this.communication.id}/file-url`, options)
          .then((response) => {
            this.fileUuid = this.getUuidFromURL(response.data.download_url)
            this.filename = this.getFilenameFromURL(response.data.download_url)
            this.remoteUrl = response.data.url
            this.downloadUrl = response.data.download_url
            this.mimeType = response.data.mimetype || ''
          }).catch(err => {
            console.log(err)
            this.loading = false
            this.$handleErrors(err.response)
          })
      }
    },

    onDownload () {
      this.$downloadFileWithUuid(this.fileUuid, this.filename)
    }
  }
}
</script>
