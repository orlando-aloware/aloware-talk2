<template>
  <svg :width="width" :height="height" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" data-testid="information-circle-icon-svg">
    <path d="M8.71875 2.25195C5.14652 2.25195 2.25 5.14848 2.25 8.7207C2.25 12.2929 5.14652 15.1895 8.71875 15.1895C12.291 15.1895 15.1875 12.2929 15.1875 8.7207C15.1875 5.14848 12.291 2.25195 8.71875 2.25195Z" :stroke="color" stroke-width="1.2" stroke-miterlimit="10"/>
    <path d="M7.73438 7.73535H8.85938V11.8135" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.3125 11.9531H10.4062" :stroke="color" stroke-width="1.2" stroke-miterlimit="10" stroke-linecap="round"/>
    <path d="M8.54427 5.22422C8.59591 5.18971 8.65663 5.17129 8.71875 5.17129C8.80204 5.17129 8.88193 5.20438 8.94083 5.26328C8.99972 5.32217 9.03281 5.40206 9.03281 5.48535C9.03281 5.54747 9.01439 5.60819 8.97988 5.65984C8.94537 5.71148 8.89632 5.75174 8.83894 5.77551C8.78155 5.79928 8.7184 5.8055 8.65748 5.79338C8.59656 5.78126 8.5406 5.75135 8.49667 5.70743C8.45275 5.66351 8.42284 5.60755 8.41072 5.54662C8.3986 5.4857 8.40482 5.42255 8.42859 5.36517C8.45236 5.30778 8.49262 5.25873 8.54427 5.22422Z" :fill="color" :stroke="color" stroke-width="1.2"/>
  </svg>
</template>

<script>
export default {
  name: 'information-circle-icon',
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

<style scoped>

</style>
