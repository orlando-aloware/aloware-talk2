<template>
  <svg :width="width" :height="height" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.78159 3.33252H4.1411C3.78703 3.33252 3.5 3.6054 3.5 3.94201V8.05605C3.5 8.39266 3.78703 8.66554 4.1411 8.66554H4.78159C5.13566 8.66554 5.42269 8.39266 5.42269 8.05605V3.94201C5.42269 3.6054 5.13566 3.33252 4.78159 3.33252ZM7.21804 3.33263H7.85854C8.21261 3.33263 8.49964 3.60551 8.49964 3.94212V8.05616C8.49964 8.39277 8.21261 8.66565 7.85854 8.66565H7.21804C6.86398 8.66565 6.57695 8.39277 6.57695 8.05616V3.94212C6.57695 3.60551 6.86398 3.33263 7.21804 3.33263Z" :fill="color"/>
    <circle cx="6" cy="6" r="5.5" :stroke="color"/>
  </svg>
</template>

<script>
export default {
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
      default: '#F2994A'
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
