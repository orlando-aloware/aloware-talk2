<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6>Activity Counts</h6>
    <b-row>
      <b-col col lg="6" class="p-0">
        <p class="mb-0">{{ contact.inbound_call_count }}</p>
        <p><small>Inbound Calls</small></p>
      </b-col>
      <b-col col lg="6" class="p-0">
        <p class="mb-0">{{ contact.outbound_call_count }}</p>
        <p><small>Outbound Calls</small></p>
      </b-col>
      <b-col col lg="6" class="p-0">
        <p class="mb-0">{{ contact.inbound_sms_count }}</p>
        <p><small>Inbound Texts</small></p>
      </b-col>
      <b-col col lg="6" class="p-0">
        <p class="mb-0">{{ contact.outbound_sms_count }}</p>
        <p><small>Inbound Texts</small></p>
      </b-col>
      <b-col col lg="12" class="p-0">
        <p class="mb-0">{{ contact.nb_communications }}</p>
        <p><small>All Communications</small></p>
      </b-col>
    </b-row>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'contact-activity-counts',
  computed: {
    ...mapGetters('contacts', ['contact'])
  }
}
</script>

<style scoped>

</style>
