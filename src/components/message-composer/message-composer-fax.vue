<template>
  <div class="pt-2">
    <div v-if="validFax" class="d-inline-flex media-preview-wrapper">
      <div class="media-preview">
        <div class="pdf-thumbnail-wrapper">
          <div class="text-center media-icon-wrapper mt-2">
            <i class="far fa-file-pdf media-icon"></i>
          </div>
          <p class="ellipsis mt-1 text-center">{{ messageComposer.fax.filename }}</p>
          <b-button pill size="sm" class="btn-remove-attachments" v-on:click="onRemoveFile"> <i class="fa fa-times"></i> </b-button>
        </div>
      </div>
    </div>
    <div v-if="!validFax" class="fax-file-wrapper cursor-pointer"
         @click="onBrowse"
         @drop.prevent="onDrop"
         @dragover.prevent>
      <form ref="faxForm">
        <b-form-group id="fileInput" class="dragdrop">
          <div class="text-center uploader-label" v-if="!isUploading">
            <upload-icon height="32" width="32" class="pb-1"></upload-icon>
            <p class="mb-0">Drop PDF files here, or <span style="color: #256EFF;">Browse</span></p>
            <p class="file-info">Maximum PDF file size is 8MB</p>
          </div>
          <div v-if="isUploading" class="text-center uploading-label pl-2 pr-2">
            <b-progress :max="100" variant="success" class="100">
              <b-progress-bar :value="uploadPercentage" :label="`${uploadPercentage}%`"></b-progress-bar>
            </b-progress>
            <p class="mb-0">Uploading PDF File...</p>
          </div>
          <input v-if="!isUploading"
                 v-cloak
                 multiple
                 type="file"
                 class="w-px h-px opacity-0 overflow-hidden absolute d-none"
                 ref="file"
                 accept="application/pdf"
                 @change="onSelect" />
        </b-form-group>
      </form>
    </div>
    <div class="pt-2 d-flex justify-between">
      <div></div>
      <b-button-group>
        <b-button variant="primary"
                  class="fs-13 pl-3 pr-3"
                  size="sm"
                  :disabled="isSending || !validFax"
                  v-on:click="send">
          <q-spinner-bars v-if="isSending" color="white" />
          {{ isSending ? 'Sending Fax...' : 'Send Fax' }}
        </b-button>
      </b-button-group>
    </div>
  </div>

</template>

<script>
import UploadIcon from 'components/icons/upload-icon'
import talk2Api from 'src/plugins/api/api'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'message-composer-fax',

  components: { UploadIcon },
  computed: {
    ...mapGetters('contacts', ['selectedLine', 'contact', 'messageComposer']),
    validFax () {
      return this.messageComposer.fax.filename
    }
  },
  data () {
    return {
      uploadPercentage: 0,
      isSending: false,
      isUploading: false,
      files: [],
      selectedFile: null,
      notifications: []
    }
  },
  methods: {
    ...mapActions('contacts', ['setMessageComposerFaxFilename', 'resetMessageComposerFax']),
    onRemoveFile () {
      this.setMessageComposerFaxFilename('')
    },
    onDrop (e) {
      this.selectedFile = e.dataTransfer.files
    },
    onBrowse () {
      this.$refs.file.click()
    },
    onSelect (e) {
      this.selectedFile = event.target.files
    },
    onUpload (file) {
      this.isUploading = true
      let formData = new FormData()
      formData.append('file', file)
      talk2Api.V1.lines.pdfUpload(
        this.selectedLine.id,
        formData,
        {
          onUploadProgress: function (progressEvent) {
            this.uploadPercentage = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100))
          }.bind(this)
        }
      )
        .then(response => {
          this.setMessageComposerFaxFilename(response.data.file_name)
          this.$refs.faxForm.reset()
        }).finally(() => {
          this.isUploading = false
        })
    },
    sendCallback () {
      this.resetMessageComposerFax()
      this.notifications = []
    },
    formatMessage () {
      return {
        file_name: this.messageComposer.fax.filename,
        phone_number: this.messageComposer.phone_number
      }
    },
    send () {
      this.isSending = true
      return talk2Api.V1.lines.sendFax(this.selectedLine.id, this.contact.id, this.formatMessage())
        .then(response => {
          if (response.status === 201) {
            this.sendCallback()
            this.$q.notify({
              message: 'Fax has been sent.',
              type: 'positive',
              textColor: 'white',
              position: 'bottom-right'
            })
          }
        }).catch(error => {
          console.log(error)
          this.$q.notify({
            message: 'Error while sending fax.',
            type: 'negative',
            textColor: 'white',
            position: 'bottom-right'
          })
        }).finally(() => {
          this.isSending = false
        })
    }
  },
  watch: {
    selectedFile: function () {
      if (this.selectedFile) {
        this.onUpload(this.selectedFile[0])
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .file-info {
    font-size: 12px;
    margin-bottom: 0 !important;
    font-weight: normal;
  }

  .custom-progress-bar {
    width: 97% !important;
    height: 4px !important;
    margin-top: 10px;

    div.progress-bar{
      background-color: #D8D8D8 !important;
    }
  }

  .btn-remove-file {
    color: #62666E;
  }

  .media-preview-wrapper {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0;
    padding-right: 1px;

    .media-preview {
      position: relative;

      .btn-remove-attachments {
        position: absolute;
        top: 6px;
        right: 6px;
        padding: 0.015rem 0.2rem;
        font-size: 50%;
        opacity: 0;
      }

      .pdf-thumbnail-wrapper {
        padding: 4px;
        width: 100px;
        height: 76px;
        border-radius: 8px;
        border: 1px solid #EBEBEB;

        i.media-icon {
          color: #FE2216;
        }

        p {
          font-size: 10px;
          max-width: 90px;
        }

        .pdf-preview {
          overflow: hidden !important;
        }
      }
    }

    .media-preview:hover{
      .btn-remove-attachments {
        opacity: 1;
      }
    }

    .media-icon-wrapper {
      height: 42px;
      width: 42px;
      background: #EBEBEB;
      border-radius: 6px;
      text-align: center;
      margin: auto;

      i.media-icon {
        margin-top: 10px;
        font-size: 20px;
        color: #B5B7BB;;
      }
    }

  }

</style>
