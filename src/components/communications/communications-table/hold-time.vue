<template>
  <div class="d-flex flex-column"
       data-testid="hold-time-row">
    <div class="d-flex justify-content-left"
         data-testid="hold-time-div">
      <span v-if="row.type === CommunicationTypes.CALL">
        {{ row.hold_time | fixDuration }}
      </span>
      <span v-else>
        -
      </span>
    </div>
  </div>
</template>

<script>
import * as CommunicationTypes from 'src/constants/communication-types'

export default {
  name: 'HoldTime',

  props: {
    row: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      CommunicationTypes
    }
  }
}
</script>
