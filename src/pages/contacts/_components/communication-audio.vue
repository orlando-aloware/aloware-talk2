<template>
  <div>
    <q-btn id="audio-btn"
           size="sm"
           type="text text-dark-greenish m-0 p-0"
           v-if="hasAudio">
      <i class="fa fa-play"></i>
      <span class="ml-1">{{ title }}</span>
    </q-btn>
    <b-popover v-model="isOpen"
               target="audio-btn"
               triggers="click blur"
               :placement="popoverDirection"
               boundary="window"
               custom-class="v-c"
               delay="100"
               @show="onShow"
               @hide="onHide">
      <template v-if="remoteUrl && isOpen">
        <div class="d-flex flex-column width-300 fixed">
          <div class="row">
            <div class="col-12">
              <waveform :remoteUrl="remoteUrl"></waveform>
            </div>
          </div>
          <div class="row mt-2">
            <div class="col-12">
              <a class="btn btn-block btn-primary _600"
                 title="Download"
                 target="_blank"
                 role="button"
                 :href="downloadUrl"
                 download
                 @click="blur">
                Download recording
              </a>
            </div>
          </div>
        </div>
      </template>
    </b-popover>

    <span class="text-grey-900"
          v-if="!hasAudio">-</span>
  </div>
</template>

<script>
import auth from 'boot/auth'
import { aclMixin } from 'src/plugins/mixins'
import * as UploadedFileTypes from 'src/constants/uploaded-file-types'
import Waveform from 'src/pages/contacts/_components/waveform'
export default {
  name: 'communication-audio',

  mixins: [aclMixin],

  components: { Waveform },

  props: {
    communication: {
      required: true
    },

    type: {
      required: true
    },

    popoverDirection: {
      required: false,
      type: String,
      default: 'bottom-top'
    }
  },

  data () {
    return {
      auth: auth,
      isOpen: false,
      remoteUrl: null,
      downloadUrl: null,
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

  methods: {
    onHide () {
      this.remoteUrl = null
      this.downloadUrl = null
    },

    onShow () {
      if (this.hasAudio) {
        this.remoteUrl = null
        this.downloadUrl = null
        let options = {
          params: {
            type: this.type
          }
        }
        this.$axios.get(`/api/v1/communication/${this.communication.id}/file-url`, options).then((response) => {
          this.remoteUrl = response.data.url
          this.downloadUrl = response.data.download_url
        })
      }
    },

    closePopover () {
      this.isOpen = false
    },

    blur ($event) {
      $event.target.blur()
      setTimeout(() => {
        this.closePopover()
      }, 25)
    }
  }
}
</script>
