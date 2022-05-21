<template>
  <svg :width="width" :height="height" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg"
       xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>more options</title>
    <defs>
      <rect id="path-1" x="0" y="0" width="24" height="24"></rect>
    </defs>
    <g id="more-options" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="menu-/-more_horizontal">
        <mask id="mask-2" fill="white">
          <use xlink:href="#path-1"></use>
        </mask>
        <g id="menu-/-more_horizontal-(Background/Mask)"></g>
        <path
          d="M4,12 C4,13.0999999 4.89999998,14 6,14 C7.0999999,14 8,13.0999999 8,12 C8,10.9 7.0999999,10 6,10 C4.89999998,10 4,10.9 4,12 Z M16,12 C16,13.0999999 16.8999996,14 18,14 C19.1000004,14 20,13.0999999 20,12 C20,10.9 19.1000004,10 18,10 C16.8999996,10 16,10.9 16,12 Z M12,10 C13.1000004,10 14,10.9 14,12 C14,13.0999999 13.1000004,14 12,14 C10.9000001,14 10,13.0999999 10,12 C10,10.9 10.9000001,10 12,10 Z"
          :class="`svg-fill-${iconColor}`" mask="url(#mask-2)"
          transform="translate(12.000000, 12.000000) rotate(-90.000000) translate(-12.000000, -12.000000) "></path>
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
    }
  }
}
</script>
