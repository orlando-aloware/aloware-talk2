<template>
  <svg :width="width" :height="width" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.5005 12C10.5005 12.8284 11.1721 13.5 12.0005 13.5C12.8289 13.5 13.5005 12.8284 13.5005 12C13.5005 11.1716 12.8289 10.5 12.0005 10.5C11.1721 10.5 10.5005 11.1716 10.5005 12Z" :fill="color" :stroke="color" stroke-width="1.5" stroke-miterlimit="10"/>
    <path d="M2.99951 12C2.99951 12.8284 3.67108 13.5 4.49951 13.5C5.32794 13.5 5.99951 12.8284 5.99951 12C5.99951 11.1716 5.32794 10.5 4.49951 10.5C3.67109 10.5 2.99951 11.1716 2.99951 12Z" :fill="color" :stroke="color" stroke-width="1.5" stroke-miterlimit="10"/>
    <path d="M18 12C18 12.8284 18.6716 13.5 19.5 13.5C20.3284 13.5 21 12.8284 21 12C21 11.1716 20.3284 10.5 19.5 10.5C18.6716 10.5 18 11.1716 18 12Z" :fill="color" :stroke="color" stroke-width="1.5" stroke-miterlimit="10"/>
  </svg>
</template>

<script>
export default {
  name: 'more-mobile-icon',
  props: {
    width: {
      type: [Number, String],
      default: 24
    },
    height: {
      type: [Number, String],
      default: 24
    },
    color: {
      type: String,
      default: '#A3A3A3'
    }
  }
}
</script>

<style scoped>

</style>
