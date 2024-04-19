<template>
  <svg :width="width" :height="height" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg" data-testid="folder-icon-svg">
    <path d="M1.5 3.5C1.5 2.39543 2.39543 1.5 3.5 1.5H5.00862C5.19368 1.5 5.37511 1.55135 5.53272 1.64834L6.67561 2.35166C6.83322 2.44865 7.01465 2.5 7.19971 2.5H12.5C13.6046 2.5 14.5 3.39543 14.5 4.5V10.5C14.5 11.6046 13.6046 12.5 12.5 12.5H3.5C2.39543 12.5 1.5 11.6046 1.5 10.5V3.5Z" :stroke="color" stroke-width="1.2"/>
    <path d="M1.5 5.5H14.5" :stroke="color" stroke-width="1.2"/>
  </svg>
</template>

<script>
export default {
  props: {
    width: {
      type: [Number, String],
      default: 16
    },
    height: {
      type: [Number, String],
      default: 14
    },
    color: {
      type: String,
      default: '#62666E'
    }
  }
}
</script>
