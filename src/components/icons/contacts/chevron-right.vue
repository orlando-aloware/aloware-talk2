<template>
  <svg :width="width" :height="height" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>chevron-right</title>
    <defs>
      <rect id="path-1" x="0" y="0" width="24" height="24"></rect>
    </defs>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" :opacity="[ disabled ? '0.600000024' : 1 ]">
      <g transform="translate(-409.000000, -23.000000)">
        <g transform="translate(90.000000, 20.000000)">
          <g transform="translate(319.000000, 3.000000)">
            <mask id="mask-3" fill="white">
              <use xlink:href="#path-1"></use>
            </mask>
            <path d="M15.5354946,3.51466517 L7.05021265,11.9999471 L15.5354936,20.4852291 L16.9497078,19.071014 L9.87864068,11.9999481 L16.9497078,4.92887859 L15.5354946,3.51466517 Z" :class="`svg-fill-${iconColor}`" fill-rule="nonzero" mask="url(#mask-3)" transform="translate(11.999960, 11.999947) rotate(-179.999995) translate(-11.999960, -11.999947) "></path>
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
