<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M3 11.3326V10.6962C3 10.0361 3.28429 9.40805 3.78021 8.97248L3.97789 8.79886V5.91095C3.97789 3.88866 5.48432 2 7.99025 2C10.4962 2 12.008 3.88866 12.008 5.91095V8.79886L12.2075 8.97161C12.7108 9.40736 13 10.0403 13 10.706V11.3326H3Z" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9.5 12.5C9.5 13.3284 8.82843 14 8 14C7.17157 14 6.5 13.3284 6.5 12.5" :stroke="color" stroke-width="1.2"/>
  </svg>
</template>

<script>
export default {
  name: 'notification-o-icon',

  props: {
    width: {
      type: [Number, String],
      default: 16
    },
    height: {
      type: [Number, String],
      default: 16
    },
    color: {
      type: String,
      default: '#62666E'
    }
  }
}
</script>

<style scoped>

</style>
