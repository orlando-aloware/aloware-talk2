<template>
  <svg :width="width" :height="height" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1H10" :stroke="color" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round"/>
    <path d="M1 5H10" :stroke="color" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round"/>
    <path d="M1 9H10" :stroke="color" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round"/>
  </svg>
</template>

<script>
export default {
  name: 'edit-hamburger-icon',
  props: {
    width: {
      type: [Number, String],
      default: 11
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
