<template>
  <svg class="svg" :width="width" :height="height" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.0082 15.1471C11.0865 15.5565 11.2294 15.7646 11.7298 15.9465C12.473 16.217 14.5179 16.6005 15.2423 16.2561C15.5769 16.0971 15.7653 15.7916 15.8853 15.3269C16.2392 13.9589 15.7849 12.8865 14.7602 11.9606C11.29 8.82419 4.71029 8.82792 1.24261 11.962C0.21842 12.8873 -0.235194 13.9593 0.119226 15.3277C0.239531 15.7924 0.42807 16.098 0.762855 16.257C1.48729 16.602 3.53207 16.2195 4.27507 15.9494C4.77552 15.7676 4.91821 15.5597 4.99626 15.1504C5.25882 13.768 4.5253 13.0545 6.17828 12.7007C7.41794 12.4355 8.58541 12.4309 9.82491 12.6968C11.4781 13.0514 10.7448 13.7647 11.0082 15.1471Z" fill="#9C27BB"/>
    <path d="M25 7.00013V9.51396C25 12.4381 23.8357 15.2419 21.7644 17.3059L21.0154 18.0522" stroke="#9C27BB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M24.666 19.0029H20V14.4029" stroke="#9C27BB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'inbound-call-abandoned-icon',
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
