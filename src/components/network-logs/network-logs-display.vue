<template>
  <div data-testid="network-logs-wrapper">
    <q-card flat bordered class="ring-group-snapshot-card"
            data-testid="network-logs-card">
      <q-card-section data-testid="network-logs-card-section">
        <div class="text-h6">Call Quality</div>
      </q-card-section>
      <q-separator inset />
      <q-card-section class="text-left"
                      data-testid="network-logs-card-section"
                      v-if="showNetworkLogs">
        <div :key="callIssueIndex"
            v-for="(callIssue,callIssueIndex) in mapCallIssues">
          <q-card flat
                  bordered
                  class="ring-group-snapshot-card mb-2 text-15"
                  v-if="networkIssues[callIssue.data.name]">
            <div class="text-left m-4 ">
              <h5 class="mr-1">Agent:</h5>
              {{ user.full_name }}<br/>
              <div v-if="callIssue.data.name === 'rtt'">
                <network-signal-strength :value-issue="callIssue.data.avg"
                                         :issue="networkIssues[callIssue.data.name]" />
                <h5 class="mr-1">Max outbound Latency:</h5>
                {{ callIssue.data.max }} ms<br/>
                <h5 class="mr-1">Avg outbound Latency:</h5>
                {{ callIssue.data.avg }} ms
              </div>
              <div v-else-if="callIssue.data.name === 'mos'">
                <network-signal-strength :value-issue="callIssue.data.avg"
                                         :issue="networkIssues[callIssue.data.name]" />
                <h5 class="mr-1">Outbound MOS: </h5>
                {{ callIssue.data.avg }}
              </div>
              <div v-else-if="callIssue.data.name === 'jitter'">
                <network-signal-strength :value-issue="callIssue.data.max"
                                         :issue="networkIssues[callIssue.data.name]" />
                <h5 class="mr-1">Max inbound Jitter:</h5>
                {{ callIssue.data.max }} ms<br/>
                <h5 class="mr-1">Avg inbound Jitter:</h5>
                {{ callIssue.data.avg }} ms
              </div>
              <div v-else-if="callIssue.data.name === 'bytesReceived'">
                <network-signal-strength :value-issue="callIssue.data.min"
                                         :issue="networkIssues[callIssue.data.name]" />
                <h5 class="mr-1">Bytes received:</h5>
                {{ callIssue.data.avg }}
              </div>
              <div v-else-if="callIssue.data.name === 'bytesSent'">
                <network-signal-strength :value-issue="callIssue.data.min"
                                         :issue="networkIssues[callIssue.data.name]" />
                <h5 class="mr-1">Bytes sent:</h5>
                {{ callIssue.data.avg }}
              </div>
              <div v-else-if="callIssue.data.name === 'packetsLostFraction'">
                <network-signal-strength :value-issue="callIssue.data.avg"
                                         :issue="networkIssues[callIssue.data.name]" />
                <h5 class="mr-1">Inbound Packet Loss: </h5>
                {{ callIssue.data.avg }}%
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
      networkIssues: {
        'rtt': {
          'description': 'Outbound high latency',
          'bucketing': [
            { min: 300, max: Infinity },
            { min: 200, max: 300 },
            { min: 150, max: 200 },
            { min: 0, max: 150 }
          ]
        },
        'mos': {
          'description': 'Outbound low MOS',
          'bucketing': [
            { min: 0, max: 2.4 },
            { min: 2.5, max: 2.9 },
            { min: 3.0, max: 3.4 },
            { min: 3.5, max: 5.0 }
          ]
        },
        'jitter': {
          'description': 'Inbound high jitter',
          'bucketing': [
            { min: 40, max: Infinity },
            { min: 36, max: 40 },
            { min: 30, max: 35 },
            { min: 0, max: 29 }
          ]
        },
        'packetsLostFraction': {
          'description': 'Inbound packet loss',
          'bucketing': [
            { min: 3, max: Infinity },
            { min: 2, max: 3 },
            { min: 1, max: 2 },
            { min: 0, max: 1 }
          ]
        },
        'bytesReceived': {
          'description': 'Low bytes received',
          'bucketing': [
            { min: 0, max: 0 }
          ]
        },
        'bytesSent': {
          'description': 'Low bytes sent',
          'bucketing': [
            { min: 0, max: 0 }
          ]
        }
      }
    }
  },
  methods: {
    calculateAvgMetrics (threshold, values) {
      values = values.filter((value) => {
        if (threshold.name === 'max') {
          return value > threshold.value
        } else if (threshold.name === 'min') {
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
        const max = Math.max(...issue.data.values).toFixed(2)
        const min = Math.min(...issue.data.values).toFixed(2)
        const avg = this.calculateAvgMetrics(issue.data.threshold, issue.data.values)

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
