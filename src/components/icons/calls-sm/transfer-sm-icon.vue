<template>
  <svg :width="width" :height="height" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg"
       xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>call icon / transfer</title>
    <defs>
      <rect id="path-1" x="0" y="0" width="20" height="20"></rect>
    </defs>
    <g id="call-icon-/-transfer" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="transfer" transform="translate(2.000000, 2.000000)">
        <mask id="mask-2" fill="white">
          <use xlink:href="#path-1"></use>
        </mask>
        <g id="system-/-transfer-(Background/Mask)"></g>
        <path
          d="M16.6666667,6.66666667 L12.5,3.33333333 L12.5,5.83250006 L1.66666667,5.83250006 L1.66666667,7.49916633 L12.5,7.49916633 L12.5,10 L16.6666667,6.66666667 Z M7.5,12.5 L7.5,10 L3.33333333,13.3333333 L7.5,16.6666667 L7.5,14.1666667 L18.3333333,14.1666667 L18.3333333,12.5 L7.5,12.5 Z"
          id="system-/-transfer" fill="#15163F" mask="url(#mask-2)"></path>
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
    }
  }
}
</script>
