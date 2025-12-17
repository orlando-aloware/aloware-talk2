<template>
  <svg
    data-testid="folder-arrow-close-icon-svg"
    width="5"
    height="6"
    viewBox="0 0 5 6"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path d="M5 3L0.5 5.59808L0.5 0.401924L5 3Z" :fill="color" />
  </svg>
</template>

<script>
export default {
  name: 'folder-arrow-open-icon',
  props: {
    width: {
      type: [Number, String],
      default: 5
    },
    height: {
      type: [Number, String],
      default: 6
    },
    color: {
      type: String,
      default: '#BDBDBD'
    }
  }
}
</script>
