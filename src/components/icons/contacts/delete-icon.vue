<template>
  <svg :width="width" :height="height" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>delete</title>
    <defs>
      <rect id="path-1" x="0" y="0" width="24" height="24"></rect>
    </defs>
    <g id="delete" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g id="trash">
        <mask id="mask-2" fill="white">
          <use xlink:href="#path-1"></use>
        </mask>
        <g id="basic-/-trash_full-(Background/Mask)"></g>
        <path d="M9.4,3 C8.40729996,3 7.6,3.80729996 7.6,4.8 L7.6,5.7 L4,5.7 L4,7.5 L5.8,7.5 L5.8,19.2 C5.8,20.1927 6.60729996,21 7.6,21 L16.6,21 C17.5927,21 18.4,20.1927 18.4,19.2 L18.4,7.5 L20.2,7.5 L20.2,5.7 L16.6,5.7 L16.6,4.8 C16.6,3.80729996 15.7927,3 14.8,3 L9.4,3 Z M14.8,4.8 L14.8,5.7 L9.4,5.7 L9.4,4.8 L14.8,4.8 Z M7.6,19.2 L7.6,7.5 L16.6,7.5 L16.6,19.2 L7.6,19.2 Z M11.2,9.3 L11.2,17.4 L9.4,17.4 L9.4,9.3 L11.2,9.3 Z M14.8,9.3 L14.8,17.4 L13,17.4 L13,9.3 L14.8,9.3 Z" id="basic-/-trash_full" :class="`svg-fill-${iconColor}`" mask="url(#mask-2)"></path>
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
