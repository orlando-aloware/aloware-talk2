<template>
  <div
    class="inbox-nav-badge"
    v-bind:class="{
      'inbox-nav-badge--danger': color === 'danger',
      'inbox-nav-badge--closed': closed
    }"
  >
    {{ value }}
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: [Number, String],
      default: 0
    },
    color: {
      type: String,
      default: 'default'
    },
    closed: {
      type: Boolean,
      default: false
    }
  }
}
</script>
