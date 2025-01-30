<template>
  <div class="d-flex flex-column"
       data-testid="duration-row">
    <div class="d-flex align-items-center justify-content-left"
         v-if="row.type === CommunicationTypes.CALL">
      <span>{{ row.duration | fixDuration }}</span>
    </div>

    <div class="d-flex align-items-center justify-content-left"
         data-testid="status-div">
      <span v-if="row.type === CommunicationTypes.SMS">
        -
      </span>
      <span v-else>
        {{ getVisibleStatus(row) }}
      </span>
    </div>
  </div>
</template>

<script>
import * as CommunicationTypes from 'src/constants/communication-types'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'

export default {
  name: 'Contact',

  props: {
    row: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      CommunicationTypes,
      CommunicationCurrentStatus
    }
  },

  methods: {
    getVisibleStatus (communication) {
      if (communication.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW) {
        return this.$options.filters.capitalize(this.$options.filters.replaceDash(this.$options.filters.translateCurrentStatusText(communication.current_status2)))
      }

      return this.$options.filters.capitalize(this.$options.filters.replaceDash(this.$options.filters.translateDispositionStatusText(communication.disposition_status2)))
    }
  }
}
</script>
