<template>
  <svg class="svg" :width="width" :height="height" viewBox="0 0 25 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.29129 4.13034C5.54344 3.759 5.59306 3.49167 5.35057 2.97206C4.99065 2.20017 3.72543 0.350885 2.91151 0.06154C2.53565 -0.0721247 2.15956 0.0170599 1.71432 0.279447C0.403075 1.05178 -0.0675371 2.21433 0.00768004 3.69969C0.261847 8.73065 5.27512 13.7382 10.3023 13.9923C11.7869 14.0676 12.9486 13.5967 13.7208 12.2848C13.983 11.8393 14.0722 11.463 13.9383 11.087C13.6494 10.2726 11.8011 9.00674 11.0296 8.64663C10.51 8.40401 10.243 8.45366 9.8719 8.70594C8.61926 9.55869 8.63452 10.6606 7.10638 9.67124C5.96039 8.92923 5.06788 8.04368 4.32649 6.89731C3.33767 5.36836 4.4392 5.38364 5.29129 4.13034Z" fill="#00BF4A"/>
    <path d="M18.5 13.0028V10.489C18.5 7.56485 19.6643 4.76107 21.7356 2.69707L22.4846 1.95068" stroke="#00BF4A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M18.834 1H23.5V5.6" stroke="#00BF4A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'outbound-call-answered-icon',
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
