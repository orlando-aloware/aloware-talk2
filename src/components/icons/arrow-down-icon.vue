<template>
  <svg :width="width" :height="height" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" data-testid="arrow-down-icon-svg">
    <path d="M8.75 20.9375L20 32.1875L31.25 20.9375" :stroke="color" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M20 30.623V7.81055" :stroke="color" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
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
