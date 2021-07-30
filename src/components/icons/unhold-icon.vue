<template>
  <svg :width="width" :height="height" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M10.3578 6H11.0716C11.4662 6 11.7861 6.307 11.7861 6.68571V11.3143C11.7861 11.693 11.4662 12 11.0716 12H10.3578C9.96317 12 9.64327 11.693 9.64327 11.3143V6.68571C9.64327 6.307 9.96317 6 10.3578 6ZM7.64331 6.00034H6.92948C6.53486 6.00034 6.21497 6.30734 6.21497 6.68605V11.3146C6.21497 11.6933 6.53486 12.0003 6.92948 12.0003H7.64331C8.03793 12.0003 8.35782 11.6933 8.35782 11.3146V6.68605C8.35782 6.30734 8.03793 6.00034 7.64331 6.00034Z" :fill="color"/>
    <circle cx="9" cy="9" r="8.5" :stroke="color"/>
  </svg>
</template>

<script>
export default {
  name: 'unhold-icon',
  props: {
    width: {
      type: [Number, String],
      default: 16
    },
    height: {
      type: [Number, String],
      default: 16
    },
    color: {
      type: String,
      default: '#F2994A'
    }
  }
}
</script>
