<template>
  <div class="last-communication-date">
    <span class="time-passed text-grey-90"
          role="button"
          :id="`last-comm-date-${_uid}`">
      <q-skeleton type="text"
                  width="20px"
                  v-if="!dateTimePassed" />
      <span class="text-nowrap"
            v-else
            v-html="dateTimePassed" />
      <b-tooltip custom-class="talk-table__tooltip"
                 :target="`last-comm-date-${_uid}`">
        {{ relativeDateTime }}
      </b-tooltip>
    </span>
  </div>
</template>

<script>
export default {
  props: {
    date: {
      type: String,
      required: true
    },

    lastCommunicationType: {
      type: [String, Number],
      required: false
    },

    lastCommunicationCurrentStatus: {
      type: [String, Number],
      required: false
    }
  },

  data: () => ({
    dateTimePassed: null,
    relativeDateTime: null,
    getDateTimePassedInterval: null,
    updateInterval: 1000
  }),

  created () {
    this.init()
  },

  methods: {
    init () {
      this.relativeDateTime = this.$options.filters.fixRelativeDatetimeFormat(this.date, 'dddd, MMMM D, YYYY h:mm A z', this.$store)
      this.getDateTimePassedInterval = setInterval(this.setDateTimePassed, this.updateInterval)
    },

    setDateTimePassed () {
      this.dateTimePassed = this.$options.filters.shortDateTimePassed(this.date, true, this.$store)
    }
  },

  beforeDestroy () {
    clearInterval(this.getDateTimePassedInterval)
  }
}
</script>

<style scoped>
.last-communication-date {
  font-size: 12px;
}
</style>
