<template>
  <div class="agents-status-pills">
    <b-button :class="classes(status.name)"
              pill
              size="sm"
              :key="status.value"
              v-for="status in statuses">
      <span class="agents-status-pills__pill__counter">
        {{ status.agents }}
      </span>
      <span>
        {{ status.label }}
      </span>
    </b-button>
  </div>
</template>

<script>
import { LABELS } from 'src/constants/agent-status-labels'

export default {
  name: 'agents-status-chips',

  props: {
    agents: {
      type: Array,
      required: true
    }
  },

  computed: {
    statuses () {
      const status = {}

      this.agents.forEach(agent => {
        // create the structure in the first occurrence
        if (!status[agent.agent_status]) {
          // copy the status data, adding an agents counter
          status[agent.agent_status] = {
            ...LABELS.find(status => status.value === agent.agent_status),
            agents: 0
          }
        }

        status[agent.agent_status].agents++
      })

      return Object.values(status)
        .sort((a, b) => a.agents < b.agents ? 1 : -1)
    }
  },

  methods: {
    classes (status) {
      return [
        'agents-status-pills__pill',
        `bg-agent-status-${status}`
      ]
    }
  }
}
</script>
