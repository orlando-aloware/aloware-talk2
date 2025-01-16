<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 13.5H3C2.86739 13.5 2.74021 13.4473 2.64645 13.3536C2.55268 13.2598 2.5 13.1326 2.5 13V4.5L3.5 2.5H12.5L13.5 4.5V13C13.5 13.1326 13.4473 13.2598 13.3536 13.3536C13.2598 13.4473 13.1326 13.5 13 13.5Z" :stroke="color" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5.88135 9.38086L8.0001 11.4996L10.1188 9.38086" :stroke="color" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8 6.5V11.5" :stroke="color" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M2.5 4.5H13.5" :stroke="color" stroke-linecap="round" stroke-linejoin="round"/>
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

    color: {
      type: String,
      default: '#62666E'
    }
  }
}
</script>
