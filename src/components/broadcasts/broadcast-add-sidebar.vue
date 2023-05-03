<template>
  <div class="broadcasts__add__sidebar">
    {{ currentStep }}
  </div>
</template>

<script>
export default {
  name: 'broadcast-add-sidebar',

  props: {
    currentStep: {
      type: Object,
      required: true
    },

    steps: {
      type: Array,
      required: true
    }
  }
}
</script>
