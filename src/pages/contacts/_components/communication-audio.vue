<template>
  <div class="pb-2 w-100"
       :class="[ hasAudio ? 'mb-1' : '' ]">
    <div v-if="hasAudio">
      <div class="audio-player p-2 d-flex justify-center position-relative">
        <q-spinner-bars color="success"
                        size="28px"
                        class="position-absolute"
                        v-if="loading"/>
        <div class="d-flex flex-row align-items-center w-100"
             v-if="remoteUrl">
          <waveform :remoteUrl="remoteUrl"
                    :uniqueId="uniqueId"
                    @ready="loading = false"></waveform>
          <a class="btn btn-inline p-0"
             title="Download"
             target="_blank"
             role="button"
             :href="downloadUrl"
             download
             @click="blur">
            <download-icon height="16"
                           width="16">
            </download-icon>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { aclMixin } from 'src/plugins/mixins'
import * as UploadedFileTypes from 'src/constants/uploaded-file-types'
import Waveform from 'src/pages/contacts/_components/waveform'
import DownloadIcon from 'components/icons/contact-activity/download-icon'
export default {
  name: 'communication-audio',

  mixins: [aclMixin],

  components: { DownloadIcon, Waveform },

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
      loading: false,
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

    title () {
      return (this.type === this.UploadedFileTypes.TYPE_CALL_RECORDING) ? 'Play Recording' : 'Play Voicemail'
    }
  },

  created () {
    this.onShow()
  },

  methods: {
    onShow () {
      if (this.hasAudio) {
        this.loading = true
        this.remoteUrl = null
        this.downloadUrl = null
        let options = {
          params: {
            type: this.type
          }
        }
        this.$axios.get(`/api/v1/communication/${this.communication.id}/file-url`, options)
          .then((response) => {
            this.remoteUrl = response.data.url
            this.downloadUrl = response.data.download_url
          }).catch(err => {
            console.log(err)
            this.loading = false
          })
      }
    },

    blur ($event) {
      $event.target.blur()
    }
  }
}
</script>

<style lang="scss" scoped>
  .audio-player {
    min-height: 42px;
  }
</style>
