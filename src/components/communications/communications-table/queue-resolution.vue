<template>
  <div data-testid="queue-resolution-row">
    <span v-if="row.queue_resolution2">
      <span>{{ resolution }}</span>
    </span>

    <span v-else>
      -
    </span>
  </div>
</template>

<script>

export default {
  name: 'QueueResolution',

  props: {
    row: {
      type: Object,
      required: true
    }
  },

  computed: {
    resolution () {
      return this.$options.filters.capitalize(this.$options.filters.replaceDash(this.$options.filters.translateResolutionText(this.row.queue_resolution2)))
    }
  }
}
</script>
