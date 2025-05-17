<template>
  <div data-testid="ring-group-snapshot-wrapper">
    <q-card flat bordered class="ring-group-snapshot-card" data-testid="ring-group-snapshot-card">
      <q-card-section data-testid="ring-group-snapshot-card-section">
        <div class="text-h6">Ring Group Snapshot</div>
      </q-card-section>
      <q-separator inset />

      <q-card-section v-if="showRingGroupSnapShot"
                      class="text-center"
                      data-testid="ring-group-snapshot-card-section">
        <span>This is a snapshot of the ring group at the point when this call arrived.</span>
        <ring-group-routing-table
          v-for="layer in displayLayers"
          :key="layer.layer"
          :columns="columns"
          :layer="layer"
          :ring-group="ringGroup"
          data-testid="ring-group-snapshot-routing-table">
        </ring-group-routing-table>
      </q-card-section>
      <q-card-section v-else data-testid="ring-group-snapshot-card-section">
        <div class="text-center text-md _400">
          <p class="mb-0">
            {{ snapshotDescription }}
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
import { DISPOSITION_STATUS_ABANDONED_NEW } from 'src/constants/communication-disposition-status'
import { INBOUND } from 'src/constants/communication-direction'
import { userMixin } from 'src/plugins/mixins'
import { CREATOR_TYPE_WORKFLOW } from 'src/constants/creator-types'

export default {
  name: 'ring-group-snapshot',
  mixins: [userMixin],
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
          name: 'teams',
          field: 'teams',
          label: 'Teams',
          align: 'left',
          style: 'width: 20%'
        },
        {
          name: 'status',
          field: 'status',
          label: 'Status',
          align: 'left',
          style: 'width: 10%'
        },
        {
          name: 'user',
          field: 'user',
          label: 'User',
          align: 'left',
          style: 'width: 40%'
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
      AgentStatusLabels,
      DISPOSITION_STATUS_ABANDONED_NEW
    }
  },

  computed: {
    showRingGroupSnapShot () {
      return this.ringGroup &&
        this.hasRingGroupSnapshot &&
        (this.isInboundCall || this.isCreatedFromSequence)
    },

    isInboundCall () {
      return this.communication.direction === INBOUND
    },

    hasRingGroupSnapshot () {
      return this.communication.metadata?.ring_group_snapshot
    },

    isCreatedFromSequence () {
      return this.communication.creator_type === CREATOR_TYPE_WORKFLOW
    },

    snapshotDescription () {
      if (!this.ringGroup) {
        return 'This call does not have a ring group.'
      }

      if (!this.isInboundCall) {
        return 'Outbound calls don\'t have a ring group snapshot.'
      }

      if (this.communication.disposition_status2 === DISPOSITION_STATUS_ABANDONED_NEW) {
        return 'Abandoned calls don\'t have a ring group snapshot.'
      }

      return 'This communication does not have a snapshot.'
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
    showRingGroupSnapShot (newValue) {
      if (newValue) {
        this.setLayers()
      }
    }
  }
}
</script>
