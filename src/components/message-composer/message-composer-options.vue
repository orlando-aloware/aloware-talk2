<template>
  <div class="message-options">
    <b-link v-if="messageComposer.mode === 'sms'"
            href="#"
            :disabled="isDisabled || !canAddMoreAttachments">
      <q-menu content-class="mx-height-500"
              ref="giphyMenu"
              :offset="[0,5]">
        <div class="row no-wrap q-pa-md">
          <search-giphy @selected="onGifSelected"></search-giphy>
        </div>
      </q-menu>

      <gif-icon></gif-icon>
      <q-tooltip>
        Add Gif image
      </q-tooltip>
    </b-link>

    <b-link v-if="messageComposer.mode === 'sms'"
            href="#"
            :disabled="!selectedLine || isDisabled || !canAddMoreAttachments">
      <q-menu ref="attachmentMenu"
              :offset="[0,5]">
        <div class="row no-wrap q-pa-md">
          <attachments :is-broadcast="isBroadcast"
                       @attachmentUploaded="onAttachmentUploaded"/>
        </div>
      </q-menu>
      <attachment-icon></attachment-icon>
      <q-tooltip>
        {{  !selectedLine ? 'Please select line before adding attachments' : 'Add attachments' }}
      </q-tooltip>
    </b-link>

    <b-link v-if="['sms', 'email'].includes(messageComposer.mode)"
            href="#"
            :disabled="isDisabled">
      <q-menu content-class="mx-height-300"
              ref="templatesMenu"
              :offset="[0,5]">
        <div class="row no-wrap q-pa-md">
          <message-templates @templateSelected="onTemplateSelected"></message-templates>
        </div>
      </q-menu>
      <calendar-today-icon></calendar-today-icon>
      <q-tooltip>
        Add template
      </q-tooltip>
    </b-link>

    <b-link v-if="['sms', 'email'].includes(messageComposer.mode)"
            href="#"
            :disabled="isDisabled">
      <q-menu content-class="mx-height-300"
              ref="variablesMenu"
              :offset="[0,5]">
        <div class="row no-wrap q-pa-md">
          <variables always-open
                     @variableSelected="onVariableSelected">
          </variables>
        </div>
      </q-menu>
      <variable-icon></variable-icon>
      <q-tooltip>
        Add variable
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
    NewCar
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
      isCarMenuClosing: false
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    ...mapGetters('contacts', [
      'selectedLine',
      'messageComposer',
      'contact'
    ]),

    isDisabled () {
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
    }
  }
}
</script>
