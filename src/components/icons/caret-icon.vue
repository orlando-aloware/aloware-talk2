<template>
  <svg class="svg" :width="width" :height="height" viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 1L4 4L1 1" stroke="#62666E" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'caret-icon',
  props: {
    width: {
      type: [Number, String],
      default: 8
    },
    height: {
      type: [Number, String],
      default: 8
    }
  }
}
</script>
