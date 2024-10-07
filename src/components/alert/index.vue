<template>
  <div class="d-flex justify-content-center">
    <div class="alert w-auto fade show"
         role="alert"
         :class="`alert-${type} border-${type}`"
    >
      <slot />
    </div>
  </div>
</template>
<script>

export default {
  name: 'AlAlert',

  props: {

    // success/warning/info/error
    type: {
      default: 'warning',
      type: String,
      validator: function (value) {
        // The value must match one of these strings
        return ['success', 'warning', 'info', 'danger'].includes(value)
      }
    }
  }
}
</script>
