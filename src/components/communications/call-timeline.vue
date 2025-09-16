<template>
  <div data-testid="call-timeline-wrapper" class="call-timeline-wrapper">
    <q-card class="ring-group-snapshot-card" flat bordered data-testid="call-timeline-card">
      <q-card-section data-testid="call-timeline-card-section">
        <div class="text-h6">Call Quality</div>
      </q-card-section>
      <q-separator inset />
      <q-timeline color="primary" class="ml-3 mt-3">
        <q-timeline-entry v-for="item in timeline" :key="item.id" :title="item.title" :subtitle="subtitle(item)"
          :icon="icon(item)">
          <div>
            {{ item.description }}
          </div>
        </q-timeline-entry>
      </q-timeline>
    </q-card>
  </div>
</template>

<script>
import { fixTimelineDateTime, fixDuration } from 'src/plugins/filters/datetime.filters'

export default {
  name: 'call-timeline',

  filters: {
    fixTimelineDateTime,
    fixDuration
  },

  props: {
    timeline: {
      type: Array,
      required: true,
      default: () => []
    }
  },

  methods: {
    subtitle (item) {
      const duration = item.duration
      const datetime = item.datetime
      let label = ''
      if (duration) {
        label += this.$options.filters.fixDuration(duration)
      }
      if (datetime) {
        if (label) {
          label += ' | '
        }
        label += this.$options.filters.fixTimelineDateTime(datetime)
      }
      return label
    },
    icon (item) {
      if (/^https?:\/\//.test(item.icon)) {
        return `img:${item.icon}`
      }
      return item.icon
    }
  }
}
</script>

<style>
.call-timeline-wrapper .q-timeline__dot .q-icon>img {
  width: unset !important;
  height: unset !important;
}

.call-timeline-wrapper .q-icon>svg,
.call-timeline-wrapper .q-icon>img {
  width: unset !important;
  height: unset !important;
}
</style>
