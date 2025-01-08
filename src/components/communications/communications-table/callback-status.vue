<template>
  <div data-testid="callback-row">
    <span v-if="row.callback_status">
      {{ row.callback_status | translateCallbackStatusText }}
    </span>

    <span v-else>
      -
    </span>
  </div>
</template>

<script>

export default {
  name: 'CallbackStatus',

  props: {
    row: {
      type: Object,
      required: true
    }
  }
}
</script>
