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
             v-for="(callIssue, callIssueIndex) in callIssues">
          <q-card class="ring-group-snapshot-card mb-2 text-15"
                  flat
                  bordered
                  v-if="networkIssues[callIssue.event_name]"
          >
            <div class="text-left m-4 ">
              <h5 class="mr-1">Agent:</h5>
              {{ user?.full_name ?? '-' }}<br/>
              <div v-if="callIssue.event_name === RTT_EVENT">
                <network-signal-strength :value-issue="callIssue.avg"
                                         :issue="networkIssues[callIssue.event_name]"
                                         :counter="callIssue.count"
                                         :title="networkIssues[callIssue.event_name].trigger"
                />
                <h5 class="mr-1">Avg outbound Latency:</h5>
                {{ callIssue.avg }} ms
                <br/>
                <h5 class="mr-1">Occurrences:</h5>
                {{ callIssue.count }} times
                <br/><br/>

                {{ networkIssues[callIssue.event_name].details }}
              </div>
              <div v-else-if="callIssue.event_name === MOS_EVENT">
                <network-signal-strength :value-issue="callIssue.avg"
                                         :issue="networkIssues[callIssue.event_name]"
                                         :counter="callIssue.count"
                                         :title="networkIssues[callIssue.event_name].trigger"
                />
                <h5 class="mr-1">Outbound MOS:</h5>
                {{ callIssue.avg }}
                <br/>
                <h5 class="mr-1">Occurrences:</h5>
                {{ callIssue.count }} times
                <br/><br/>

                {{ networkIssues[callIssue.event_name].details }}
              </div>
              <div v-else-if="callIssue.event_name === JITTER_EVENT">
                <network-signal-strength :value-issue="callIssue.avg"
                                         :issue="networkIssues[callIssue.event_name]"
                                         :counter="callIssue.count"
                                         :title="networkIssues[callIssue.event_name].trigger"
                />
                <h5 class="mr-1">Avg inbound Jitter:</h5>
                {{ callIssue.avg }} ms
                <br/>
                <h5 class="mr-1">Occurrences:</h5>
                {{ callIssue.count }} times
                <br/><br/>

                {{ networkIssues[callIssue.event_name].details }}
              </div>
              <div v-else-if="callIssue.event_name === BYTES_RECEIVED_EVENT">
                <network-signal-strength :value-issue="callIssue.avg"
                                         :issue="networkIssues[callIssue.event_name]"
                                         :counter="callIssue.count"
                                         :title="networkIssues[callIssue.event_name].trigger"
                />
                <h5 class="mr-1">Bytes received:</h5>
                {{ callIssue.avg }}
                <br/>
                <h5 class="mr-1">Occurrences:</h5>
                {{ callIssue.count }} times
                <br/><br/>

                {{ networkIssues[callIssue.event_name].details }}
              </div>
              <div v-else-if="callIssue.event_name === BYTES_SENT_EVENT">
                <network-signal-strength :value-issue="callIssue.avg"
                                         :issue="networkIssues[callIssue.event_name]"
                                         :counter="callIssue.count"
                                         :title="networkIssues[callIssue.event_name].trigger"
                />
                <h5 class="mr-1">Bytes sent:</h5>
                {{ callIssue.avg }}
                <br/>
                <h5 class="mr-1">Occurrences:</h5>
                {{ callIssue.count }} times
                <br/><br/>

                {{ networkIssues[callIssue.event_name].details }}
              </div>
              <div v-else-if="callIssue.event_name === HIGH_PACKET_LOSS_EVENT">
                <network-signal-strength :value-issue="callIssue.avg"
                                         :issue="networkIssues[callIssue.event_name]"
                                         :counter="callIssue.count"
                                         :title="networkIssues[callIssue.event_name].trigger"
                />
                <h5 class="mr-1">Inbound Packet Loss: </h5>
                {{ callIssue.avg }}%
                <br/>
                <h5 class="mr-1">Occurrences:</h5>
                {{ callIssue.count }} times
                <br/><br/>

                {{ networkIssues[callIssue.event_name].details }}
              </div>
              <div v-else-if="callIssue.event_name === HIGH_PACKETS_LOST_FRACTION_EVENT">
                <network-signal-strength :value-issue="callIssue.avg"
                                         :issue="networkIssues[callIssue.event_name]"
                                         :counter="callIssue.count"
                                         :title="networkIssues[callIssue.event_name].trigger"
                />
                <h5 class="mr-1">Inbound Packet Loss Fraction: </h5>
                {{ callIssue.avg }}%
                <br/>
                <h5 class="mr-1">Occurrences:</h5>
                {{ callIssue.count }} times
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
import { RTT_EVENT, MOS_EVENT, JITTER_EVENT, HIGH_PACKET_LOSS_EVENT, HIGH_PACKETS_LOST_FRACTION_EVENT, BYTES_RECEIVED_EVENT, BYTES_SENT_EVENT, networkIssues } from '../../constants/network-logs/network-issues'

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
      RTT_EVENT,
      MOS_EVENT,
      JITTER_EVENT,
      HIGH_PACKET_LOSS_EVENT,
      HIGH_PACKETS_LOST_FRACTION_EVENT,
      BYTES_RECEIVED_EVENT,
      BYTES_SENT_EVENT,
      networkIssues
    }
  },

  computed: {
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
