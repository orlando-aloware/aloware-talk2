<template>
  <b-card class="border-0 contact-activity-counts-wrapper" data-testid="contact-activity-counts-wrapper">
    <h4>Activity Counts</h4>
    <b-row class="mt-2" data-testid="contact-activity-counts-row">
      <b-col cols="6"
             class="p-0 mb-2"
             data-testid="contact-activity-counts-inbound-calls"
             col>
        <p class="mb-0 data-text">{{ summary.inbound_calls_count || 0 }}</p>
        <p class="mb-0 data-label">Inbound Calls</p>
      </b-col>
      <b-col cols="6"
             class="p-0 mb-2"
             data-testid="contact-activity-counts-outbound-calls"
             col>
        <p class="mb-0 data-text">{{ summary.outbound_calls_count || 0 }}</p>
        <p class="mb-0 data-label">Outbound Calls</p>
      </b-col>
      <b-col cols="6"
             class="p-0 mb-2"
             data-testid="contact-activity-counts-inbound-texts"
             col>
        <p class="mb-0 data-text">{{ summary.inbound_texts_count || 0 }}</p>
        <p class="mb-0 data-label">Inbound Texts</p>
      </b-col>
      <b-col cols="6"
             class="p-0 mb-2"
             data-testid="contact-activity-counts-outbound-text"
             col>
        <p class="mb-0 data-text">{{ summary.outbound_texts_count || 0 }}</p>
        <p class="mb-0 data-label">Outbound Texts</p>
      </b-col>
      <b-col cols="12"
             class="p-0 mb-2"
             data-testid="contact-activity-counts-total-count"
             col>
        <p class="mb-0 data-text">{{ summary.total_count || 0 }}</p>
        <p class="mb-0 data-label">All Communications</p>
      </b-col>
    </b-row>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'contact-activity-counts',
  props: {
    summary: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapGetters('contacts', ['contact'])
  }
}
</script>
