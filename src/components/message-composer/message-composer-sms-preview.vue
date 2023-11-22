<template>
  <div>
    <img class="img-fluid broadcast-add__message__sms__preview__image"
         :src="attachment"
         v-if="attachment">
    <span class="q-input-composer text-white"
          v-html="text"/>
  </div>
</template>

<script>
import { messageMixin } from 'src/plugins/mixins'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'message-composer-sms-preview',

  mixins: [
    messageMixin
  ],

  computed: {
    ...mapState('cache', [
      'currentCompany'
    ]),

    ...mapState('auth', [
      'profile'
    ]),

    ...mapGetters('contacts', [
      'messageComposer',
      'selectedLine',
      'messageBodyWithOptout',
      'optoutText'
    ]),

    text () {
      const messageBodyWithOptoutBolded = this.messageBodyWithOptout.replace(this.optoutText, `<span class="text-weight-bold">${this.optoutText}</span>`)
      return this.translateMessage(messageBodyWithOptoutBolded, this.selectedLine, this.profile)
    },

    baseUrl () {
      return window.axios.defaults.baseURL
    },

    attachment () {
      return this.messageComposer.sms.gif_url ||
        (this.messageComposer.sms.attachments.length ? `${this.baseUrl}/static/uploaded_file/${this.messageComposer.sms.attachments[0].uuid}` : null) ||
        null
    }
  }
}
</script>
