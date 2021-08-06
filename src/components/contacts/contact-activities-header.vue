<template>
  <div class="calls-header">
    <div class="calls-header__label">
      {{ label }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'contact-activities-header',

  props: {
    label: {
      type: String,
      required: true
    }
  }
}
</script>
