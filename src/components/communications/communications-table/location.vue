<template>
  <div data-testid="location-row">
    <span v-if="row.state">
      {{ row.city || '' }}{{ (row.city && row.state) ? ', ' : '' }}{{ row.state }}
    </span>
    <span v-else>
      -
    </span>
  </div>
</template>

<script>

export default {
  name: 'Location',

  props: {
    row: {
      type: Object,
      required: true
    }
  }
}
</script>
