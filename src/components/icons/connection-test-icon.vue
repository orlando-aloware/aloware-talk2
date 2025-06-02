<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.75 3C10.1642 3 10.5 3.33579 10.5 3.75V13.2497C10.5 13.6639 10.1642 13.9997 9.75 13.9997C9.33579 13.9997 9 13.6639 9 13.2497V3.75C9 3.33579 9.33579 3 9.75 3Z" :fill="color"/>
    <path d="M5.75 6.25C6.16421 6.25 6.5 6.58579 6.5 7V13.2501C6.5 13.6643 6.16421 14.0001 5.75 14.0001C5.33579 14.0001 5 13.6643 5 13.2501V7C5 6.58579 5.33579 6.25 5.75 6.25Z" :fill="color"/>
    <path d="M1.75 9C2.16421 9 2.5 9.33579 2.5 9.75V13.2503C2.5 13.6645 2.16421 14.0003 1.75 14.0003C1.33579 14.0003 1 13.6645 1 13.2503V9.75C1 9.33579 1.33579 9 1.75 9Z" :fill="color"/>
    <path d="M13.75 0.75C14.1642 0.75 14.5 1.08579 14.5 1.5V13.2496C14.5 13.6638 14.1642 13.9996 13.75 13.9996C13.3358 13.9996 13 13.6638 13 13.2496V1.5C13 1.08579 13.3358 0.75 13.75 0.75Z" :fill="color"/>
  </svg>
</template>

<script>
export default {
  name: 'connection-test-icon',

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
