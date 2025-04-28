<template>
  <svg class="svg" :width="width" :height="height" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 8H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M6 12H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M6 16H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
</template>

<script>
export default {
  name: 'sort-up-icon',
  props: {
    width: {
      type: [Number, String],
      default: 16
    },
    height: {
      type: [Number, String],
      default: 16
    }
  }
}
</script>
