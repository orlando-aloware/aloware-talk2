<template>
  <div data-testid="callback-row">
    <rate :value="row.csat_score"
          v-if="row.csat_score"/>

    <span v-else>
      -
    </span>
  </div>
</template>

<script>
import Rate from 'src/components/rate.vue'

export default {
  name: 'CsatScore',

  components: {
    Rate
  },

  props: {
    row: {
      type: Object,
      required: true
    }
  }
}
</script>
