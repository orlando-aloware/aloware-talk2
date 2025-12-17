<template>
  <div data-testid="creator-type-row">
    <span v-if="row.creator_type">
      {{ row.creator_type | translateCreatorType }}
    </span>

    <span v-else>
      -
    </span>
  </div>
</template>

<script>

export default {
  name: 'CreatorType',

  props: {
    row: {
      type: Object,
      required: true
    }
  }
}
</script>
