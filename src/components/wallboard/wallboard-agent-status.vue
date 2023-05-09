<template>
  <div class="users__table__agent-status"
       :id="`status-container-${_uid}`">
    <b-button block
              :class="['users__table__agent-status__button', `bg-agent-status-${status.name}`, { 'cursor-blocked': !isAllowed }]"
              :id="`status-btn-${_uid}`"
              size="sm">
      {{ status.label }}
    </b-button>
    <b-popover ref="popover"
               :container="`status-container-${_uid}`"
               :target="`status-btn-${_uid}`"
               triggers="click blur"
               v-if="isAllowed">
      <div class="users__table__agent-status__popover__header">
        <span>Modify Agent's Status</span>
      </div>
      <div class="users__table__agent-status__popover__body">
        <span :key="status.name"
              v-for="status in availableStatus"
              @click="onStatusChange(status.value)">
          <q-badge :class="['rounded-badge bordered mr-1', `bg-agent-status-${status.name}`]"/>
          {{ status.label }}
        </span>
      </div>
    </b-popover>
  </div>
</template>

<script>
import * as AgentStatus from 'src/constants/agent-status'
import { LABELS } from 'src/constants/agent-status-labels'
import { aclMixin } from 'src/plugins/mixins'

export default {
  name: 'wallboard-agent-status',

  mixins: [
    aclMixin
  ],

  props: {
    value: {
      type: Number,
      required: true
    }
  },

  computed: {
    status () {
      return LABELS.find(status => status.value === this.value)
    },

    availableStatus () {
      return LABELS.filter(status => status.disabled !== true)
    },

    isAllowed () {
      return this.hasRole('Company Admin') && ![AgentStatus.AGENT_STATUS_ON_CALL, AgentStatus.AGENT_STATUS_RINGING].includes(this.value)
    }
  },

  data: () => ({
    AgentStatus
  }),

  methods: {
    onStatusChange (status) {
      this.$emit('status-change', status)

      this.$refs.popover.$emit('close')
    }
  }
}
</script>
