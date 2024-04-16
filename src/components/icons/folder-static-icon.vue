<template>
  <svg :width="width" :height="height" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg" data-testid="static-icon-svg">
    <path d="M4.5 1H13" :stroke="color" stroke-width="1.2" stroke-miterlimit="10" stroke-linecap="round"/>
    <circle cx="1.5" cy="5" r="1" :fill="color"/>
    <circle cx="1.5" cy="9" r="1" :fill="color"/>
    <circle cx="1.5" cy="1" r="1" :fill="color"/>
    <path d="M4.5 5.00085H13" :stroke="color" stroke-width="1.2" stroke-miterlimit="10" stroke-linecap="round"/>
    <path d="M4.5 8.99939H13" :stroke="color" stroke-width="1.2" stroke-miterlimit="10" stroke-linecap="round"/>
  </svg>
</template>

<script>
export default {
  props: {
    width: {
      type: [Number, String],
      default: 14
    },
    height: {
      type: [Number, String],
      default: 10
    },
    color: {
      type: String,
      default: '#62666E'
    }
  }
}
</script>
