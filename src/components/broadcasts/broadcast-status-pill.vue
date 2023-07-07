<template>
  <span>
    <span class="broadcast-status-pill mt-2 px-2 py-1 rounded-borders"
         :class="this.label.toLowerCase()">
      {{ label }}
    </span>
  </span>
</template>
<script>
export default {
  props: {
    status: {
      type: Number,
      required: true
    },

    text: {
      type: String,
      required: true
    }
  },

  computed: {
    label () {
      return this.text
    }
  }
}
</script>
