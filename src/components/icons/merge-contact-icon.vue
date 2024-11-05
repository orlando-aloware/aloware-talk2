<template>
  <svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="height" viewBox="0 0 24 24" fill="none">
    <g transform="translate(-3, 0) rotate(90, 12, 12)">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M17 20.41L18.41 19 15 15.59 13.59 17 17 20.41zM7.5 8H11v5.59L5.59 19 7 20.41l6-6V8h3.5L12 3.5 7.5 8z" fill="#62666E"/>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'merge-contact-icon',
  props: {
    width: {
      type: [Number, String],
      default: 24
    },
    height: {
      type: [Number, String],
      default: 24
    }
  }
}
</script>

<style scoped>
</style>
