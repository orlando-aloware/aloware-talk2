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
      <div class="broadcast-add__message__sms__composer-header">
        Limit: {{ smsBodyLength }} / {{ maxSmsBodyLength }}
      </div>

      <div class="broadcast-add__message__sms__composer-body">
        <message-composer-sms :max-attachments="1"
                              :reset-on-load="false"
                              :use-send-button="false"/>
      </div>

      <div class="broadcast-add__message__sms__composer-footer">
        <span class="mr-4">
          Message parts: {{ messagePartCount }} / {{ baseLine }}
        </span>
        <span>
          Message(s): {{ messageCount }}
        </span>
      </div>

      <div class="broadcast-add__message__sms__label-preview">
        Preview
      </div>

      <div :class="['broadcast-add__message__sms__preview', { 'broadcast-add__message__sms__preview--empty': smsBodyLength === 0 }]">
        <message-composer-sms-preview :contact="contact"/>
      </div>
    </div>
    <!-- voicemail (TBD) -->
  </div>
</template>

<script>
import MessageComposerSms from 'src/components/message-composer/message-composer-sms.vue'
import MessageComposerSmsPreview from 'src/components/message-composer/message-composer-sms-preview.vue'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'broadcast-add-view-message',

  components: {
    MessageComposerSms,
    MessageComposerSmsPreview
  },

  props: {
    contact: {
      type: Object,
      required: false
    },

    contactsLength: {
      type: Number,
      default: 0
    }
  },

  computed: {
    ...mapState([
      'campaigns'
    ]),

    ...mapState('auth', [
      'profile'
    ]),

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
    },

    smsBodyLength () {
      return this.messageComposer.sms.body.length
    },

    hasMoreThanAscii () {
      return this.smsBodyLength > 0
        ? [...this.messageComposer.sms.body].some(char => char.charCodeAt(0) > 127)
        : false
    },

    baseLine () {
      return this.hasMoreThanAscii ? 70 : 160
    },

    messagePartCount () {
      return this.smsBodyLength > 0
        ? this.smsBodyLength % this.baseLine
        : 0
    },

    messageCount () {
      return this.smsBodyLength > 0
        ? Math.ceil(this.smsBodyLength / this.baseLine)
        : 0
    },

    useMmsRate () {
      return this.messageComposer.sms.attachments.length > 0 || this.messageComposer.sms.gif_url.length > 0
    },

    smsPricing () {
      let rate = this.useMmsRate ? this.profile.rate.local_mms : this.profile.rate.local_sms

      return this.contactsLength * this.messageCount * rate
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
    ],
    maxSmsBodyLength: 1600
  }),

  created () {
    // FIXME?: check implemented logic in contact.mixin::showContactInfo to select a campaign properly
    const campaign = this.profile.campaign_id
      ? this.campaigns.find(camp => camp.id === this.profile.campaign_id)
      : this.campaigns[0]

    this.setSelectedLine(campaign)
  },

  methods: {
    ...mapActions('contacts', [
      'setSelectedLine'
    ])
  },

  watch: {
    isValid: {
      immediate: true,
      handler (state) {
        this.$emit('input', state)
      }
    },

    type: {
      immediate: true,
      handler (type) {
        this.$emit('type-updated', type)
      }
    },

    smsPricing (price) {
      this.$emit('sms-price-updated', price)
    }
  }
}
</script>
