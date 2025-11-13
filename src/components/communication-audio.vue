<template>
  <div class="w-100" data-testid="comm-audio-wrapper">
    <div v-if="showAudioPlayer">
      <div class="audio-player p-2">
        <div class="d-flex flex-row align-items-center w-100"
             v-if="remoteUrl">
          <waveform :remoteUrl="remoteUrl"
                    :uniqueId="uniqueId"
                    data-testid="communication-audio-waveform"
                    @ready="loading = false">
          </waveform>
          <download-button
            v-if="fileUuid && isMigrated"
            data-testid="communication-audio-download-button"
            is-simple
            :communication-id="communication.id"
            :filename="filename"
            :file-mime-type="mimeType"
            :file-uuid="fileUuid"/>
          <transcription-modal
            v-if="!communication?.transcription_is_deleted && communication?.has_transcription"
            button-text="Show Transcription"
            data-testid="communication-audio-transcription-modal"
            ref="transcriptionModal"
            :communication="communication"
            :contact="contact"
            :type="type"
            :single-button="true"/>
          <generate-transcription-button class="mr-2"
                                         variant="icon"
                                         data-testid="comm-details-generate-transcription-icon-button"
                                         :communication="communication"
                                         v-if="fileUuid && isMigrated">
          </generate-transcription-button>
        </div>
        <p class="text-black _600"
           v-if="fileUuid && !isMigrated">
          We are processing the {{ typeString | toLowerCase }}. It will be shortly available for download.
        </p>
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
import { aclMixin, communicationInfoMixin } from 'src/plugins/mixins'
import * as UploadedFileTypes from 'src/constants/uploaded-file-types'
import Waveform from 'components/waveform'
import DownloadButton from 'components/download-button'
import TranscriptionModal from 'components/communication/transcription-modal'
import GenerateTranscriptionButton from 'components/generate-transcription-button'

export default {
  name: 'communication-audio',

  mixins: [
    aclMixin,
    communicationInfoMixin
  ],

  components: {
    DownloadButton,
    Waveform,
    TranscriptionModal,
    GenerateTranscriptionButton
  },

  props: {
    communication: {
      type: Object,
      required: true
    },

    contact: {
      type: Object,
      required: false
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
      mimeType: '',
      isMigrated: false,
      loading: false,
      UploadedFileTypes
    }
  },

  computed: {
    hasAudio () {
      return (this.type === this.UploadedFileTypes.TYPE_CALL_RECORDING) ? this.communication.has_recording : this.communication.has_voicemail
    },

    isDeleted () {
      return (this.type === this.UploadedFileTypes.TYPE_CALL_RECORDING) ? this.communication.recording_is_deleted : false
    },

    typeString () {
      return (this.type === this.UploadedFileTypes.TYPE_CALL_RECORDING) ? 'Recording' : 'Voicemail'
    },

    title () {
      return 'Play ' + this.typeString
    },

    shouldShowVoicemail () {
      return this.type !== this.UploadedFileTypes.TYPE_CALL_RECORDING || !this.communication?.has_voicemail
    },

    showAudioPlayer () {
      return !this.isDeleted && this.hasAudio && this.shouldShowVoicemail
    }
  },

  created () {
    this.onShow()

    // Listen for file migration complete broadcast
    this.$VueEvent.listen('communication.file.migrated', (event) => {
      if (event.communication_id === this.communication.id && event.file_type === this.type) {
        this.fetchFileUrl()
      }
    })
  },

  beforeDestroy () {
    this.$VueEvent.stop('communication.file.migrated')
  },

  methods: {
    updateFileData (data) {
      console.log('Updating file data:', data)
      this.fileUuid = this.getUuidFromURL(data.download_url)
      this.filename = this.getFilenameFromURL(data.download_url)
      this.remoteUrl = data.url
      this.downloadUrl = data.download_url
      this.mimeType = data.mimetype || ''
      this.isMigrated = data.is_migrated
      this.$emit('audio-file-updated', {
        fileUuid: this.fileUuid,
        isMigrated: this.isMigrated
      })
    },

    fetchFileUrl () {
      const options = {
        params: {
          type: this.type
        }
      }
      this.$axios.get(`/api/v1/communication/${this.communication.id}/file-url`, options)
        .then((response) => {
          this.updateFileData(response.data)
        }).catch(err => {
          console.log(err)
          this.loading = false
          this.$handleErrors(err.response)
        })
    },

    onShow () {
      if (this.hasAudio && !this.isDeleted) {
        this.loading = true
        this.remoteUrl = null
        this.downloadUrl = null
        this.fetchFileUrl()
      }
    },

    onDownload () {
      this.$downloadFileWithUuid(this.fileUuid, this.filename)
    }
  }
}
</script>
