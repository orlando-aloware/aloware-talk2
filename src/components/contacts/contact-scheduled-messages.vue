<template>
  <b-card class="border-0" data-testid="contact-scheduled-messages-wrapper">
    <h4 class="mb-2">Scheduled Messages</h4>
    <div>
      <b-button
        class="btn-block"
        variant="outline-primary"
        size="sm"
        data-testid="contact-scheduled-messages-button"
        @click="showDialog">
        View Scheduled Messages
      </b-button>
    </div>
    <contact-scheduled-messages-modal data-testid="contact-scheduled-messages-modal"/>
  </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ContactScheduledMessagesModal from 'components/contacts/contact-scheduled-messages-modal'

export default {
  name: 'contact-scheduled-messages',
  components: { ContactScheduledMessagesModal },
  computed: {
    ...mapGetters('contacts', ['isScheduledMessageListOpen'])
  },
  methods: {
    ...mapActions('contacts', ['scheduledMessageListOpen']),
    showDialog () {
      this.scheduledMessageListOpen(true)
    }
  }
}
</script>
