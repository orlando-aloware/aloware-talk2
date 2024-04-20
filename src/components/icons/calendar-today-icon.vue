<template>
  <svg :width="width" :height="height" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" data-testid="calendar-today-icon-svg">
    <path d="M11.1818 3H11.9916C13.6531 3 15 4.34238 15 6.00335V13.9966C15 15.6554 13.6576 17 11.9966 17H4.00335C2.34465 17 1 15.6576 1 13.9966V6.00335C1 4.34465 2.33541 3 4.00844 3H4.81818" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M5 3.49917C5 4.32805 5.66503 5 6.49858 5H9.50142C10.3291 5 11 4.32145 11 3.49917V3C11 1.89543 10.1017 1 9.00209 1H6.99791C5.8945 1 5 1.88773 5 3V3.49917Z" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

</template>

<script>
export default {
  name: 'calendar-today-icon',
  props: {
    width: {
      type: [Number, String],
      default: 16
    },
    height: {
      type: [Number, String],
      default: 18
    },
    color: {
      type: String,
      default: '#95989E'
    }
  }
}
</script>

<style scoped>

</style>
