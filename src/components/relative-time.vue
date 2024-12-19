<template>
  <span class="relative-time"
        v-html="relativeTime"
        :style="{ 'font-size': fontSize + 'px' }"></span>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'relative-time',

  props: {
    fromTime: {
      type: String,
      required: true
    },

    updateInterval: {
      type: Number,
      required: false,
      default: 1000
    },

    humanized: {
      type: Boolean,
      required: false,
      default: false
    },

    fontSize: {
      type: String,
      required: false,
      default: '14'
    }
  },

  computed: {
    ...mapState(['currentTimezone'])
  },

  data () {
    return {
      relativeTime: null
    }
  },

  created () {
    this.getRelativeTime()
    setInterval(this.getRelativeTime, this.updateInterval)
  },

  beforeDestroy () {
    clearInterval(this.getRelativeTime)
  },

  methods: {
    getRelativeTime () {
      if (this.humanized) {
        this.relativeTime = this.$options.filters.fixDurationHumanize(this.fromTime, this.currentTimezone)
      } else {
        this.relativeTime = this.$options.filters.fixDurationUTCRelative(this.fromTime)
      }
    }
  }
}
</script>
