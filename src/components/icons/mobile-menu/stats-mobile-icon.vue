<template>
  <svg :width="width" :height="height" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.6001 21.5H22.6001" stroke="#A3A3A3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.9001 11.5H6.3001C7.29421 11.5 8.1001 12.3059 8.1001 13.3V17.2C8.1001 18.1941 7.29421 19 6.3001 19H4.9001C3.90599 19 3.1001 18.1941 3.1001 17.2V13.3C3.1001 12.3059 3.90599 11.5 4.9001 11.5Z" :fill="color"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.9001 1.5H13.3001C14.2942 1.5 15.1001 2.30589 15.1001 3.3V17.2C15.1001 18.1941 14.2942 19 13.3001 19H11.9001C10.906 19 10.1001 18.1941 10.1001 17.2V3.3C10.1001 2.30589 10.906 1.5 11.9001 1.5Z" :fill="color"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M18.9001 6.5H20.3001C21.2942 6.5 22.1001 7.30589 22.1001 8.3V17.2C22.1001 18.1941 21.2942 19 20.3001 19H18.9001C17.906 19 17.1001 18.1941 17.1001 17.2V8.3C17.1001 7.30589 17.906 6.5 18.9001 6.5Z" :fill="color"/>
  </svg>
</template>

<script>
export default {
  name: 'stats-mobile-icon',
  props: {
    width: {
      type: [Number, String],
      default: 25
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
