<template>
    <svg :width="width" :height="height" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L4.09347 12.6879C3.74466 13.1064 3.57026 13.3157 3.56759 13.4925C3.56526 13.6461 3.63374 13.7923 3.75326 13.8889C3.89075 14 4.16318 14 4.70803 14H12L11 22L19.9065 11.3121C20.2553 10.8936 20.4297 10.6843 20.4324 10.5075C20.4347 10.3539 20.3663 10.2077 20.2467 10.1111C20.1093 10 19.8368 10 19.292 10H12L13 2Z" :fill="color" stroke="none"/>
    </svg>
</template>

<script>
export default {
  name: 'zap-bold-icon',
  props: {
    color: {
      type: String,
      default: '#007bff',
      required: false
    },
    width: {
      type: [Number, String],
      default: 24,
      required: false
    },
    height: {
      type: [Number, String],
      default: 24,
      required: false
    }
  }
}
</script>
