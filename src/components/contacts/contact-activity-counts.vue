<template>
  <b-card class="border-0">
    <h6>Activity Counts</h6>
    <b-row>
      <b-col col lg="6" class="p-0">
        <p class="mb-0 data-text">{{ contact.inbound_call_count }}</p>
        <p class="mb-0 fs-12">Inbound Call</p>
      </b-col>
      <b-col col lg="6" class="p-0">
        <p class="mb-0 data-text">{{ contact.outbound_call_count }}</p>
        <p class="mb-0 fs-12">Outbound Calls</p>
      </b-col>
      <b-col col lg="6" class="p-0">
        <p class="mb-0 data-text">{{ contact.inbound_sms_count }}</p>
        <p class="mb-0 fs-12">Inbound Texts</p>
      </b-col>
      <b-col col lg="6" class="p-0">
        <p class="mb-0 data-text">{{ contact.outbound_sms_count }}</p>
        <p class="mb-0 fs-12">Inbound Texts</p>
      </b-col>
      <b-col col lg="12" class="p-0">
        <p class="mb-0 data-text">{{ contact.nb_communications }}</p>
        <p class="mb-0 fs-12">All Communications</p>
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
      font-size: 20px;
      font-weight: 500;
      line-height: 24px;
    }
</style>
