<template>
  <b-card class="border-0 contact-activity-counts-wrapper">
    <h4>Activity Counts</h4>
    <b-row class="mt-2">
      <b-col lg="6"
             class="p-0 mb-2"
             col>
        <p class="mb-0 data-text">{{ contact.inbound_calls_count}}</p>
        <p class="mb-0 data-label">Inbound Call</p>
      </b-col>
      <b-col lg="6"
             class="p-0 mb-2"
             col>
        <p class="mb-0 data-text">{{ contact.outbound_calls_count}}</p>
        <p class="mb-0 data-label">Outbound Calls</p>
      </b-col>
      <b-col lg="6"
             class="p-0 mb-2"
             col>
        <p class="mb-0 data-text">{{ contact.inbound_texts_count}}</p>
        <p class="mb-0 data-label">Inbound Texts</p>
      </b-col>
      <b-col lg="6"
             class="p-0 mb-2"
             col>
        <p class="mb-0 data-text">{{ contact.outbound_texts_count}}</p>
        <p class="mb-0 data-label">Outbound Texts</p>
      </b-col>
      <b-col lg="12"
             class="p-0 mb-2"
             col>
        <p class="mb-0 data-text">{{ contact.communications_count || 0 }}</p>
        <p class="mb-0 data-label">All Communications</p>
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
