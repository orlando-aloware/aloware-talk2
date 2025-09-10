<template>
  <div data-testid="call-timeline-wrapper">
    <q-card
      class="ring-group-snapshot-card"
      flat
      bordered
      data-testid="call-timeline-card"
    >
    <q-card-section data-testid="call-timeline-card-section">
        <div class="text-h6">Call Quality</div>
      </q-card-section>
      <q-separator inset />
    <q-timeline color="primary" class="ml-3 mt-3">
      <q-timeline-entry v-for="item in timeline" :key="item.id"
        :title="item.title"
        :subtitle="item.datetime | fixTimelineDateTime"
        icon="phone"
      >
        <div>
          {{ item.description }}
        </div>
      </q-timeline-entry>
    </q-timeline>
  </q-card>
  </div>
</template>

<script>
import { fixTimelineDateTime } from 'src/plugins/filters/datetime.filters'

export default {
  name: 'call-timeline',

  filters: {
    fixTimelineDateTime
  },

  props: {
    timeline: {
      type: Array,
      required: true,
      default: () => []
    }
  },

  data () {
    return {

    }
  }
}
</script>
