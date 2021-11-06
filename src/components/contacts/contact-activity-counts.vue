<template>
  <b-card class="border-0 contact-activity-counts-wrapper">
    <h4>Activity Counts</h4>
    <b-row class="mt-2">
      <b-col cols="6"
             class="p-0 mb-2"
             col>
        <p class="mb-0 data-text">{{ summary.inbound_calls_count || 0 }}</p>
        <p class="mb-0 data-label">Inbound Call</p>
      </b-col>
      <b-col cols="6"
             class="p-0 mb-2"
             col>
        <p class="mb-0 data-text">{{ summary.outbound_calls_count || 0 }}</p>
        <p class="mb-0 data-label">Outbound Calls</p>
      </b-col>
      <b-col cols="6"
             class="p-0 mb-2"
             col>
        <p class="mb-0 data-text">{{ summary.inbound_texts_count || 0 }}</p>
        <p class="mb-0 data-label">Inbound Texts</p>
      </b-col>
      <b-col cols="6"
             class="p-0 mb-2"
             col>
        <p class="mb-0 data-text">{{ summary.outbound_texts_count || 0 }}</p>
        <p class="mb-0 data-label">Outbound Texts</p>
      </b-col>
      <b-col cols="12"
             class="p-0 mb-2"
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
