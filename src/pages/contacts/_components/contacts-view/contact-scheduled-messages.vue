<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6 class="mb-2">Scheduled Messages</h6>
    <div>
      <b-button
        class="btn-block"
        variant="outline-primary"
        size="sm" @click="showDialog">
        View Scheduled Messages
      </b-button>
    </div>
    <contact-scheduled-messages-modal></contact-scheduled-messages-modal>
  </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ContactScheduledMessagesModal from 'pages/contacts/_components/contact-scheduled-messages-modal'

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

<style scoped>

</style>
