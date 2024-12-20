<template>
  <div>
    <div class="row"
         data-testid="duration-div"
         v-if="row.type === CommunicationTypes.CALL">
      <div class="col-12 d-flex align-items-center justify-content-left">
        <span>{{ row.duration | fixDuration }}</span>
      </div>
    </div>
    <div class="row">
      <div class="col-12 d-flex align-items-center justify-content-left"
           data-testid="status-div">
        <span>{{ getVisibleStatus(row) }}</span>
      </div>
    </div>
  </div>
</template>
<script>
import * as CommunicationTypes from 'src/constants/communication-types'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'

export default {
  name: 'TalkTime',
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
