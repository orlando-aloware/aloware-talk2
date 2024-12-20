<template>
  <div class="row">
    <div class="col-12 d-flex align-items-center justify-content-left"
         data-testid="wait-time-div">
      <span v-if="row.type === CommunicationTypes.CALL">{{ row.wait_time | fixDuration }}</span>
      <span v-else>
        -
      </span>
    </div>
  </div>
</template>

<script>
import * as CommunicationTypes from 'src/constants/communication-types'

export default {
  name: 'WaitTime',
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
