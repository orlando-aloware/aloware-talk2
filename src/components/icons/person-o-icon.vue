<template>
  <svg :width="width" :height="height" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.38379 12.9997C1.38379 10.6224 3.33269 8.69531 5.73678 8.69531H8.63878C11.0429 8.69531 12.9918 10.6224 12.9918 12.9997" :stroke="color" stroke-width="1.2" stroke-linecap="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.18778 6.86957C8.87727 6.86957 9.89631 5.55562 9.89631 3.93478C9.89631 2.31395 8.84834 1 7.18778 1C5.52721 1 4.47925 2.31395 4.47925 3.93478C4.47925 5.55562 5.49828 6.86957 7.18778 6.86957Z" :stroke="color" stroke-width="1.2"/>
  </svg>

</template>

<script>
export default {
  name: 'person-o-icon',

  props: {
    width: {
      type: [Number, String],
      default: 14
    },
    height: {
      type: [Number, String],
      default: 14
    },
    color: {
      type: String,
      default: '#62666E'
    }
  }
}
</script>

<style scoped>

</style>
