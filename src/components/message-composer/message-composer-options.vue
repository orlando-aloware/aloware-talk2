<template>
  <div class="message-options" data-testid="message-composer-o">
    <b-link v-if="messageComposer.mode === 'sms'"
            href="#"
            data-testid="add-gif-image-butto "
            :disabled="isTextingDisabled || !canAddMoreAttachments">
      <q-menu content-class="mx-height-500"
              ref="giphyMenu"
              data-testid="add-gif-image-menu"
              :offset="[0,5]">
        <div class="row no-wrap q-pa-md">
          <search-giphy data-testid="message-search-giphy" @selected="onGifSelected"></search-giphy>
        </div>
      </q-menu>

      <gif-icon></gif-icon>
      <q-tooltip data-testid="add-gif-image-tooltip">
        Add Gif image
      </q-tooltip>
    </b-link>

    <b-link v-if="messageComposer.mode === 'sms'"
            href="#"
            data-testid="sms-upload-attachment-link"
            :disabled="!selectedLine || isTextingDisabled || !canAddMoreAttachments">
      <q-menu ref="attachmentMenu"
              data-testid="sms-upload-attachment-menu"
              :offset="[0,5]">
        <div class="row no-wrap q-pa-md">
          <attachments :is-broadcast="isBroadcast"
                       data-testid="sms-upload-attachment-component"
                       @attachmentUploaded="onAttachmentUploaded"/>
        </div>
      </q-menu>
      <attachment-icon data-testid="message-composer-attachment-icon"></attachment-icon>
      <q-tooltip data-testid="message-composer-add-tooltip">
        {{  !selectedLine ? 'Please select line before adding attachments' : 'Add attachments' }}
      </q-tooltip>
    </b-link>

    <b-link v-if="['sms', 'email'].includes(messageComposer.mode)"
            href="#"
            data-testid="message-composer-add-template-link"
            :disabled="isTextingDisabled">
      <q-menu content-class="mx-height-300"
              ref="templatesMenu"
              data-testid="message-composer-add-template-menu"
              :offset="[0,5]">
        <div class="row no-wrap q-pa-md">
          <message-templates @templateSelected="onTemplateSelected" data-testid="message-composer-templates"></message-templates>
        </div>
      </q-menu>
      <calendar-today-icon data-testid="mesasge-composer-calendar-today-icon"></calendar-today-icon>
      <q-tooltip data-testid="message-composer-add-template-tooltip">
        Add template
      </q-tooltip>
    </b-link>

    <b-link v-if="['sms', 'email'].includes(messageComposer.mode)"
            href="#"
            data-testid="message-composer-add-variable-link"
            :disabled="isTextingDisabled">
      <q-menu content-class="mx-height-300"
              ref="variablesMenu"
              data-testid="message-composer-add-variable-menu"
              :offset="[0,5]">
        <div class="row no-wrap q-pa-md">
          <variables always-open
                     data-testid="message-composer-variables-selected"
                     @variableSelected="onVariableSelected">
          </variables>
        </div>
      </q-menu>
      <variable-icon></variable-icon>
      <q-tooltip data-testid="message-composer-add-variable-tooltip">
        Add variable
      </q-tooltip>
    </b-link>

    <b-link v-if="messageComposer.mode === 'sms'"
            href="#"
            data-testid="add-contact-card-link"
            :disabled="!selectedLine || isTextingDisabled || !canAddMoreAttachments">
      <q-menu content-class="mx-height-500 width-300"
              ref="contactCardMenu"
              data-testid="add-contact-card-menu"
              :offset="[0,5]">
        <div class="row no-wrap q-pa-md text-center">
          <b-col sm="12" md="12">
            <div class="mt-2 notice" data-testid="add-contact-card-message">
              <p class="mb-0">
                <router-link
                  :to="{ path: '/settings/profile' }"
                  :click="onContactCardLinkClicked"
                >
                  Click here
                </router-link>
                to change the name/phone number of your contact card.
              </p>
            </div>
          </b-col>
          <b-col sm="12" md="12">
            <button class="btn btn-sm btn-primary mt-2"
                    data-testid="add-contact-card-button"
                    @click="onContactCardSelected">
              Send my contact card
            </button>
          </b-col>

          <b-col sm="12" md="12">
            <b-progress v-if="isUploading && !hasError"
                    class="add-contact-card-progress mt-2"
                    variant="success"
                    data-testid="add-contact-card-progress"
                    :max="100">
              <b-progress-bar :value="uploadPercentage"
                              data-testid="add-contact-card-progress-bar"
                              :label="`${uploadPercentage}%`"/>
            </b-progress>
            <p v-if="hasError && !isUploading"
              data-testid="add-contact-card-error"
              class="error-notice mt-2">
              Error while generating contact card...
            </p>
          </b-col>
        </div>
      </q-menu>

      <contact-card-icon></contact-card-icon>
      <q-tooltip data-testid="add-contact-card-tooltip">
        {{  !selectedLine ? 'Please select line before send contact card' : 'Send my contact card' }}
      </q-tooltip>
    </b-link>

    <b-link v-if="isSimpSocialIntegrationEnabled"
            href="#">
      <q-menu content-class="inventory-menu mx-height-600 overflow-x-hidden"
              ref="newCarMenu"
              v-model="newCarMenu"
              :offset="[0,5]"
              @before-hide="onNewCarBeforeHide"
              @hide="onNewCarFormClosed">
        <div class="row no-wrap q-pa-md">
          <new-car ref="newCarMessage"
                   :key="newCarCounter"
                   :contact-id="contact.id"
                   :selected-campaign-id="campaignId"
                   v-if="hasPermissionTo('update contact')"
                   @success="hideNewCarMenu"
                   @preventNewCarMenuClose="onPreventNewCarMenuClose"
                   @newCarMenuClose="onNewCarMenuClose">
          </new-car>
        </div>
      </q-menu>
      <simpsocial-inventory-icon/>
      <q-tooltip>
        Inventory
      </q-tooltip>
    </b-link>

    <b-link v-if="isSimpSocialIntegrationEnabled"
            href="#"
            :disabled="creditApplicationSending"
            @click="sendCreditApplicationLink">
      <simpsocial-credit-application-icon/>
      <q-tooltip>
        Credit Application
      </q-tooltip>
    </b-link>
  </div>
</template>

<script>
import SearchGiphy from 'components/message-composer/options/search-giphy'
import GifIcon from 'components/icons/gif-icon'
import ContactCardIcon from 'components/icons/contact-card-icon.vue'
import Attachments from 'components/message-composer/options/attachments'
import AttachmentIcon from 'components/icons/attachment-icon'
import MessageTemplates from 'components/message-composer/options/message-templates'
import NewCar from 'components/new-car'
import CalendarTodayIcon from 'components/icons/calendar-today-icon'
import Variables from 'components/message-composer/options/variables'
import VariableIcon from 'components/icons/variable-icon'
import { mapGetters, mapState } from 'vuex'
import { aclMixin, simpsocialMixin } from 'src/plugins/mixins'
import SimpsocialInventoryIcon from 'components/icons/simpsocial-inventory-icon'
import SimpsocialCreditApplicationIcon from 'components/icons/simpsocial-credit-application-icon'
import talk2Api from 'src/plugins/api/api'

export default {
  name: 'message-composer-options',

  props: {
    campaignId: {
      required: true
    },

    maxAttachments: {
      type: Number,
      default: null
    },

    isBroadcast: {
      type: Boolean,
      default: false
    }
  },

  components: {
    SimpsocialCreditApplicationIcon,
    SimpsocialInventoryIcon,
    VariableIcon,
    Variables,
    CalendarTodayIcon,
    MessageTemplates,
    AttachmentIcon,
    Attachments,
    GifIcon,
    SearchGiphy,
    NewCar,
    ContactCardIcon
  },

  mixins: [
    aclMixin,
    simpsocialMixin
  ],

  data () {
    return {
      creditApplicationSending: false,
      newCarCounter: 0,
      newCarMenu: false,
      isCarMenuClosing: false,

      isUploading: false,
      uploadPercentage: 0,
      hasError: false
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    ...mapGetters('contacts', [
      'selectedLine',
      'messageComposer',
      'contact'
    ]),

    ...mapGetters('auth', ['user']),

    isTextingDisabled () {
      return this.messageComposer.mode === 'sms' && !this.currentCompany.sms_enabled
    },

    canAddMoreAttachments () {
      if (!this.maxAttachments) {
        return true
      }

      const hasGif = this.messageComposer.sms.gif_url !== ''

      return ((hasGif ? 1 : 0) + this.messageComposer.sms.attachments.length) < this.maxAttachments
    }
  },

  methods: {
    onGifSelected (gif) {
      this.$emit('gifSelected', gif)
      this.$refs.giphyMenu.hide()
    },

    onAttachmentUploaded (files) {
      this.$emit('attachmentUploaded', files)
      this.$refs.attachmentMenu.hide()
    },

    onTemplateSelected (template) {
      this.$emit('templateSelected', template)
      this.$refs.templatesMenu.hide()
    },

    onVariableSelected (variable) {
      this.$emit('variableSelected', variable)
      this.$refs.variablesMenu.hide()
    },

    onNewCarFormClosed () {
      this.newCarCounter += 1
      this.isCarMenuClosing = false
    },

    hideNewCarMenu () {
      this.$refs.newCarMenu.hide()
    },

    sendCreditApplicationLink () {
      this.creditApplicationSending = true
      talk2Api.V1.integrations.simpsocial.creditApplication.send(this.contact.id, this.campaignId)
        .then(res => {
          this.creditApplicationSending = false
        }).catch(err => {
          console.log(err)
          this.$handleErrors(err.response)
          this.creditApplicationSending = false
        })
    },

    onNewCarBeforeHide () {
      // prevent confirmation message infinite loop
      if (!this.isCarMenuClosing) {
        this.newCarMenu = true
        this.$refs.newCarMessage.beforeCloseModal()
      }
    },

    onNewCarMenuClose () {
      setTimeout(() => {
        this.newCarMenu = false
        this.hideNewCarMenu()
        this.isCarMenuClosing = true
      }, 100)
    },

    onPreventNewCarMenuClose () {
      this.newCarMenu = true
    },

    onContactCardSelected () {
      // const vCardData = `
      // BEGIN:VCARD
      // VERSION:3.0
      // FN:${this.user?.profile?.contact_card_name}
      // TEL:${this.user?.profile?.contact_card_phone_number || ''}
      // END:VCARD
      // `

      const vCardData = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${this.user?.profile?.first_name || ''};${this.user?.profile?.last_name || ''};;;`,
        `FN:${this.user?.profile?.contact_card_name || ''}`,
        `TEL;TYPE=CELL:${this.user?.profile?.contact_card_phone_number || ''}`,
        `EMAIL:${this.user?.profile?.email || ''}`,
        'END:VCARD'
      ].join('\r\n')

      console.log(vCardData)

      const contactCardName = this.user?.profile?.contact_card_name || 'contact-card'
      const fileName = `${contactCardName.toLowerCase().replace(/\s+/g, '-')}.vcf`

      const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' })
      const file = new File([blob], fileName, { type: 'text/vcard;charset=utf-8' })
      // console.log(file)

      this.uploadVCard(file)
    },

    uploadVCard (file) {
      const formData = new FormData()
      formData.append('file', file)

      this.isUploading = true
      this.uploadPercentage = 0

      talk2Api.V1.lines.fileUpload(this.selectedLine.id, formData, {
        onUploadProgress: function (progressEvent) {
          this.uploadPercentage = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100))
        }.bind(this)
      }).then(response => {
        this.isUploading = false
        this.hasError = false
        this.uploadPercentage = 100

        const files = [response.data.uploaded_file]
        this.$emit('attachmentUploaded', files)
        this.$refs.contactCardMenu.hide()
      }).catch(error => {
        console.error('Error al subir el archivo vCard:', error)
        this.isUploading = false
        this.hasError = true
      })
    },

    onContactCardLinkClicked () {
      this.$refs.contactCardMenu.hide()
    }
  }
}
</script>
