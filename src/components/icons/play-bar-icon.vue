<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
  >
    <polygon points="5,3 19,12 5,21" :fill="color" />
    <rect x="20" y="3" width="3" height="18" :fill="color" />
  </svg>
</template>

<script>
export default {
  name: 'PlayBarIcon',
  props: {
    width: {
      type: [Number, String],
      default: 15
    },
    height: {
      type: [Number, String],
      default: 15
    },
    color: {
      type: String,
      default: '#62666E'
    }
  }
}
</script>
