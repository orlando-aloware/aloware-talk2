<template>
  <div class="pt-2 message-composer-fax-wrapper">
    <div v-if="validFax"
         class="d-inline-flex media-preview-wrapper">
      <div class="media-preview">
        <div class="pdf-thumbnail-wrapper">
          <div class="text-center media-icon-wrapper mt-2">
            <i class="far fa-file-pdf media-icon"></i>
          </div>
          <p class="ellipsis mt-1 text-center">{{ messageComposer.fax.filename }}</p>
          <b-button pill size="sm" class="btn-remove-attachments" @click="onRemoveFile"><i class="fa fa-times"></i></b-button>
        </div>
      </div>
    </div>
    <div v-if="!validFax"
         class="fax-file-wrapper cursor-pointer"
         @click="onBrowse"
         @drop.prevent="onDrop"
         @dragover.prevent>
      <form ref="faxForm">
        <b-form-group id="fileInput"
                      class="dragdrop">
          <div class="text-center uploader-label"
               v-if="!isUploading">
            <upload-icon height="20"
                         width="20"
                         class="pb-1">
            </upload-icon>
            <p class="text-xs mb-0">Drop PDF files here, or <span class="text-primary">Browse</span></p>
            <p class="text-xxs file-info">Maximum PDF file size is 8MB</p>
          </div>
          <div v-if="isUploading" class="text-center uploading-label pl-2 pr-2">
            <b-progress :max="100"
                        variant="success"
                        class="100">
              <b-progress-bar :value="uploadPercentage"
                              :label="`${uploadPercentage}%`">
              </b-progress-bar>
            </b-progress>
            <p class="mb-0">Uploading PDF File...</p>
          </div>
          <input v-if="!isUploading"
                 type="file"
                 class="w-px h-px opacity-0 overflow-hidden absolute d-none"
                 ref="file"
                 accept="application/pdf"
                 @change="onSelect"
                 v-cloak
                 multiple/>
        </b-form-group>
      </form>
    </div>
    <div class="pt-2 d-flex justify-between">
      <div></div>
      <q-btn color="primary"
             class="message-composer-send-button"
             :disable="isSending || !validFax"
             @click="send">
        <template slot="default">
          <q-spinner-bars v-if="isSending"
                          class="mr-1"
                          color="white">
          </q-spinner-bars>
          {{ isSending ? ' Sending Fax...' : 'Send Fax' }}
        </template>
      </q-btn>
    </div>
  </div>

</template>

<script>
import UploadIcon from 'components/icons/upload-icon'
import talk2Api from 'src/plugins/api/api'
import { mapActions, mapGetters } from 'vuex'
import * as CommunicationTypes from 'src/constants/communication-types'

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
      const formData = new FormData()
      formData.append('file', file)
      talk2Api.V1.lines.faxUpload(
        this.selectedLine.id,
        formData,
        {
          onUploadProgress: function (progressEvent) {
            this.uploadPercentage = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100))
          }.bind(this)
        }
      ).then(response => {
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

      const message = this.formatMessage()
      this.$emit('message-sent', {
        ...message,
        type: CommunicationTypes.FAX
      })

      return talk2Api.V1.lines.sendFax(this.selectedLine.id, this.contact.id, message)
        .then(response => {
          if (response.status === 201) {
            this.sendCallback()
            this.$generalNotification('Fax has been sent.')
          }
        }).catch(error => {
          console.log(error)
          this.$handleErrors(error.response)
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
