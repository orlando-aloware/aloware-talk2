<template>
  <div class="attachment-wrapper file-uploader-wrapper"
       v-cloak
       @drop.prevent="onDrop"
       @dragover.prevent>

    <form class="mt-1" @click="onBrowse">
      <b-form-group id="fileInput"
                    class="dragdrop">
        <div class="text-center uploader-label">
          <upload-icon height="40" width="40" class="pb-2"></upload-icon>
          <p>Drop files to attach, or <span style="color: #256EFF;cursor: pointer" @click="onBrowse">Browse</span></p>
        </div>

        <input v-cloak
               type="file"
               class="w-px h-px opacity-0 overflow-hidden absolute d-none"
               ref="file"
               :accept="acceptedFileTypes"
               @change="onAdded" />
      </b-form-group>
      <b-progress v-if="isUploading && !hasError"
                  class="attachment-upload-progress"
                  variant="success"
                  :max="100">
        <b-progress-bar :value="uploadPercentage"
                        :label="`${uploadPercentage}%`"/>
      </b-progress>
      <p v-if="hasError && !isUploading"
         class="error-notice">
        Error while uploading attachment...
      </p>
    </form>
    <slot name="description"></slot>
  </div>
</template>

<script>
import UploadIcon from 'components/icons/upload-icon'

export default {
  name: 'file-uploader',
  components: { UploadIcon },
  props: {
    acceptedFileTypes: {
      type: String,
      default: 'audio/basic, audio/L24, audio/mp4, audio/mpeg, audio/ogg, audio/vnd.rn-realaudio, audio/vnd.wave, audio/3gpp, audio/3gpp2, audio/ac3, audio/vnd.wave, audio/webm, audio/amr-nb, audio/amr, video/mpeg, video/mp4, video/quicktime, video/webm, video/3gpp, video/3gpp2, video/3gpp-tt, video/H261, video/H263, video/H263-1998, video/H263-2000, video/H264, image/bmp, image/tiff, image/jpeg, image/jpg, image/gif, image/png, text/vcard, text/x-vcard, text/csv, text/rtf, text/richtext, text/calendar, text/directory, application/pdf, application/vcard'
    },
    uploadUrl: {
      type: String,
      required: true
    },
    multiple: {
      type: Boolean,
      default: false
    }
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

      window.axios.post(this.uploadUrl, formData, {
        onUploadProgress: function (progressEvent) {
          this.uploadPercentage = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100))
        }.bind(this)
      }).then(response => {
        this.hasError = false

        // collect all uploaded file
        this.uploadedFiles.push(response.data)
        this.emitFileUploaded()
        this.isUploading = false
      }).catch(error => {
        console.log(error)
        this.hasError = true
        this.isUploading = false
        this.files = []
      })
    },
    emitFileUploaded () {
      this.$nextTick(() => {
        this.$emit('fileUploaded', !this.multiple ? this.uploadedFiles[0] : this.uploadedFiles)
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
