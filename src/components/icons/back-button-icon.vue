<template>
  <svg :width="width" :height="height" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 11L1 6L6 1" :stroke="color" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'back-button-icon',
  props: {
    width: {
      type: [Number, String],
      default: 7
    },
    height: {
      type: [Number, String],
      default: 12
    },
    color: {
      type: String,
      default: '#256EFF'
    }
  }
}
</script>
