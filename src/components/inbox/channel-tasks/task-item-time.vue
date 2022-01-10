<template>
  <div>
    <span v-html="dateTimePassed"></span>
    <q-tooltip content-class="bg-grey-light11"
               anchor="top middle" self="center middle">
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
    this.getDateTimePassed()
    this.getDateTimePassedInterval = setInterval(this.getDateTimePassed, this.updateInterval)
    this.relativeDateTime = this.$options.filters.fixRelativeDatetimeFormat(this.fromTime)
  },
  beforeDestroy () {
    clearInterval(this.getDateTimePassedInterval)
  },
  methods: {
    getDateTimePassed () {
      this.dateTimePassed = this.$options.filters.shortDateTimePassed(this.fromTime)
    }
  }
}
</script>
