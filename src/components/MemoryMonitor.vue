<template>
  <div class="memory-monitor" :hidden="!visible">
    <q-icon
      name="memory"
      :color="memoryColor"
      size="32px"
      class="cursor-pointer"
    >
      <q-tooltip>
        <div class="text-subtitle2">Memory Usage: {{ formatMB(currentMemory) }}MB</div>
        <div v-if="memoryThreshold" class="text-caption">Threshold: {{ formatMB(memoryThreshold * 1024 * 1024) }}MB</div>
        <div v-if="detailedMemory" class="text-caption q-mt-sm">
          <div>JS Heap: {{ formatMB(detailedMemory.jsHeapSize) }}MB</div>
          <div>DOM: {{ formatMB(detailedMemory.domSize) }}MB</div>
        </div>
      </q-tooltip>
    </q-icon>
  </div>
</template>

<script>
import { userMixin } from 'src/plugins/mixins'

export default {
  name: 'MemoryMonitor',

  mixins: [userMixin],

  data () {
    return {
      currentMemory: 0,
      heapLimit: 0,
      detailedMemory: null,
      updateInterval: null,
      thresholdExceeded: false,
      supportsDetailedMemory: false,
      memoryThresholdExceededCacheArray: [],
      cacheTimeout: null
    }
  },

  props: {
    monitoringEnabled: {
      type: Boolean,
      default: true,
      required: false
    },
    memoryThreshold: {
      type: Number,
      required: false
    },
    memoryThresholdPercentage: {
      type: Number,
      default: 90,
      required: false
    }
  },

  computed: {
    memoryPercentage () {
      const limit = this.memoryThreshold ? this.memoryThreshold * 1024 * 1024 : this.heapLimit
      if (!limit) return 0
      return Math.min((this.currentMemory / limit) * 100, 100)
    },

    memoryColor () {
      if (this.memoryPercentage >= 90) return 'negative'
      if (this.memoryPercentage >= 70) return 'warning'
      return 'positive'
    },

    visible () {
      return !this.isProduction || this.isDemoCompany
    }
  },

  methods: {
    formatMB (bytes) {
      return Math.round(bytes / (1024 * 1024))
    },

    async measureDetailedMemory () {
      if (!this.supportsDetailedMemory) return null

      try {
        const result = await performance.measureUserAgentSpecificMemory()
        return {
          jsHeapSize: result.bytes,
          domSize: result.domSize || 0
        }
      } catch (error) {
        console.warn('Detailed memory measurement failed:', error)
        return null
      }
    },

    async updateMemoryUsage () {
      if (window.performance && window.performance.memory) {
        this.currentMemory = window.performance.memory.totalJSHeapSize
        this.heapLimit = window.performance.memory.jsHeapSizeLimit

        // Try to get detailed memory info every 5 seconds
        if (this.supportsDetailedMemory && Math.random() < 0.2) {
          this.detailedMemory = await this.measureDetailedMemory()
        }

        this.checkThreshold()
      }
    },

    checkThreshold () {
      if (!this.monitoringEnabled) return

      this.thresholdExceeded = this.memoryPercentage >= this.memoryThresholdPercentage

      if (this.thresholdExceeded) {
        this.handleMemoryThresholdExceeded()
      }
    },

    startMonitoring () {
      if (this.updateInterval) return
      this.updateInterval = setInterval(() => this.updateMemoryUsage(), 1000)
    },

    stopMonitoring () {
      if (this.updateInterval) {
        clearInterval(this.updateInterval)
        this.updateInterval = null
      }
    },

    checkDetailedMemorySupport () {
      this.supportsDetailedMemory = typeof performance.measureUserAgentSpecificMemory === 'function'
    },

    handleMemoryThresholdExceeded () {
      const extra = {
        currentMemory: this.currentMemory,
        heapLimit: this.heapLimit,
        memoryPercentage: this.memoryPercentage,
        path: this.$route.path,
        url: window.location.href
      }
      // send the extra to Sentry if it's not already cached
      if (!this.memoryThresholdExceededCacheArray.some(cache => cache.url === window.location.href)) {
        window.Sentry.captureMessage('Memory threshold exceeded', {
          level: 'warning',
          extra
        })
      }
      // cache the extra for 30 seconds and send it to Sentry if it's not already cached
      if (!this.memoryThresholdExceededCacheArray.some(cache => cache.url === window.location.href)) {
        console.log('Memory threshold exceeded', extra)
        this.memoryThresholdExceededCacheArray.push(extra)
        this.cacheTimeout = setTimeout(() => {
          this.removeCache(window.location.href)
        }, 30000)
      }
    },

    removeCache (url) {
      this.memoryThresholdExceededCacheArray = this.memoryThresholdExceededCacheArray.filter(cache => cache.url !== url)
    }
  },

  watch: {
    monitoringEnabled (newValue) {
      if (newValue) {
        this.startMonitoring()
      } else {
        this.stopMonitoring()
      }
    }
  },

  mounted () {
    this.checkDetailedMemorySupport()
    if (this.monitoringEnabled) {
      this.startMonitoring()
    }
  },

  beforeDestroy () {
    this.stopMonitoring()
    if (this.cacheTimeout) {
      clearTimeout(this.cacheTimeout)
    }
  }
}
</script>
