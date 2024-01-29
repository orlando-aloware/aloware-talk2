<template>
  <div>
    <b-form-row class="mt-4"
                v-if="voicemailDropFiles.length > 0">
      <b-col sm="12" md="12">
        <b-table-simple :fields="table.fields">
          <b-thead>
            <b-tr>
              <b-th>Name</b-th>
              <b-th>Audio</b-th>
              <b-th></b-th>
            </b-tr>
          </b-thead>
          <b-tbody>
            <b-tr v-for="file in voicemailDropFiles" :key="file.id">
              <b-td><div class="mt-3">{{ file.name }}</div></b-td>
              <b-td>
                <audio controls>
                  <source :src="`${baseUrl}/static/uploaded_file/${file.uploaded_file.uuid}`">

                  Your browser does not support the audio element.
                </audio>
              </b-td>
              <b-td>
                <div class="mt-3">
<!--                  <b-button variant="primary" size="sm">Edit</b-button>-->
                  <b-button variant="danger" size="sm" class="ml-2" @click="deleteVMDropFile(file)">Remove</b-button>
                </div>
              </b-td>
            </b-tr>
          </b-tbody>
        </b-table-simple>
        <hr/>
      </b-col>
    </b-form-row>
    <b-form-row class="mt-4" v-if="vmDropUploadedFile.id">
      <b-col sm="12" md="12">
        <b-form-group
          label=""
        >
          <b-form-input
            type="text"
            placeholder="Voicemail Drop Title"
            v-model="vmDropUploadedFile.title">
          </b-form-input>
        </b-form-group>
      </b-col>
      <b-col sm="12" md="12" class="d-flex justify-content-between">
        <span>{{ vmDropUploadedFile.fileName }}</span>
        <b-form-group label="">
          <b-button variant="success"
                    :disabled="!vmDropUploadedFile.title" @click="addUploadedFile">
            <i class="fa fa-plus"></i> Add
          </b-button>
          <b-button variant="danger"
                    class="ml-2"
                    @click="removeUploadedFile">
            <i class="fa fa-times"></i> Remove
          </b-button>
        </b-form-group>
      </b-col>
    </b-form-row>
    <b-form-row class="mt-4">
      <b-col sm="12" md="12" v-if="!vmDropUploadedFile.id">
        <b-card-group deck class="mb-4">
          <audio-recorder :upload-url="vmDropUploadUrl"
                          @recordedAudioUploaded="applyVMDropAudioFile">
          </audio-recorder>

          <b-card title="Upload an audio file"
                  header-tag="header"
                  footer-tag="footer">
            <file-uploader accepted-file-types=".mp3, .wav"
                           :upload-url="vmDropUploadUrl"
                           @fileUploaded="fileUploaded">
              <template slot="description">
                <div class="text-center mt-2 notice">
                  <p class="mb-0">Supports MP3/WAV only.</p>
                  <p class="mb-0">Max. files size for images is 8MB</p>
                </div>
              </template>
            </file-uploader>
          </b-card>
        </b-card-group>
      </b-col>
    </b-form-row>
  </div>
</template>

<script>
import AudioRecorder from 'components/audio-recorder'
import FileUploader from 'components/file-uploader'
import talk2Api from 'src/plugins/api/api'
import { kycMixin } from 'src/plugins/mixins'

export default {
  name: 'user-vm-drop-library',

  mixins: [ kycMixin ],

  components: { FileUploader, AudioRecorder },

  props: {
    user: {
      required: true
    }
  },

  computed: {
    vmDropUploadUrl () {
      return `${window.axios.defaults.baseURL}/api/v1/user/pre-recorded-voicemail`
    },
    baseUrl () {
      return window.axios.defaults.baseURL
    }
  },

  data () {
    return {
      isLoadingLibrary: false,
      vmDropUploadedFile: {
        id: null,
        title: '',
        fileName: '',
        user_id: this.user.id
      },
      voicemailDropFiles: [],
      table: {
        fields: ['Title', 'Audio', '']
      }
    }
  },

  methods: {
    getLibrary () {
      this.isLoadingLibrary = true
      return talk2Api.V1.library.voicemailDrop.get({ params: { user_id: this.user.id } }).then(response => {
        this.voicemailDropFiles = response.data
        this.isLoadingLibrary = false
      }).catch(err => {
        console.log(err)
        this.$handleErrors(err.response)
        this.isLoadingLibrary = false
      })
    },
    applyVMDropAudioFile (file) {
      this.vmDropUploadedFile.id = file.id
      this.vmDropUploadedFile.fileName = file.uid
    },
    fileUploaded (file) {
      this.vmDropUploadedFile.id = file.id
      this.vmDropUploadedFile.fileName = file.file_name
    },

    addUploadedFile () {
      talk2Api.V1.library.voicemailDrop.create({
        user_id: this.user.id,
        vm_drop_file_title: this.vmDropUploadedFile.title,
        uploaded_file_id: this.vmDropUploadedFile.id
      }).then(response => {
        this.resetUploadedFile()
        this.getLibrary()
        this.$generalNotification('Voicemail drop has been added to your library.', 'success')
      }).catch(err => {
        console.log(err)
        this.$handleErrors(err.response)
      })
    },

    removeUploadedFile () {
      this.resetUploadedFile()
    },

    resetUploadedFile () {
      this.vmDropUploadedFile = { ...this.vmDropUploadedFile, id: null, title: '', fileName: '' }
    },

    deleteVMDropFile (file) {
      talk2Api.V1.library.voicemailDrop.delete(file.id).then(response => {
        this.voicemailDropFiles = this.voicemailDropFiles.filter(item => item.id !== file.id)
        this.$generalNotification('Voicemail drop has been successfully removed from your library.', 'success')
      })
    }
  },
  mounted () {
    this.getLibrary()
  }
}
</script>
