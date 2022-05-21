<template>
  <svg :width="width" :height="height" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>chevron-left</title>
    <defs>
      <rect id="path-1" x="0" y="0" width="24" height="24"></rect>
    </defs>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" :opacity="[ disabled ? '0.600000024' : 1 ]">
      <g transform="translate(-365.000000, -23.000000)">
        <g transform="translate(90.000000, 20.000000)">
          <g transform="translate(275.000000, 3.000000)">
            <mask id="mask-3" fill="white">
              <use xlink:href="#path-1"></use>
            </mask>
            <path d="M15.5355749,3.51470947 L7.05029297,11.9999914 L15.535574,20.4852734 L16.9497881,19.0710583 L9.878721,11.9999924 L16.9497881,4.92892289 L15.5355749,3.51470947 Z" :class="`svg-fill-${iconColor}`" fill-rule="nonzero" mask="url(#mask-3)"></path>
          </g>
        </g>
      </g>
    </g>
  </svg>
</template>

<script>
export default {
  props: {
    width: {
      type: [Number, String],
      default: 24
    },
    height: {
      type: [Number, String],
      default: 24
    },
    iconColor: {
      type: String,
      default: 'dark'
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  }
}
</script>
