<template>
  <div>
    <div class="align-items-center"
         tabindex="0"
         :id="`comm-body-${_uid}`"
         v-if="communication.body">
      <div class="notes mt-1 ellipse"
           v-html="$options.filters.nl2br(communication.body)"/>

      <b-popover triggers="hover focus"
                 custom-class="communication-logs-table__popover"
                 :target="`comm-body-${_uid}`">
        {{ communication.body }}
      </b-popover>
    </div>
    <span v-else>
      -
    </span>
  </div>
</template>

<script>
export default {
  name: 'message-body',

  props: {
    communication: {
      type: Object,
      required: true
    }
  }
}
</script>
