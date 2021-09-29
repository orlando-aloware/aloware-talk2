<template>
  <svg :width="width" :height="height" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z" :stroke="color" stroke-width="1.2"/>
    <path d="M3.08447 11.4845C3.65546 10.2604 4.89713 9.41211 6.33692 9.41211H7.66301C9.10014 9.41211 10.3399 10.2573 10.9123 11.4777" :stroke="color" stroke-width="1.2" stroke-linecap="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M6.9999 7.85C8.30982 7.85 9.0999 6.82025 9.0999 5.55C9.0999 4.27974 8.28739 3.25 6.9999 3.25C5.71242 3.25 4.8999 4.27974 4.8999 5.55C4.8999 6.82025 5.68999 7.85 6.9999 7.85Z" :stroke="color" stroke-width="1.2"/>
  </svg>

</template>

<script>
export default {
  name: 'personalization-o-icon',
  props: {
    color: {
      type: String,
      default: '#62666E',
      required: false
    },
    height: {
      type: String,
      default: '15',
      required: false
    },
    width: {
      type: String,
      default: '15',
      required: false
    }
  }
}
</script>

<style scoped>

</style>
