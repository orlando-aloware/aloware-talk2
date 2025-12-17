<template>
  <svg :width="width" :height="height" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 13.0004C1 10.6232 2.92711 8.69604 5.30431 8.69604H7.39004C9.76725 8.69604 11.6944 10.6232 11.6944 13.0004" :stroke="color" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M13 4.49927V8.4993" :stroke="color" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M11 6.50049H15" :stroke="color" stroke-width="1.2" stroke-linecap="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M6.34973 6.80005C7.97152 6.80005 8.94971 5.50166 8.94971 3.90002C8.94971 2.29838 7.94375 1 6.34973 1C4.75572 1 3.74976 2.29838 3.74976 3.90002C3.74976 5.50166 4.72795 6.80005 6.34973 6.80005Z" :stroke="color" stroke-width="1.2"/>
  </svg>
</template>

<script>
export default {
  name: 'pencil-o-icon',
  props: {
    color: {
      type: String,
      default: '#256EFF',
      required: false
    },
    height: {
      type: String,
      default: '14',
      required: false
    },
    width: {
      type: String,
      default: '14',
      required: false
    }
  }
}
</script>

<style scoped>

</style>
