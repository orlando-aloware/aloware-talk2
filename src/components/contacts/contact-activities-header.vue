<template>
  <div class="calls-header">
    <div class="calls-header__label">
      {{ label }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'calls-header.vue',
  props: {
    label: {
      type: String,
      required: true
    }
  }
}
</script>
