<template>
  <div class="calls-empty-state">
    <em>{{ label }}</em>
  </div>
</template>

<script>
export default {
  name: 'calls-empty-state.vue',
  props: {
    label: {
      type: String,
      required: true
    }
  }
}
</script>
