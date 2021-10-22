<template>
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M6 0.9C3.18335 0.9 0.9 3.18335 0.9 6C0.9 8.81665 3.18335 11.1 6 11.1C8.81665 11.1 11.1 8.81665 11.1 6C11.1 3.18335 8.81665 0.9 6 0.9ZM0 6C0 2.68629 2.68629 0 6 0C9.31371 0 12 2.68629 12 6C12 9.31371 9.31371 12 6 12C2.68629 12 0 9.31371 0 6Z" fill="#62666E"/>
    <circle cx="5.99996" cy="5.99996" r="2.45455" fill="#FA003F"/>
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
