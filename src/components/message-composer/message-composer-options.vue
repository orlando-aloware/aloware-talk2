<template>
  <div class="message-options">
    <b-link v-if="messageComposer.mode === 'sms'"
            href="#">
      <q-menu content-class="mx-height-500"
              ref="giphyMenu"
              :offset="[0,5]" >
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
            :disabled="!selectedLine">
      <q-menu ref="attachmentMenu"
              :offset="[0,5]">
        <div class="row no-wrap q-pa-md">
          <attachments @attachmentUploaded="onAttachmentUploaded"></attachments>
        </div>
      </q-menu>
      <attachment-icon></attachment-icon>
      <q-tooltip>
        {{  !selectedLine ? 'Please select line before adding attachments' : 'Add attachments' }}
      </q-tooltip>
    </b-link>

    <b-link v-if="['sms', 'email'].includes(messageComposer.mode)"
            href="#">
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
            href="#">
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
  </div>
</template>

<script>
import SearchGiphy from 'components/message-composer/options/search-giphy'
import GifIcon from 'components/icons/gif-icon'
import Attachments from 'components/message-composer/options/attachments'
import AttachmentIcon from 'components/icons/attachment-icon'
import MessageTemplates from 'components/message-composer/options/message-templates'
import CalendarTodayIcon from 'components/icons/calendar-today-icon'
import Variables from 'components/message-composer/options/variables'
import VariableIcon from 'components/icons/variable-icon'
import { mapGetters } from 'vuex'

export default {
  name: 'message-composer-options',

  components: {
    VariableIcon,
    Variables,
    CalendarTodayIcon,
    MessageTemplates,
    AttachmentIcon,
    Attachments,
    GifIcon,
    SearchGiphy
  },

  computed: {
    ...mapGetters('contacts', ['selectedLine', 'messageComposer'])
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
    }
  }
}
</script>
