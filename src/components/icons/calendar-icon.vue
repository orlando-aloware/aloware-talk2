<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M16 5.56006V13.0001C16 14.6569 14.6569 16.0001 13 16.0001H3C1.34315 16.0001 0 14.6569 0 13.0001L0 5.56006H16ZM13.5 6.06006H2.5C1.94772 6.06006 1.5 6.50777 1.5 7.06006V13.0001C1.5 13.8285 2.17157 14.5001 3 14.5001H13C13.8284 14.5001 14.5 13.8285 14.5 13.0001V7.06006C14.5 6.50777 14.0523 6.06006 13.5 6.06006Z" :fill="color"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.0357 0C11.4499 0 11.7857 0.335786 11.7857 0.75L11.785 1.56H13C14.6569 1.56 16 2.90315 16 4.56V6H0L0 4.56C0 2.90315 1.34315 1.56 3 1.56H4V0.75C4 0.335786 4.33579 0 4.75 0C5.16421 0 5.5 0.335786 5.5 0.75V1.56H10.285L10.2857 0.75C10.2857 0.335786 10.6215 0 11.0357 0Z" :fill="color"/>
  </svg>
</template>

<script>
export default {
  name: 'calendar-icon',
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
      default: '#62666E'
    }
  }
}
</script>

<style scoped>

</style>
