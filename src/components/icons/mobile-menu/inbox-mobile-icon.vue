<template>
  <svg :width="width" :height="height" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.4 5H8.6C6.61177 5 5 6.61177 5 8.6V19.4C5 21.3882 6.61177 23 8.6 23H19.4C21.3882 23 23 21.3882 23 19.4V8.6C23 6.61177 21.3882 5 19.4 5Z" :stroke="color" stroke-width="1.5"/>
    <path d="M5.5 19.1083V16.2903C5.78897 16.6639 6.24167 16.9045 6.75055 16.9045H9.44402C10.0894 16.9045 10.637 17.3779 10.7303 18.0164L10.7802 18.3572C10.9453 19.4869 11.9142 20.3245 13.056 20.3245H14.944C16.0858 20.3245 17.0547 19.4869 17.2198 18.3572L17.2697 18.0164C17.363 17.3779 17.9106 16.9045 18.556 16.9045H21.2487C21.758 16.9045 22.2111 16.6635 22.5 16.2894V19.1083C22.5 20.9816 20.9814 22.5002 19.1081 22.5002H8.89189C7.0186 22.5002 5.5 20.9816 5.5 19.1083Z" :fill="color" :stroke="color"/>
  </svg>
</template>

<script>
export default {
  name: 'inbox-mobile-icon',
  props: {
    width: {
      type: [Number, String],
      default: 28
    },
    height: {
      type: [Number, String],
      default: 28
    },
    color: {
      type: String,
      default: '#A3A3A3'
    }
  }
}
</script>
