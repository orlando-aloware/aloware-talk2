<template>
  <svg :width="width" :height="height" viewBox="0 0 12 4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="1.5" cy="2" r="1.5" :fill="color"/>
    <circle cx="6" cy="2" r="1.5" :fill="color"/>
    <circle cx="10.5" cy="2" r="1.5" :fill="color"/>
  </svg>
</template>

<script>
export default {
  name: 'ellipse-icon',
  props: {
    color: {
      type: String,
      default: '#62666E',
      required: false
    },
    height: {
      type: String,
      default: '4',
      required: false
    },
    width: {
      type: String,
      default: '12',
      required: false
    }
  }
}
</script>
