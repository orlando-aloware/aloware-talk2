<template>
  <svg :width="width" :height="height" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="6" :stroke="color" stroke-width="1.2"/>
    <path d="M7 4.5V9.5" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9.5 7H4.5" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'add-icon-circle',
  props: {
    width: {
      type: [Number, String],
      default: 24
    },
    height: {
      type: [Number, String],
      default: 24
    },
    color: {
      type: String,
      default: '#00BF4A'
    }
  }
}
</script>

<style scoped>

</style>
