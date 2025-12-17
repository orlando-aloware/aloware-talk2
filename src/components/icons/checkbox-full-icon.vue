<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect :width="width" :height="height" rx="4" :fill="color"/>
    <path d="M4 8.00875L6.50555 10.5L12 5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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
