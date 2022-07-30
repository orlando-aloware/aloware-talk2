<template>
  <svg :width="width" :height="height" viewBox="0 0 9 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.5 4L4.5 1L7.5 4" stroke="#62666E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4.5 1.5V8.5" stroke="#62666E" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
</template>

<script>
export default {
  name: 'contact-in-queue-icon',
  props: {
    width: {
      type: [Number, String],
      default: 11
    },
    height: {
      type: [Number, String],
      default: 11
    },
    color: {
      type: String,
      default: '#62666E'
    }
  }
}
</script>
