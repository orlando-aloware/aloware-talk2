<template>
  <div class="row no-wrap q-pa-md text-center">
    <b-col sm="12" md="12">
      <div class="mt-2 notice" data-testid="add-contact-card-message">
        <p>
          <router-link :to="{ path: '/settings/profile' }"
                       @click.native="onContactCardLinkClicked">
            Click here
          </router-link>
          to change the name/phone number of the contact card
        </p>
      </div>
    </b-col>

    <b-col sm="12" md="12">
      <q-select use-input
                dense
                outlined
                input-debounce="100"
                option-value="id"
                option-label="name"
                behavior="menu"
                label="Select type"
                :options="contactCardTypes"
                v-model="type">
      </q-select>
    </b-col>

    <b-col sm="12" md="12">
      <button class="btn btn-sm btn-primary mt-2"
              data-testid="add-contact-card-button"
              :disabled="type === ''"
              @click="onContactCardSelected">
        Send {{  type.name?.toLowerCase() }} card as .vcf file
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
        Error while generating {{ type.name?.toLowerCase() }} card...
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
      hasError: false,
      contactCardTypes: [
        { id: 'contact', name: 'Contact' },
        { id: 'company', name: 'Company' }
      ],
      type: ''
    }
  },

  computed: {
    ...mapGetters('auth', ['user']),

    contactCardName () {
      return this.type.id === 'contact'
        ? this.user?.profile?.contact_card_name
        : this.user?.profile?.company_contact_card_name || DEFAULT_CONTACT_NAME
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
      const vCardData = this.type.id === 'contact'
        ? VCARD_TEMPLATE(
        this.user?.profile?.contact_card_name || '',
        this.user?.profile?.contact_card_phone_number || ''
        )
        : VCARD_TEMPLATE(
        this.user?.profile?.company_contact_card_name || '',
        this.user?.profile?.company_contact_card_phone_number || ''
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
