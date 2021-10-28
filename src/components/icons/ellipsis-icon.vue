<template>
  <svg width="9" height="3" viewBox="0 0 9 3" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="1.07143" cy="1.07241" r="1.07143" :fill="color"/>
    <circle cx="4.28627" cy="1.07241" r="1.07143" :fill="color"/>
    <circle cx="7.50014" cy="1.07241" r="1.07143" :fill="color"/>
  </svg>
</template>

<script>
export default {
  name: 'ellipsis-icon',
  props: {
    width: {
      type: [Number, String],
      default: 9
    },
    height: {
      type: [Number, String],
      default: 3
    },
    color: {
      type: String,
      default: '#62666E'
    }
  }
}
</script>
