<template>
  <svg class="svg" :width="width" :height="height" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 26C20.1797 26 26 20.1797 26 13C26 5.8203 20.1797 0 13 0C5.8203 0 0 5.8203 0 13C0 20.1797 5.8203 26 13 26Z" fill="#256EFF"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.75 8.66689V17.3336C9.75 17.9319 10.235 18.4169 10.8333 18.4169C11.0677 18.4169 11.2958 18.3409 11.4833 18.2002L17.2611 13.8669C17.7398 13.5079 17.8368 12.8289 17.4778 12.3502C17.4162 12.2681 17.3432 12.1952 17.2611 12.1336L11.4833 7.80023C11.0047 7.44124 10.3257 7.53825 9.96667 8.01689C9.82603 8.20441 9.75 8.43249 9.75 8.66689Z" fill="white"/>
  </svg>
</template>

<script>
export default {
  name: 'play-bar-icon',
  props: {
    width: {
      type: [Number, String],
      default: 24
    },
    height: {
      type: [Number, String],
      default: 24
    }
  }
}
</script>
