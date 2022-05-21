<template>
  <div>
    <q-card flat bordered class="ring-group-snapshot-card">
      <q-card-section>
        <div class="text-h6">Ring Group Snapshot</div>
      </q-card-section>
      <q-separator inset />

      <q-card-section v-if="communication.metadata && communication.metadata.ring_group_snapshot && ringGroup"
                      class="text-center">
        <span>This is a snapshot of the ring group at the point when this call arrived.</span>
        <ring-group-routing-table
          v-for="layer in displayLayers"
          :key="layer.layer"
          :columns="columns"
          :layer="layer"
          :ring-group="ringGroup">
        </ring-group-routing-table>
      </q-card-section>
      <q-card-section v-else>
        <div class="text-center text-md _400">
          <p class="mb-0">
            {{ !ringGroup ? 'This call does not have a ring group.' : 'This feature is not yet available on your account.' }}
          </p>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>

import * as RingGroupDialMode from '../constants/ring-group-dial-modes'
import * as AgentStatusLabels from '../constants/agent-status-labels'
import RingGroupRoutingTable from 'components/ring-group-routing-table'

export default {
  name: 'ring-group-snapshot',
  components: { RingGroupRoutingTable },
  props: {
    ringGroup: {
      required: true
    },
    communication: {
      required: true
    }
  },

  data () {
    return {
      displayLayers: null,
      columns: [
        {
          name: 'order',
          field: 'order',
          label: 'Order',
          align: 'left',
          style: 'width: 10%'
        },
        {
          name: 'status',
          field: 'status',
          label: 'Status',
          align: 'left',
          style: 'width: 20%'
        },
        {
          name: 'user',
          field: 'user',
          label: 'User',
          align: 'left',
          style: 'width: 50%'
        },
        {
          name: 'take_calls',
          field: 'take_calls',
          label: 'Can take calls?',
          align: 'left',
          style: 'width: 20%'
        }
      ],
      RingGroupDialMode,
      AgentStatusLabels
    }
  },

  methods: {
    setLayers () {
      this.displayLayers = this.communication.metadata && this.communication.metadata.ring_group_snapshot && this.ringGroup ? this.communication.metadata.ring_group_snapshot : null
      if (this.displayLayers) {
        this.displayLayers.forEach(function (layer) {
          layer.order = 1
        })
      }
    }
  },

  created () {
    this.setLayers()
  },

  watch: {
    layers () {
      this.setLayers()
    }
  }
}
</script>
