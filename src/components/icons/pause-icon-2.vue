<template>
  <svg :width="width" :height="height" viewBox="0 0 9 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M2.30733 0H1.15421C0.516757 0 0 0.511675 0 1.14286V8.85714C0 9.48833 0.516757 10 1.15421 10H2.30733C2.94478 10 3.46154 9.48833 3.46154 8.85714V1.14286C3.46154 0.511675 2.94478 0 2.30733 0ZM6.69267 0H7.84579C8.48324 0 9 0.511675 9 1.14286V8.85714C9 9.48833 8.48324 10 7.84579 10H6.69267C6.05521 10 5.53846 9.48833 5.53846 8.85714V1.14286C5.53846 0.511675 6.05521 0 6.69267 0Z" :fill="color"/>
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
