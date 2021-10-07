<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 6 5"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path d="M3 5L0.401924 0.5L5.59808 0.5L3 5Z" :fill="color" />
  </svg>
</template>

<script>
export default {
  name: 'folder-arrow-open-icon',
  props: {
    width: {
      type: [Number, String],
      default: 6
    },
    height: {
      type: [Number, String],
      default: 5
    },
    color: {
      type: String,
      default: '#BDBDBD'
    }
  }
}
</script>
