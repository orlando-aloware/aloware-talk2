<template>
  <div class="broadcast-add broadcast-add__message container">
    <div class="broadcast-add__message__type">
      <q-radio v-model="type" val="sms" label="SMS" /> <br/>
      <q-radio v-model="type" val="ringless_voicemail" label="Ringless Voicemail" />
    </div>
    <template v-if="type === 'sms'">
      <div class="broadcast-add__message__composer composer-container px-0 mb-3">
        <div class="composer-wrapper">
          <message-composer-sms @messageChanged="onMessageChanged"/>
        </div>
      </div>
      <div class="broadcast-add__message__contact mb-4">
        <span class="text-weight-bold">Contact Preview: [John Smith, 334-213-1111]</span>
      </div>
      <div class="broadcast-add__message__preview">
        <div class="mb-2">
          <span class="h4">Preview</span>
        </div>
        <div class="px-2 py-1 bg-primary border-radius-1 text-white">
          {{ message }}
        </div>
      </div>
    </template>
    <template v-if="type === 'ringless_voicemail'">
      <div class="broadcast-add__message__voicemail d-flex align-items-center justify-content-around container mt-4">
        <div class="flex-grow-1 mx-3 d-flex align-items-center justify-content-center rounded-borders h-100">
          Press to record your voice
        </div>
        <div class="flex-grow-1 mx-3 d-flex align-items-center justify-content-center rounded-borders h-100">
          Drop files to attach, or Browse
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import MessageComposerSms from 'src/components/message-composer/message-composer-sms'

export default {
  name: 'broadcast-add-view-message',

  components: {
    MessageComposerSms
  },

  data: () => ({
    message: '',
    type: 'sms'
  }),

  methods: {
    onMessageChanged (message) {
      this.message = message
    }
  }
}
</script>
