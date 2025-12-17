<template>
  <svg :width="width" :height="height" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.12305 2.68408L11.3125 5.8745" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M1 13L1.31459 10.0361C1.35008 9.7017 1.57079 9.23861 1.80975 8.99957L9.27112 1.53585C9.9875 0.81924 11.1532 0.823487 11.8655 1.53598L12.4604 2.13107C13.1769 2.84775 13.1828 4.00375 12.4605 4.72627L4.99917 12.19C4.76119 12.428 4.28827 12.6508 3.96296 12.6853L1 13Z"
      :stroke="color"
      stroke-width="1.2"
      stroke-linecap="round"
      stroke-linejoin="round"/>
  </svg>

</template>

<script>
export default {
  name: 'pencil-o-icon',
  props: {
    color: {
      type: String,
      default: '#256EFF',
      required: false
    },
    height: {
      type: String,
      default: '14',
      required: false
    },
    width: {
      type: String,
      default: '14',
      required: false
    }
  }
}
</script>
