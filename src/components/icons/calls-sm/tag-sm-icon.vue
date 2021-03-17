<template>
  <svg :width="width" :height="height" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg"
       xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>call icon / tag</title>
    <defs>
      <rect id="path-1" x="0" y="0" width="20" height="20"></rect>
    </defs>
    <g id="call-icon-/-tag" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="label" transform="translate(2.000000, 2.000000)">
        <mask id="mask-2" fill="white">
          <use xlink:href="#path-1"></use>
        </mask>
        <g id="basic-/-label-(Background/Mask)"></g>
        <path
          d="M12.9166667,4.16666667 C13.4750001,4.16666667 13.9750004,4.44166665 14.2750001,4.86666664 L17.9166667,10 L14.2750001,15.1333332 C13.9750004,15.5583334 13.4750001,15.8333333 12.9166667,15.8333333 L3.75,15.8249998 C2.83333331,15.8249998 2.08333333,15.0833337 2.08333333,14.1666667 L2.08333333,5.83333333 C2.08333333,4.91666665 2.83333331,4.175 3.75,4.175 L12.9166667,4.16666667 C13.2888889,4.16666667 13.2888889,4.16666667 12.9166667,4.16666667 Z M3.75,14.1666667 L12.9166667,14.1666667 L15.8749994,10 L12.9166667,5.83333333 L3.75,5.83333333 L3.75,14.1666667 L3.75,14.1666667 Z"
          id="basic-/-label" fill="#15163F" mask="url(#mask-2)"></path>
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
