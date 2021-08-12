<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="9" r="6" :stroke="color" stroke-width="1.2"/>
    <path d="M7.75 6V9L10.9323 10.625" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.33838 1H9.9113" :stroke="color" stroke-width="1.2" stroke-linecap="round"/>
  </svg>
</template>

<script>
export default {
  name: 'timer-o-icon',
  props: {
    color: {
      type: String,
      default: '#62666E',
      required: false
    },
    height: {
      type: String,
      default: '16',
      required: false
    },
    width: {
      type: String,
      default: '16',
      required: false
    }
  }
}
</script>

<style scoped>

</style>
