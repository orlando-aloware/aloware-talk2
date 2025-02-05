<template>
  <svg :width="width" :height="height" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 17H4M4 17L8 13M4 17L8 21M4 7H20M20 7L16 3M20 7L16 11" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

</template>

<script>
export default {
  name: 'switch-icon',
  props: {
    width: {
      type: [Number, String],
      default: 15
    },
    height: {
      type: [Number, String],
      default: 16
    },
    color: {
      type: String,
      default: '#62666E'
    }
  }
}
</script>
