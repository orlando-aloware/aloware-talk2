<template>
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="10" height="10" rx="2" fill="#62666E"/>
  </svg>
</template>

<script>
export default {
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

<style lang="scss" scoped>
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.svg circle {
  fill: $orange;
}
.svg:hover circle {
  fill: darken($orange, 7%);
}
</style>
