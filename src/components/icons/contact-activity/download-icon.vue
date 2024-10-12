<template>
  <svg class="svg" :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2V10.9524" stroke="#007bff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4.32666 7.14307L8.00013 10.9526L11.6736 7.14307" stroke="#007bff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2 10.1904V12.0952C2 13.1472 2.85339 14 3.90144 14H12.0986C13.1487 14 14 13.1545 14 12.0952V10.1904" stroke="#007bff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'download-icon',
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
