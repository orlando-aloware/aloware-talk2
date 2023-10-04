<template>
  <div>
    <img class="img-fluid"
         :src="attachment"
         v-if="attachment">
    <q-input class="q-input-composer"
             borderless
             autogrow
             ref="smsMessageBody"
             input-class="q-input-pl-0 q-input-pr-0 pt-0 pb-0"
             type="textarea"
             :value="text"/>
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
      'isOptoutActive',
      'messageBodyWithOptout'
    ]),

    text () {
      return this.translateMessage(this.messageBodyWithOptout, this.selectedLine, this.profile)
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
