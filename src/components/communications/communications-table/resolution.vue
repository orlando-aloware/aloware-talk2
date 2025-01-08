<template>
  <div data-testid="resolution-row">
    <span>{{ resolution }}</span>
  </div>
</template>

<script>
import * as CommunicationTypes from 'src/constants/communication-types'

export default {
  name: 'Resolution',

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
  },

  computed: {
    resolution () {
      return this.$options.filters.capitalize(this.$options.filters.replaceDash(this.$options.filters.translateResolutionText(this.row.resolution2)))
    }
  }
}
</script>
