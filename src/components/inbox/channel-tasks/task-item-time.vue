<template>
  <div data-testid="task-item-time-wrapper">
    <span v-html="dateTimePassed" class="text-nowrap"></span>
    <q-tooltip content-class="bg-grey-light11"
               anchor="top middle" self="center middle"
               data-testid="task-item-time-tooltip">
      {{ relativeDateTime }}
    </q-tooltip>
  </div>
</template>

<script>
export default {
  name: 'task-item-time',
  props: {
    fromTime: {
      type: String,
      required: true
    },

    updateInterval: {
      type: Number,
      required: false,
      default: 1000
    }
  },
  data: function () {
    return {
      dateTimePassed: null,
      relativeDateTime: null,
      getDateTimePassedInterval: null
    }
  },
  created () {
    this.init()
  },
  beforeDestroy () {
    clearInterval(this.getDateTimePassedInterval)
  },
  methods: {
    init () {
      this.getDateTimePassed()
      this.getDateTimePassedInterval = setInterval(this.getDateTimePassed, this.updateInterval)
      this.relativeDateTime = this.$options.filters.fixRelativeDatetimeFormat(this.fromTime, 'dddd, MMMM D, YYYY h:mm A z', this.$store)
    },
    getDateTimePassed () {
      this.dateTimePassed = this.$options.filters.shortDateTimePassedLessThan(this.fromTime, true, this.$store)
    }
  }
}
</script>
