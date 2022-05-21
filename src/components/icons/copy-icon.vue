<template>
  <svg :width="width" :height="height" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.5 1H9C10.933 1 12.5 2.567 12.5 4.5V10.5" :stroke="color" stroke-width="1.2" stroke-linecap="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M3.93421 2.75H8.31579C9.66017 2.75 10.75 3.86929 10.75 5.25V10.5C10.75 11.8807 9.66017 13 8.31579 13H3.93421C2.58983 13 1.5 11.8807 1.5 10.5V5.25C1.5 3.86929 2.58983 2.75 3.93421 2.75Z" :stroke="color" stroke-width="1.2"/>
  </svg>
</template>

<script>
export default {
  name: 'copy-icon',
  props: {
    color: {
      type: String,
      default: '#62666E',
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
