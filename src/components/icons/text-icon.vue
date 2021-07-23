<template>
  <svg :width="width" :height="height" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.5 0H2.5C1.11929 0 0 1.11929 0 2.5V9.5C0 10.8807 1.11929 12 2.5 12H8.5C9.88071 12 11 10.8807 11 9.5V2.5C11 1.11929 9.88071 0 8.5 0Z" :fill="color"/>
    <path d="M3 3.5H5" stroke="white" stroke-linecap="round"/>
    <path d="M3 6H8" stroke="white" stroke-linecap="round"/>
    <path d="M3 8.5H8" stroke="white" stroke-linecap="round"/>
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
      default: 'grey-mid'
    }
  }
}
</script>
