<template>
  <svg class="svg" :width="width" :height="height" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M6.29129 10.1303C6.54344 9.759 6.59306 9.49167 6.35057 8.97206C5.99065 8.20017 4.72543 6.35088 3.91151 6.06154C3.53565 5.92788 3.15956 6.01706 2.71432 6.27945C1.40308 7.05178 0.932463 8.21433 1.00768 9.69969C1.26185 14.7306 6.27512 19.7382 11.3023 19.9923C12.7869 20.0676 13.9486 19.5967 14.7208 18.2848C14.983 17.8393 15.0722 17.463 14.9383 17.087C14.6494 16.2726 12.8011 15.0067 12.0296 14.6466C11.51 14.404 11.243 14.4537 10.8719 14.7059C9.61926 15.5587 9.63452 16.6606 8.10638 15.6712C6.96039 14.9292 6.06788 14.0437 5.32649 12.8973C4.33767 11.3684 5.4392 11.3836 6.29129 10.1303Z" fill="#00BF4A"/>
    <path d="M24.5 7.00013V9.51396C24.5 12.4381 23.3357 15.2419 21.2644 17.3059L20.5154 18.0522" stroke="#00BF4A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M24.166 19.0029H19.5V14.4029" stroke="#00BF4A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'inbound-call-answered-icon',
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

<style scoped>

</style>
