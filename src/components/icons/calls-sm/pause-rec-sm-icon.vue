<template>
  <svg :width="width" :height="height" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg"
       xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>call icon / pause rec</title>
    <defs>
      <rect id="path-1" x="0" y="0" width="20" height="20"></rect>
    </defs>
    <g id="call-icon-/-pause-rec" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="-pause_circle_outline" transform="translate(2.000000, 2.000000)">
        <mask id="mask-2" fill="white">
          <use xlink:href="#path-1"></use>
        </mask>
        <g id="media-/-pause_circle_outline-(Background/Mask)"></g>
        <path
          d="M10,1.66666667 C14.6000004,1.66666667 18.3333333,5.40000002 18.3333333,10 C18.3333333,14.6000004 14.6000004,18.3333333 10,18.3333333 C5.40000002,18.3333333 1.66666667,14.6000004 1.66666667,10 C1.66666667,5.40000002 5.40000002,1.66666667 10,1.66666667 Z M3.33333333,10 C3.33333333,6.32500013 6.32500013,3.33333333 10,3.33333333 C13.6749999,3.33333333 16.6666667,6.32500013 16.6666667,10 C16.6666667,13.6749999 13.6749999,16.6666667 10,16.6666667 C6.32500013,16.6666667 3.33333333,13.6749999 3.33333333,10 Z"
          id="media-/-pause_circle_outline" fill="#15163F" mask="url(#mask-2)"></path>
        <path d="M7.5,13.3333333 L7.5,6.66666667 L9.16666667,6.66666667 L9.16666667,13.3333333 L7.5,13.3333333 Z"
              id="media-/-pause_circle_outline" fill="#15163F" mask="url(#mask-2)"></path>
        <path
          d="M10.8333333,13.3333333 L10.8333333,6.66666667 L12.5,6.66666667 L12.5,13.3333333 L10.8333333,13.3333333 Z"
          id="media-/-pause_circle_outline" fill="#15163F" mask="url(#mask-2)"></path>
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
