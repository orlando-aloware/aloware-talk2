<template>
  <div class="d-flex flex-column"
       data-testid="talk-time-row">
    <div class="d-flex align-items-center justify-content-left"
         v-if="row.type === CommunicationTypes.CALL">
      <span v-if="row.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW && row.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW">
        {{ row.talk_time | fixDuration }}
      </span>
      <relative-time class="text-muted"
                     data-testid="comm-log-relative-time"
                     :from-time="row.created_at"
                     v-else-if="row.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW && row.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW" />
    </div>
    <div class="d-flex align-items-center justify-content-left">
      <span v-if="row.direction === CommunicationDirection.INBOUND
        && row.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW
        && [CallbackStatus.CALLBACK_STATUS_INITIATED, CallbackStatus.CALLBACK_STATUS_REQUESTED].includes(row.callback_status)">
        Callback {{ getVisibleCallbackStatus(row) }}
      </span>
      <span v-else-if="row.type === CommunicationTypes.SMS">
        -
      </span>
      <span v-else>
        {{ getVisibleStatus(row) }}
      </span>
    </div>
  </div>
</template>

<script>
import RelativeTime from 'components/relative-time.vue'
import * as CommunicationTypes from 'src/constants/communication-types'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as CommunicationDirection from 'src/constants/communication-direction'
import * as CallbackStatus from 'src/constants/callback-status'

export default {
  name: 'TalkTime',

  components: {
    RelativeTime
  },

  props: {
    row: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      CommunicationTypes,
      CommunicationDispositionStatus,
      CommunicationCurrentStatus,
      CommunicationDirection,
      CallbackStatus
    }
  },

  methods: {
    getVisibleStatus (communication) {
      if (communication.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW) {
        return this.$options.filters.capitalize(this.$options.filters.replaceDash(this.$options.filters.translateCurrentStatusText(communication.current_status2)))
      }

      return this.$options.filters.capitalize(this.$options.filters.replaceDash(this.$options.filters.translateDispositionStatusText(communication.disposition_status2)))
    },

    getVisibleCallbackStatus (communication) {
      return this.$options.filters.capitalize(this.$options.filters.replaceDash(this.$options.filters.translateCallbackStatusText(communication.callback_status)))
    }
  }
}
</script>
