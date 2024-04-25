<template>
  <div id="digital-clock" data-testid="digital-clock-wrapper">
    <span class="time text-md _500">{{ time }}</span>
  </div>
</template>

<script>
export default {
  name: 'digital-clock',

  props: {
    timezone: {
      required: false,
      type: String,
      default: 'America/Los_Angeles'
    }
  },

  data () {
    return {
      date: null,
      interval: null,
      time: ''
    }
  },

  computed: {
    tz () {
      return this.timezone || 'America/Los_Angeles'
    }
  },

  mounted () {
    this.updateTime()
    this.interval = setInterval(this.updateTime, 1000)
  },

  methods: {
    updateTime () {
      this.date = window.moment().tz(this.tz)
      this.time = this.date.format('hh:mm A z')
    }
  },

  beforeDestroy () {
    clearInterval(this.interval)
  }

}
</script>
