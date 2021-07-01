<template>
  <div class="attachment-wrapper" v-cloak
       @drop.prevent="onDrop"
       @dragover.prevent>

    <form class="mt-1" @click="onBrowse">
      <b-form-group id="fileInput" class="dragdrop">
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

    <b-progress v-if="is_uploading" :max="100" variant="success">
      <b-progress-bar :value="uploadPercentage" :label="`${uploadPercentage}%`"></b-progress-bar>
    </b-progress>
    <p v-if="has_error" class="error-notice">Error while uploading attachment...</p>
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
    ...mapGetters('contacts', ['selected_line'])
  },
  data () {
    return {
      is_uploading: false,
      uploadPercentage: 0,
      files: [],
      selected_files: [],
      has_error: false
    }
  },
  methods: {
    onDrop (e) {
      this.selected_files = e.dataTransfer.files
    },
    onAdded () {
      this.selected_files = event.target.files
    },
    onUpload (file) {
      let formData = new FormData()
      formData.append('file', file)
      this.is_uploading = true
      talk2Api.V1.lines.fileUpload(this.selected_line.id, formData, {
        onUploadProgress: function (progressEvent) {
          this.uploadPercentage = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100))
        }.bind(this)
      }).then(response => {
        this.has_error = false
        this.emitFileUploaded(response.data.uploaded_file)
      }).catch(error => {
        console.log(error)
        this.has_error = true
      }).finally(() => {
        this.is_uploading = false
      })
    },
    emitFileUploaded (fileData) {
      this.$nextTick(() => {
        this.$emit('attachmentUploaded', fileData)
        this.$root.$emit('bv::hide::popover', 'attachment-popover')
      })
    },
    onBrowse () {
      this.$refs.file.click()
    }
  },
  watch: {
    selected_files: function () {
      if (this.selected_files) {
        for (let i = 0; i < this.selected_files.length; i++) {
          this.onUpload(this.selected_files[i])
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
