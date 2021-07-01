<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6>Activity Counts</h6>
    <b-row>
      <b-col col lg="6" class="p-0">
        <p class="mb-0 data-text">{{ contact.inbound_call_count }}</p>
        <p><small>Inbound Calls</small></p>
      </b-col>
      <b-col col lg="6" class="p-0">
        <p class="mb-0 data-text">{{ contact.outbound_call_count }}</p>
        <p><small>Outbound Calls</small></p>
      </b-col>
      <b-col col lg="6" class="p-0">
        <p class="mb-0 data-text">{{ contact.inbound_sms_count }}</p>
        <p><small>Inbound Texts</small></p>
      </b-col>
      <b-col col lg="6" class="p-0">
        <p class="mb-0 data-text">{{ contact.outbound_sms_count }}</p>
        <p><small>Inbound Texts</small></p>
      </b-col>
      <b-col col lg="12" class="p-0">
        <p class="mb-0 data-text">{{ contact.nb_communications }}</p>
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

<style lang="scss" scoped>
    .data-text {
      font-size: 1.2rem;
      font-weight: 500;
      line-height: 24px;
    }
</style>
