<template>
  <q-input class="q-input-composer"
           borderless
           autogrow
           ref="smsMessageBody"
           input-class="q-input-pl-0 q-input-pr-0 pt-0 pb-0"
           type="textarea"
           :value="text"/>
</template>

<script>
import { messageMixin } from 'src/plugins/mixins'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'message-composer-sms-preview',

  mixins: [
    messageMixin
  ],

  props: {
    contact: {
      required: true,
      type: Object
    }
  },

  computed: {
    ...mapState('cache', [
      'currentCompany'
    ]),

    ...mapState('auth', [
      'profile'
    ]),

    ...mapGetters('contacts', [
      'messageComposer',
      'selectedLine'
    ]),

    text () {
      return this.translateMessage(this.messageComposer.sms.body, this.contact, this.selectedLine, this.profile)
    }
  }
}
</script>
