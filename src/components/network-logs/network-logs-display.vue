<template>
  <div data-testid="network-logs-wrapper">
    <q-card
      class="ring-group-snapshot-card"
      flat
      bordered
      data-testid="network-logs-card"
    >
      <q-card-section data-testid="network-logs-card-section">
        <div class="text-h6">Call Quality</div>
      </q-card-section>
      <q-separator inset />
      <q-card-section class="text-left"
                      data-testid="network-logs-card-section"
                      v-if="showNetworkLogs"
      >
        <div :key="callIssueIndex"
             v-for="(callIssue,callIssueIndex) in mapCallIssues">
          <q-card class="ring-group-snapshot-card mb-2 text-15"
                  flat
                  bordered
                  v-if="networkIssues[callIssue.data.name] || networkIssues[callIssue.event_name]"
          >
            <div class="text-left m-4 ">
              <h5 class="mr-1">Agent:</h5>
              {{ user.full_name }}<br/>
              <div v-if="callIssue.data.name === 'rtt'">
                <network-signal-strength :value-issue="callIssue.data.avg"
                                         :issue="networkIssues[callIssue.data.name]"
                                         :title="networkIssues[callIssue.data.name].trigger"
                />
                <h5 class="mr-1">Max outbound Latency:</h5>
                {{ callIssue.data.max }} ms<br/>
                <h5 class="mr-1">Avg outbound Latency:</h5>
                {{ callIssue.data.avg }} ms
                <br/><br/>

                {{ networkIssues[callIssue.data.name].details }}
              </div>
              <div v-else-if="callIssue.data.name === 'mos'">
                <network-signal-strength :value-issue="callIssue.data.avg"
                                         :issue="networkIssues[callIssue.data.name]"
                                         :title="networkIssues[callIssue.data.name].trigger"
                />
                <h5 class="mr-1">Outbound MOS:</h5>
                {{ callIssue.data.avg }}
                <br/><br/>

                {{ networkIssues[callIssue.data.name].details }}
              </div>
              <div v-else-if="callIssue.data.name === 'jitter'">
                <network-signal-strength :value-issue="callIssue.data.max"
                                         :issue="networkIssues[callIssue.data.name]"
                                         :title="networkIssues[callIssue.data.name].trigger"
                />
                <h5 class="mr-1">Max inbound Jitter:</h5>
                {{ callIssue.data.max }} ms<br/>
                <h5 class="mr-1">Avg inbound Jitter:</h5>
                {{ callIssue.data.avg }} ms
                <br/><br/>

                {{ networkIssues[callIssue.data.name].details }}
              </div>
              <div v-else-if="callIssue.data.name === 'bytesReceived'">
                <network-signal-strength :value-issue="callIssue.data.min"
                                         :issue="networkIssues[callIssue.data.name]"
                                         :title="networkIssues[callIssue.data.name].trigger"
                />
                <h5 class="mr-1">Bytes received:</h5>
                {{ callIssue.data.avg }}
                <br/><br/>

                {{ networkIssues[callIssue.data.name].details }}
              </div>
              <div v-else-if="callIssue.data.name === 'bytesSent'">
                <network-signal-strength :value-issue="callIssue.data.min"
                                         :issue="networkIssues[callIssue.data.name]"
                                         :title="networkIssues[callIssue.data.name].trigger"
                />
                <h5 class="mr-1">Bytes sent:</h5>
                {{ callIssue.data.avg }}
                <br/><br/>

                {{ networkIssues[callIssue.data.name].details }}
              </div>
              <div v-else-if="callIssue.event_name === 'high-packet-loss'">
                <network-signal-strength :value-issue="callIssue.data.avg"
                                         :issue="networkIssues[callIssue.event_name]"
                                         :title="networkIssues[callIssue.event_name].trigger"
                />
                <h5 class="mr-1">Inbound Packet Loss: </h5>
                {{ callIssue.data.avg }}%
                <br/><br/>

                {{ networkIssues[callIssue.event_name].details }}
              </div>
              <div v-else-if="callIssue.event_name === 'high-packets-lost-fraction'">
                <network-signal-strength :value-issue="callIssue.data.avg"
                                         :issue="networkIssues[callIssue.event_name]"
                                         :title="networkIssues[callIssue.event_name].trigger"
                />
                <h5 class="mr-1">Inbound Packet Loss Fraction: </h5>
                {{ callIssue.data.avg }}%
                <br/><br/>

                {{ networkIssues[callIssue.event_name].details }}
              </div>
            </div>
          </q-card>
        </div>
      </q-card-section>
      <q-card-section data-testid="network-logs-card-section"
                      v-else>
        <div class="text-center _400">
          No call quality issues detected
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>
<script>
import NetworkSignalStrength from 'components/network-logs/network-signal-strength'
import { networkIssues } from '../../constants/network-logs/network-issues'

export default {
  name: 'network-logs-display',

  components: { NetworkSignalStrength },

  props: {
    callIssues: {
      required: true
    },
    user: {
      required: true
    }
  },

  data () {
    return {
      networkIssues
    }
  },
  methods: {
    calculateAvgMetrics (threshold, values) {
      // If no threshold or values, return 'N/A'
      if (!threshold || !values || values.length === 0) return 'N/A'

      values = values.filter((value) => {
        if (threshold.name === 'max' || threshold.name === 'maxAverage') {
          return value > threshold.value
        } else if (threshold.name === 'min' || threshold.name === 'minAverage') {
          return value < threshold.value
        }
      })
      const sum = values.reduce((accum, current) => accum + current, 0)

      return parseFloat((sum / values.length).toFixed(2))
    }
  },
  computed: {
    mapCallIssues () {
      return this.callIssues.map(issue => {
        // Ensure issue.data exists and handle missing fields
        const data = issue.data || {}

        // Check if values is a valid array, otherwise default to empty
        const values = Array.isArray(data.values) ? data.values : []

        // If no values, thresholds, or data, handle it gracefully
        const max = values.length ? Math.max(...values).toFixed(2) : 'N/A'
        const min = values.length ? Math.min(...values).toFixed(2) : 'N/A'
        const avg = values.length && data.threshold ? this.calculateAvgMetrics(data.threshold, values) : 'N/A'

        return {
          ...issue,
          data: {
            ...issue.data,
            max: max,
            min: min,
            avg: avg
          }
        }
      })
    },
    showNetworkLogs () {
      return this.callIssues?.length > 0
    }
  }
}
</script>
<style scoped>
h5 {
  font-size: 15px;
  line-height: 35px;
  display: inline;
}
</style>
