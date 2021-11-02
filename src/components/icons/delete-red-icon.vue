<template>
  <svg :width="width" :height="height" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.5L11.6314 10.504C11.5588 11.8825 10.3783 13 8.993 13H5.007C3.62242 13 2.44068 11.8729 2.36863 10.504L2 3.5H12Z" :fill="color"/>
    <path d="M1 3.18164H13" :stroke="color" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8.5 6.5V9.5" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5.5 6.5V9.5" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4.81836 3.18182V2.09091C4.81836 1.48842 5.30202 1 5.90823 1H8.09212C8.69404 1 9.182 1.48422 9.182 2.09091V3.18182" :stroke="color" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'delete-red-icon',
  props: {
    width: {
      type: [Number, String],
      default: 14
    },
    height: {
      type: [Number, String],
      default: 13
    },
    color: {
      type: String,
      default: '#FA003F'
    }
  }
}
</script>
