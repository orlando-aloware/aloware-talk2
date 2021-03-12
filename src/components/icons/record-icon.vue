<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <title>record</title>
    <defs>
      <rect id="path-1" x="0" y="0" width="24" height="24"></rect>
    </defs>
    <g id="record" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g>
        <mask id="mask-2" fill="white">
          <use xlink:href="#path-1"></use>
        </mask>
        <g id="basic-/-radio_filled-(Background/Mask)"></g>
        <path
          d="M12,15.4285714 C10.1064524,15.4285714 8.57142857,13.8935481 8.57142857,12 C8.57142857,10.1064524 10.1064524,8.57142857 12,8.57142857 C13.8935481,8.57142857 15.4285714,10.1064524 15.4285714,12 C15.4285714,13.8935481 13.8935481,15.4285714 12,15.4285714 Z M12,20 C16.4182783,20 20,16.4182783 20,12 C20,7.58172199 16.4182783,4 12,4 C7.58172199,4 4,7.58172199 4,12 C4,16.4182783 7.58172199,20 12,20 C14.9455189,20 14.9455189,20 12,20 Z M12,17.7142857 C15.1559132,17.7142857 17.7142857,15.1559132 17.7142857,12 C17.7142857,8.84408733 15.1559132,6.28571429 12,6.28571429 C8.84408733,6.28571429 6.28571429,8.84408733 6.28571429,12 C6.28571429,15.1559132 8.84408733,17.7142857 12,17.7142857 C14.1039421,17.7142857 14.1039421,17.7142857 12,17.7142857 Z"
          id="basic-/-radio_filled"
          :fill="iconColor"
          mask="url(#mask-2)"
        ></path>
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
      default: '#999999'
    }
  }
}
</script>
