<template>
  <div class="attachment-wrapper"
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
               multiple
               type="file"
               class="w-px h-px opacity-0 overflow-hidden absolute d-none"
               ref="file"
               accept=".pdf,.jpg,.jpeg,.png,.pdf,.mp4,.amr"
               @change="onAdded" />
      </b-form-group>
      <b-progress v-if="isUploading"
                  class="attachment-upload-progress"
                  variant="success"
                  :max="100">
        <b-progress-bar :value="uploadPercentage"
                        :label="`${uploadPercentage}%`"/>
      </b-progress>
      <p v-if="hasError"
         class="error-notice">
        Error while uploading attachment...
      </p>
    </form>
    <div class="text-center mt-4 notice">
      <p class="mb-0"><a href="https://www.twilio.com/docs/sms/accepted-mime-types#accepted-mime-types" target="_blank">Click here</a> to see the supported media file list.</p>
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
  components: { UploadIcon },
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
      let formData = new FormData()
      formData.append('file', file)
      this.isUploading = true

      this.files.push(file)

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
      }).finally(() => {

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
        for (let i = 0; i < this.selectedFiles.length; i++) {
          this.onUpload(this.selectedFiles[i])
        }
      }
    }
  }
}
</script>
