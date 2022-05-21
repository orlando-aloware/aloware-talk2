<template>
  <svg :width="width" :height="height" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.1667 1H4.83333C2.99238 1 1.5 2.49238 1.5 4.33333V13.6667C1.5 15.5076 2.99238 17 4.83333 17H13.1667C15.0076 17 16.5 15.5076 16.5 13.6667V4.33333C16.5 2.49238 15.0076 1 13.1667 1Z" :stroke="color" stroke-width="1.2"/>
    <path d="M5.59094 5.66602H8.31822" :stroke="color" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M5.59094 9H12.4091" :stroke="color" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M5.59094 12.334H12.4091" :stroke="color" stroke-width="1.2" stroke-linecap="round"/>
  </svg>
</template>

<script>
export default {
  name: 'notes-icon',
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
