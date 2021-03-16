<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <title>task</title>
    <defs>
      <rect id="path-1" x="0" y="0" width="24" height="24"></rect>
      <rect id="path-3" x="0" y="0" width="24" height="24"></rect>
    </defs>
    <g id="task" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="chat">
        <mask id="mask-2" fill="white">
          <use xlink:href="#path-1"></use>
        </mask>
        <g id="edit-/-comment-(Background/Mask)"></g>
        <g id="file-/-folder" mask="url(#mask-2)">
          <mask id="mask-4" fill="white">
            <use xlink:href="#path-3"></use>
          </mask>
          <g id="file-/-folder-(Background/Mask)"></g>
          <path
            d="M12.3725996,5.8 L10.8362998,4.26369998 C10.6679998,4.09449999 10.4385,4 10.2,4 L4.8,4 C3.80729996,4 3,4.80729996 3,5.8 L3,18.4 C3,19.3927 3.80729996,20.2 4.8,20.2 L19.2,20.2 C20.1927,20.2 21,19.3927 21,18.4 L21,7.6 C21,6.60729996 20.1927,5.8 19.2,5.8 L12.3725996,5.8 Z M4.8,7.6 L19.2,7.6 L19.2018007,18.4 L4.8,18.4 L4.8,7.6 Z"
            :class="`svg-fill-${iconColor}`"
            mask="url(#mask-4)"
          ></path>
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
      default: 'grey-mid'
    }
  }
}
</script>
