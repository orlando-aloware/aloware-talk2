<template>
  <div class="row no-wrap q-pa-md text-center">
    <b-col sm="12"
           md="12"
           v-if="user?.profile?.contact_card_phone_number === null">
      <div class="mt-2 notice" data-testid="add-contact-card-message">
        <p class="mb-0 text-justify">
          You don’t have any number linked on this contact card.<br>
          <router-link
            :to="{ path: '/settings/profile' }"
            @click.native="onContactCardLinkClicked"
          >
            Click here
          </router-link>
          to view the settings for the name and phone number(s) for your contact.
        </p>
      </div>
    </b-col>
    <b-col sm="12" md="12">
      <button class="btn btn-sm btn-primary mt-2"
              data-testid="add-contact-card-button"
              @click="onContactCardSelected">
        Send contact
      </button>
    </b-col>

    <b-col sm="12" md="12">
      <b-progress class="add-contact-card-progress mt-2"
                  variant="success"
                  data-testid="add-contact-card-progress"
                  :max="100"
                  v-if="isUploading && !hasError">
        <b-progress-bar data-testid="add-contact-card-progress-bar"
                        :value="uploadPercentage"
                        :label="`${uploadPercentage}%`"/>
      </b-progress>
      <p data-testid="add-contact-card-error"
         class="error-notice mt-2"
         v-if="hasError && !isUploading">
        Error while generating contact card...
      </p>
    </b-col>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'

const DEFAULT_CONTACT_NAME = 'contact-card'
const VCARD_TEMPLATE = (name, phone) => [
  'BEGIN:VCARD',
  'VERSION:3.0',
  `FN:${name}`,
  `TEL:${phone}`,
  'END:VCARD'
].join('\r\n')

export default {
  name: 'ContactCard',

  props: {
    selectedLine: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      isUploading: false,
      uploadPercentage: 0,
      hasError: false
    }
  },

  computed: {
    ...mapGetters('auth', ['user']),

    contactCardName () {
      return this.user?.profile?.contact_card_name || DEFAULT_CONTACT_NAME
    }
  },

  methods: {
    onContactCardLinkClicked () {
      this.$emit('closeMenu')
    },

    onContactCardSelected () {
      const file = this.generateContactCard()
      this.uploadVCard(file)
    },

    generateContactCard () {
      const vCardData = VCARD_TEMPLATE(
        this.user?.profile?.contact_card_name || '',
        this.user?.profile?.contact_card_phone_number || ''
      )

      const fileName = `${this.contactCardName.toLowerCase().replace(/\s+/g, '-')}.vcf`
      const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' })

      return new File([blob], fileName, { type: 'text/vcard;charset=utf-8' })
    },

    uploadVCard (file) {
      const formData = new FormData()
      formData.append('file', file)

      this.isUploading = true
      this.uploadPercentage = 0

      talk2Api.V1.lines.fileUpload(this.selectedLine.id, formData, {
        onUploadProgress: (progressEvent) => {
          this.uploadPercentage = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100))
        }
      })
        .then(response => {
          this.isUploading = false
          this.hasError = false
          this.uploadPercentage = 100

          this.$emit('contactCardUploaded', [response.data.uploaded_file])
          this.$emit('closeMenu')
        })
        .catch(error => {
          console.error('Error uploading vCard:', error)
          this.isUploading = false
          this.hasError = true
          this.$handleErrors(error.response)
        })
    }
  }
}
</script>
