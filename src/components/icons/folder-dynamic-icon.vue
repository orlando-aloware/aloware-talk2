<template>
  <svg :width="width" :height="height" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg" data-testid="dynamic-icon-svg">
    <path d="M9 1L10.5 2.41176L9 3.82353" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10 2.40967H3.5C2.83757 2.41153 2.20283 2.66003 1.73442 3.10089C1.26601 3.54174 1.00198 4.13914 1 4.76261V5.2332" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5 10.0003L3.5 8.58852L5 7.17676" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4 8.58818H10.5C11.1624 8.58632 11.7972 8.33782 12.2656 7.89696C12.734 7.4561 12.998 6.8587 13 6.23524V5.76465" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  props: {
    width: {
      type: [Number, String],
      default: 14
    },
    height: {
      type: [Number, String],
      default: 11
    },
    color: {
      type: String,
      default: '#62666E'
    }
  }
}
</script>
