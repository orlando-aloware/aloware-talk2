<template>
  <div class="attachment-wrapper"
       v-cloak
       @drop.prevent="onDrop"
       @dragover.prevent>

    <form class="mt-1" @click="onBrowse">
      <b-form-group id="fileInput"
                    class="dragdrop">
        <div class="text-center uploader-label">
          <upload-icon class="pb-2"></upload-icon>
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
    </form>

    <b-progress v-if="isUploading"
                variant="success"
                :max="100">
      <b-progress-bar :value="uploadPercentage"
                      :label="`${uploadPercentage}%`"/>
    </b-progress>
    <p v-if="hasError"
       class="error-notice">
      Error while uploading attachment...
    </p>
    <div class="text-center mt-3 notice">
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

<style lang="scss">
.attachment-wrapper {
  height: 215px;
  width: 362px;
  border: 1px dashed #D8D8D8;
  border-radius: 4px;
  padding: 10px;

  #fileInput {
    position: relative;
  }

  .uploader-label {
    position: absolute;
    width: 100%;
    top: 15px;
    font-size: 14px;
    font-weight: 500;
  }

  form {
    height: 14vh;
    cursor: pointer;
  }

  #fileInput.dragdrop .custom-file,
  #fileInput.dragdrop .custom-file-input {
    height: 100px;
  }

  #fileInput.dragdrop .custom-file-label {
    height: 100px;
    line-height: 90px;
    text-align: center;
    padding: 0;
    border: none !important;
    background: transparent;
  }

  #fileInput.dragdrop .custom-file-label span {
    visibility: hidden;
  }

  #fileInput.dragdrop .custom-file-label::after {
    display: none;
  }

  .notice {
    font-size: 12px;
  }

  [v-cloak] {
    display: none;
  }

  .error-notice {
    text-align: center;
    color: #721c24;
    font-size: 80%;
  }
}
</style>
