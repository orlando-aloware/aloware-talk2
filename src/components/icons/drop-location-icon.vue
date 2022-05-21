<template>
  <svg :width="width" :height="height" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 1C2.51429 1 0.5 3.00165 0.5 5.47177C0.5 6.4371 0.814286 7.5444 1.34286 8.2826L4.18414 12.5509C4.50349 13.0306 5.12765 13.1439 5.57824 12.8039C5.67029 12.7344 5.75063 12.6489 5.81586 12.5509L8.65714 8.2826C9.18571 7.5444 9.5 6.4513 9.5 5.47177C9.5 3.00165 7.48571 1 5 1Z" :stroke="color" stroke-linejoin="round"/>
    <path d="M4.97998 6.6001C4.15498 6.6001 3.47998 5.9251 3.47998 5.1001C3.47998 4.2751 4.15498 3.6001 4.97998 3.6001C5.80498 3.6001 6.47998 4.2751 6.47998 5.1001C6.47998 5.9251 5.80498 6.6001 4.97998 6.6001Z" :stroke="color"/>
  </svg>
</template>

<script>

export default {
  name: 'more-icon',
  props: {
    width: {
      type: [Number, String],
      default: 20
    },
    height: {
      type: [Number, String],
      default: 20
    },
    color: {
      type: String,
      default: '#62666E'
    }
  }
}
</script>
