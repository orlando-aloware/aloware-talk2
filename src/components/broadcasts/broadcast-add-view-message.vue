<template>
  <div class="broadcast-add broadcast-add__message">
    <b-form-radio-group stacked
                        :options="enabledTypes"
                        value-field="id"
                        text-field="label"
                        v-model="type"/>
    <!-- sms -->
    <div class="broadcast-add__message__sms"
         v-if="type === 'sms'">
      <div class="broadcast-add__message__sms__composer">
        <message-composer-sms :use-send-button="false"/>
      </div>

      <div class="broadcast-add__message__sms__preview">
        <!-- <message-composer-sms-preview /> -->
      </div>
    </div>
    <!-- voicemail TBD -->
  </div>
</template>

<script>
import MessageComposerSms from 'src/components/message-composer/message-composer-sms.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'broadcast-add-view-message',

  components: {
    MessageComposerSms
  },

  props: {
    contact: {
      type: Object,
      required: false
    }
  },

  computed: {
    ...mapGetters('contacts', [
      'messageComposer'
    ]),

    isValid () {
      switch (this.type) {
        case 'sms':
          return (this.messageComposer.sms.body && this.messageComposer.sms.body.trim().length > 0) || this.messageComposer.sms.attachments.length > 0 || this.messageComposer.sms.gif_url.length > 0
        default:
          return false
      }
    },

    enabledTypes () {
      return this.types.filter(type => type.enabled)
    }
  },

  data: () => ({
    type: 'sms',
    types: [
      {
        id: 'sms',
        label: 'SMS',
        enabled: true
      },
      {
        id: 'voicemail',
        label: 'Ringless Voicemail',
        enabled: false
      }
    ]
  }),

  watch: {
    isValid (state) {
      this.$emit('input', state)
    }
  }
}
</script>
