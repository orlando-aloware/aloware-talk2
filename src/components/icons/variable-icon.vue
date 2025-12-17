<template>
  <svg :width="width" :height="height" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg" data-testid="variable-icon-svg">
    <path d="M6.5 1L1.5 6L6.5 11" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13.5 1L18.5 6L13.5 11" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M6.5 4.5C7.19036 4.5 7.75 5.05964 7.75 5.75C7.75 6.44036 7.19036 7 6.5 7C5.80964 7 5.25 6.44036 5.25 5.75C5.25 5.05964 5.80964 4.5 6.5 4.5ZM10 4.5C10.6904 4.5 11.25 5.05964 11.25 5.75C11.25 6.44036 10.6904 7 10 7C9.30964 7 8.75 6.44036 8.75 5.75C8.75 5.05964 9.30964 4.5 10 4.5ZM13.5 4.5C14.1904 4.5 14.75 5.05964 14.75 5.75C14.75 6.44036 14.1904 7 13.5 7C12.8096 7 12.25 6.44036 12.25 5.75C12.25 5.05964 12.8096 4.5 13.5 4.5Z" fill="#95989E"/>
  </svg>

</template>

<script>
export default {
  name: 'variable-icon',

  props: {
    width: {
      type: [Number, String],
      default: 16
    },
    height: {
      type: [Number, String],
      default: 18
    },
    color: {
      type: String,
      default: '#95989E'
    }
  }
}
</script>

<style scoped>

</style>
