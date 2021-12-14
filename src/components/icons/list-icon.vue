<template>
  <svg :width="width" :height="height" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.5 1H13" stroke="#62666E" stroke-width="1.2" stroke-miterlimit="10" stroke-linecap="round"/>
    <circle cx="1.5" cy="5" r="1" fill="#62666E"/>
    <circle cx="1.5" cy="9" r="1" fill="#62666E"/>
    <circle cx="1.5" cy="1" r="1" fill="#62666E"/>
    <path d="M4.5 5.00098H13" stroke="#62666E" stroke-width="1.2" stroke-miterlimit="10" stroke-linecap="round"/>
    <path d="M4.5 8.99927H13" stroke="#62666E" stroke-width="1.2" stroke-miterlimit="10" stroke-linecap="round"/>
  </svg>
</template>

<script>
export default {
  name: 'pencil-o-icon',
  props: {
    color: {
      type: String,
      default: '#256EFF',
      required: false
    },
    height: {
      type: String,
      default: '14',
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
