<template>
  <svg :width="width" :height="height" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M7 13C10.3136 13 13 10.3136 13 7C13 3.68636 10.3136 1 7 1C3.68636 1 1 3.68636 1 7C1 10.3136 3.68636 13 7 13Z" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7 9.60999V6.33726" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7 4.70056V4.42783" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

</template>

<script>
export default {
  name: 'information-icon',
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
