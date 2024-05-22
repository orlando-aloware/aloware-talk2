<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    data-testid="close-icon-svg"
  >
    <defs>
      <rect id="path-1" x="0" y="0" width="24" height="24"></rect>
    </defs>
    <g id="close" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="close_big">
        <mask id="mask-2" fill="white">
          <use xlink:href="#path-1"></use>
        </mask>
        <g id="menu-/-close_big-(Background/Mask)"></g>
        <path
          d="M17.5900002,5 L12,10.5900002 L6.40999997,5 L5,6.40999997 L10.5900002,12 L5,17.5900002 L6.40999997,19 L12,13.4099998 L17.5900002,19 L19,17.5900002 L13.4099998,12 L19,6.40999997 L17.5900002,5 Z"
          id="menu-/-close_big"
          :fill="iconColor"
          fill-rule="nonzero"
          mask="url(#mask-2)"
        ></path>
      </g>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'close-icon',
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
      default: '#15163F'
    }
  }
}
</script>
