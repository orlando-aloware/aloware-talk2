<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" :width="width" :height="height" rx="3.5" fill="white" stroke="#D8D8D8"/>
  </svg>
</template>

<script>
export default {
  name: 'check-o-icon',
  props: {
    color: {
      type: String,
      default: '#62666E',
      required: false
    },
    height: {
      type: String,
      default: '11',
      required: false
    },
    width: {
      type: String,
      default: '14',
      required: false
    }
  }
}
</script>

<style scoped>

</style>
