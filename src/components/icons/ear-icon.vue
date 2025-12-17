<template>
  <svg :width="width" :height="height" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" data-testid="ear-icon-svg">
    <g clip-path="url(#clip0_2_2966)">
      <path d="M15.7369 15.5034C17.8936 14.0381 19.5 11.7806 19.5 8.99902C19.5 7.0099 18.7098 5.10224 17.3033 3.69572C15.8968 2.2892 13.9891 1.49902 12 1.49902C10.0109 1.49902 8.10322 2.2892 6.6967 3.69572C5.29018 5.10224 4.5 7.0099 4.5 8.99902V18.682C4.5 20.7567 6.17531 22.499 8.25 22.499C10.3247 22.499 11.3827 21.2831 11.873 20.624C12.5653 19.6954 13.8281 16.8009 15.7369 15.5034Z" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7.49988 14.2488V8.62378C7.49988 6.35503 9.52488 4.49878 11.9999 4.49878C14.4749 4.49878 16.4999 6.35503 16.4999 8.62378" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7.49988 11.2024C8.67175 10.3586 11.2414 10.4993 11.2414 10.4993C12.4602 10.4993 13.1713 11.8783 12.4602 12.8711C12.4602 12.8711 10.7324 14.8586 10.498 15.7493" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_2_2966">
        <rect width="24" height="24" fill="white" transform="translate(0 -0.000488281)"/>
      </clipPath>
    </defs>
  </svg>
</template>

<script>
export default {
  name: 'ear-icon',

  props: {
    width: {
      type: [Number, String],
      default: 18
    },

    height: {
      type: [Number, String],
      default: 18
    },

    color: {
      type: String,
      default: '#62666E'
    }
  }
}
</script>
