<template>
  <div class="pt-2">
    <div class="fax-file-wrapper cursor-pointer"
         @click="onBrowse"
         @drop.prevent="onDrop"
         @dragover.prevent>
      <form class="mt-1" ref="fax_form">
        <b-form-group id="fileInput" class="dragdrop">
          <div class="text-center uploader-label">
            <upload-icon class="pb-2"></upload-icon>
            <p>Drop files here, or <span style="color: #256EFF;">Browse</span></p>
          </div>
          <input v-cloak
                 multiple
                 type="file"
                 class="w-px h-px opacity-0 overflow-hidden absolute d-none"
                 ref="file"
                 accept="application/pdf"
                 @change="onSelect" />
        </b-form-group>
      </form>
    </div>
    <div class="pt-2">
      <p class="file-info">Upload PDF file <small>(Less than 8MB)</small></p>
      <b-progress v-if="is_uploading" :max="100" variant="success">
        <b-progress-bar :value="uploadPercentage" :label="`${uploadPercentage}%`"></b-progress-bar>
      </b-progress>
      <div v-if="message_composer.fax.filename" class="d-flex justify-content-between">
        <b-progress :max="100" variant="success" class="custom-progress-bar w-75">
          <b-progress-bar :value="100"></b-progress-bar>
        </b-progress>
        <b-link href="#" class="btn-remove-file" @click="onRemoveFile"><i class="far fa-times-circle"></i></b-link>
      </div>
    </div>
    <div class="pt-2 d-flex justify-between">
      <div></div>
      <b-button-group>
        <b-button variant="primary"
                  size="sm"
                  :disabled="!validFax"
                  v-on:click="send">
          <q-spinner-bars v-if="is_sending" color="white" />
          {{ is_sending ? 'Sending Fax...' : 'Send Fax' }}
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
    ...mapGetters('contacts', ['selected_line', 'contact', 'message_composer']),
    validFax () {
      return this.message_composer.fax.filename
    }
  },
  data () {
    return {
      uploadPercentage: 0,
      is_sending: false,
      is_uploading: false,
      files: [],
      selected_file: null,
      notifications: []
    }
  },
  methods: {
    ...mapActions('contacts', ['setMessageComposerFaxFilename', 'resetMessageComposerFax']),
    onRemoveFile () {
      this.setMessageComposerFaxFilename('')
    },
    onDrop (e) {
      this.selected_file = e.dataTransfer.files
    },
    onBrowse () {
      this.$refs.file.click()
    },
    onSelect (e) {
      this.selected_file = event.target.files
    },
    onUpload (file) {
      this.is_uploading = true
      let formData = new FormData()
      formData.append('file', file)
      talk2Api.V1.lines.pdfUpload(
        this.selected_line.id,
        formData,
        {
          onUploadProgress: function (progressEvent) {
            this.uploadPercentage = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100))
          }.bind(this)
        }
      )
        .then(response => {
          this.setMessageComposerFaxFilename(response.data.file_name)
        }).finally(() => {
          this.is_uploading = false
        })
    },
    sendCallback () {
      this.resetMessageComposerFax()
      this.$refs.fax_form.reset()
      this.notifications = []
    },
    formatMessage () {
      return {
        file_name: this.message_composer.fax.filename,
        phone_number: this.message_composer.phone_number
      }
    },
    send () {
      this.is_sending = true
      return talk2Api.V1.lines.sendFax(this.selected_line.id, this.contact.id, this.formatMessage())
        .then(response => {
          if (response.status === 201) {
            this.sendCallback()
          }
        }).catch(error => {
          console.log(error)
          this.$q.notify({
            message: 'Error while sending fax.',
            type: 'negative',
            textColor: 'white',
            actions: [
              {
                icon: 'close'
              }
            ]
          })
        }).finally(() => {
          this.is_sending = false
        })
    }
  },
  watch: {
    selected_file: function () {
      if (this.selected_file) {
        this.onUpload(this.selected_file[0])
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .file-info {
    font-size: 12px;
    margin-bottom: 0 !important;
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

</style>
