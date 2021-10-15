<template>
  <svg :width="width" :height="height" viewBox="0 0 6 11" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="5.16721" y1="0.111803" x2="0.223548" y2="9.99913" :stroke="iconColor" stroke-width="0.5"/>
  </svg>
</template>

<script>
export default {
  name: 'slash-icon',
  props: {
    width: {
      type: [Number, String],
      default: 6
    },
    height: {
      type: [Number, String],
      default: 11
    },
    iconColor: {
      type: String,
      default: '#333333'
    }
  }
}
</script>
