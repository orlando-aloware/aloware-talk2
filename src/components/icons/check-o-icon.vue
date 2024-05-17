<template>
  <svg :width="width" :height="height" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg" data-testid="check-o-icon-svg">
    <path d="M1 5.92341L4.75833 10L13 1" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
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
