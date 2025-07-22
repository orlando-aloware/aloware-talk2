<template>
  <i :style="{ fontSize: `${size}px`, color: color }" class="material-icons">
    open_in_new
  </i>
</template>

<script>
export default {
  name: 'open-in-new-icon',
  props: {
    color: {
      type: String,
      default: 'var(--q-color-primary)',
      required: false
    },
    size: {
      type: [String, Number],
      default: 20,
      required: false
    }
  }
}
</script>
