<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.75635 9.25586H1.75635V5.25586" :stroke="color" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14.0001 11.5003C14.0005 10.3133 13.6489 9.15279 12.9896 8.16569C12.3304 7.17858 11.3931 6.40921 10.2965 5.9549C9.19987 5.50059 7.99312 5.38176 6.82895 5.61346C5.66477 5.84515 4.59547 6.41696 3.75635 7.25652L1.75635 9.25652" :stroke="color" stroke-linecap="round" stroke-linejoin="round"/>
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
