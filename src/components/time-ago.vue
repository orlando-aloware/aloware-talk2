<template>
  <div class="users__table__status-duration">
    <span>{{ timeAgo }}</span>
    <q-tooltip >
      <span class="font-weight-bold text-sm">From: {{ from }}</span>
    </q-tooltip>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'time-ago',

  props: {
    from: {
      type: Date,
      required: true
    }
  },

  data: () => ({
    timeAgo: null
  }),

  mounted () {
    this.computeDuration()
    setInterval(this.computeDuration, 1000)
  },

  methods: {
    computeDuration () {
      const now = moment.utc(new Date())
      const diff = now.diff(this.from, 'seconds')
      let hours = Math.floor(diff / 3600)
      let minutes = Math.floor(diff % 3600 / 60)
      let seconds = Math.floor(diff % 3600 % 60)

      // show x day(s) ago for
      if (hours >= 24) {
        let days = Math.floor(hours / 24)
        let daysLabel = days === 1 ? 'a day' : `${days} days`

        this.timeAgo = `${daysLabel} ago`
        return
      }

      let hoursLabel = (hours < 10) ? `0${hours}` : hours
      let minutesLabel = (minutes < 10) ? `0${minutes}` : minutes
      let secondsLabel = (seconds < 10) ? `0${seconds}` : seconds

      this.timeAgo = `${hoursLabel}:${minutesLabel}:${secondsLabel}`
    }
  },

  beforeDestroy () {
    clearInterval(this.computeDuration)
  }
}
</script>
