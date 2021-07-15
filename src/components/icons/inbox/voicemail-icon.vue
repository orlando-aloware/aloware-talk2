<template>
  <svg class="svg" :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.84099 6.40901C6.71967 7.28769 6.71967 8.71231 5.84099 9.59099C4.96231 10.4697 3.53769 10.4697 2.65901 9.59099C1.78033 8.71231 1.78033 7.28769 2.65901 6.40901C3.53769 5.53033 4.96231 5.53033 5.84099 6.40901Z" stroke="#4F4F4F" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13.341 6.40901C14.2197 7.28769 14.2197 8.71231 13.341 9.59099C12.4623 10.4697 11.0377 10.4697 10.159 9.59099C9.28033 8.71231 9.28033 7.28769 10.159 6.40901C11.0377 5.53033 12.4623 5.53033 13.341 6.40901Z" stroke="#4F4F4F" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4.25 10.25H11.75" stroke="#4F4F4F" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'voicemail-icon',
  props: {
    width: {
      type: [Number, String],
      default: 16
    },
    height: {
      type: [Number, String],
      default: 16
    }
  }
}
</script>
