<template>
  <svg :width="width" :height="height" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg"
       xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>call icon / plus</title>
    <defs>
      <rect id="path-1" x="0" y="0" width="20" height="20"></rect>
    </defs>
    <g id="call-icon-/-plus" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="add" transform="translate(2.000000, 2.000000)">
        <mask id="mask-2" fill="white">
          <use xlink:href="#path-1"></use>
        </mask>
        <g id="edit-/-plus_circle_outline-(Background/Mask)"></g>
        <path
          d="M10,1.66666667 C5.40000002,1.66666667 1.66666667,5.40000002 1.66666667,10 C1.66666667,14.6000004 5.40000002,18.3333333 10,18.3333333 C14.6000004,18.3333333 18.3333333,14.6000004 18.3333333,10 C18.3333333,5.40000002 14.6000004,1.66666667 10,1.66666667 C6.93333334,1.66666667 6.93333334,1.66666667 10,1.66666667 Z M9.16666667,5.83333333 L9.16666667,9.16666667 L5.83333333,9.16666667 L5.83333333,10.8333333 L9.16666667,10.8333333 L9.16666667,14.1666667 L10.8333333,14.1666667 L10.8333333,10.8333333 L14.1666667,10.8333333 L14.1666667,9.16666667 L10.8333333,9.16666667 L10.8333333,5.83333333 L9.16666667,5.83333333 L9.16666667,5.83333333 Z M3.33333333,10 C3.33333333,13.6749999 6.32500013,16.6666667 10,16.6666667 C13.6749999,16.6666667 16.6666667,13.6749999 16.6666667,10 C16.6666667,6.32500013 13.6749999,3.33333333 10,3.33333333 C6.32500013,3.33333333 3.33333333,6.32500013 3.33333333,10 C3.33333333,12.4499999 3.33333333,12.4499999 3.33333333,10 Z"
          id="edit-/-plus_circle_outline" fill="#15163F" mask="url(#mask-2)"></path>
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
