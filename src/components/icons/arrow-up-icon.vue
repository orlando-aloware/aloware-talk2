<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 7.00391L8 3.00391L12 7.00391" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8 3.67285L8 13.0062" :stroke="color" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
</template>

<script>
export default {
  name: 'arrow-down-icon',

  props: {
    width: {
      type: [Number, String],
      default: 40
    },
    height: {
      type: [Number, String],
      default: 40
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
