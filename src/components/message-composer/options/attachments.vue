<template>
  <div class="attachment-wrapper"
       v-cloak
       data-testid="attachment-wrapper"
       @drop.prevent="onDrop"
       @dragover.prevent>

    <form class="mt-1" @click="onBrowse" data-testid="attachment-form">
      <b-form-group id="fileInput"
                    data-testid="attachment-form-group"
                    class="dragdrop">
        <div class="text-center uploader-label" data-testid="upload-attachment-browse">
          <upload-icon height="40" width="40" class="pb-2"></upload-icon>
          <p>Drop files to attach, or <span style="color: #256EFF;cursor: pointer" @click="onBrowse">Browse</span></p>
        </div>

        <input v-cloak
               multiple
               type="file"
               class="w-px h-px opacity-0 overflow-hidden absolute d-none"
               ref="file"
               data-testid="attachment-add-file-input"
               accept="audio/basic, audio/L24, audio/mp4, audio/mpeg, audio/ogg, audio/vnd.rn-realaudio, audio/vnd.wave, audio/3gpp, audio/3gpp2, audio/ac3, audio/vnd.wave, audio/webm, audio/amr-nb, audio/amr, video/mpeg, video/mp4, video/quicktime, video/webm, video/3gpp, video/3gpp2, video/3gpp-tt, video/H261, video/H263, video/H263-1998, video/H263-2000, video/H264, image/bmp, image/tiff, image/jpeg, image/jpg, image/gif, image/png, text/vcard, text/x-vcard, text/csv, text/rtf, text/richtext, text/calendar, text/directory, application/pdf, application/vcard"
               @change="onAdded" />
      </b-form-group>
      <b-progress v-if="isUploading && !hasError"
                  class="attachment-upload-progress"
                  variant="success"
                  data-testid="attachment-upload-progress"
                  :max="100">
        <b-progress-bar :value="uploadPercentage"
                        data-testid="attachment-upload-progress-bar"
                        :label="`${uploadPercentage}%`"/>
      </b-progress>
      <p v-if="hasError && !isUploading"
         data-testid="attachment-upload-error"
         class="error-notice">
        Error while uploading attachment...
      </p>
    </form>
    <div class="text-center mt-2 notice" data-testid="attachment-size-messages">
      <p class="mb-0"><a href="https://support.aloware.com/different-data-types-supported-in-aloware" target="_blank" data-testid="attachment-click-here">Click here</a> to see the supported media file list.</p>
      <p class="mb-0">Max. files size for images is 5MB</p>
      <p class="mb-0">Other file types should be below 600KB</p>
    </div>
  </div>
</template>

<script>
import UploadIcon from 'components/icons/upload-icon'
import { mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'

export default {
  name: 'attachments',

  components: {
    UploadIcon
  },

  props: {
    isBroadcast: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters('contacts', ['selectedLine'])
  },

  data () {
    return {
      isUploading: false,
      uploadPercentage: 0,
      files: [],
      selectedFiles: [],
      uploadedFiles: [],
      hasError: false
    }
  },

  methods: {
    onDrop (e) {
      this.selectedFiles = e.dataTransfer.files
    },

    onAdded () {
      this.selectedFiles = event.target.files
    },

    onUpload (file) {
      const formData = new FormData()
      formData.append('file', file)
      this.isUploading = true

      this.files.push(file)

      if (this.isBroadcast) {
        formData.append('is_broadcast', true)
      }

      talk2Api.V1.lines.fileUpload(this.selectedLine.id, formData, {
        onUploadProgress: function (progressEvent) {
          this.uploadPercentage = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100))
        }.bind(this)
      }).then(response => {
        this.hasError = false

        // collect all uploaded file to be used in updating text attachments
        this.uploadedFiles.push(response.data.uploaded_file)

        // get all files that are yet to be uploaded
        this.files = this.files.filter(file => file.name !== response.data.uploaded_file.original_file)

        // if all files are uploaded, the update the text attachments
        if (this.files.length === 0) {
          this.emitFileUploaded()
          this.isUploading = false
        }
      }).catch(error => {
        console.log(error)
        this.hasError = true
        this.isUploading = false
        this.files = []
        this.$handleErrors(error.response)
      })
    },

    emitFileUploaded () {
      this.$nextTick(() => {
        this.$emit('attachmentUploaded', this.uploadedFiles)
        this.$root.$emit('bv::hide::popover', 'attachment-popover')
      })
    },

    onBrowse () {
      this.$refs.file.click()
    }
  },

  watch: {
    selectedFiles: function () {
      if (this.selectedFiles) {
        const index = { i: 0 }
        for (index.i = 0; index.i < this.selectedFiles.length; index.i++) {
          this.onUpload(this.selectedFiles[index.i])
        }
      }
    }
  }
}
</script>
