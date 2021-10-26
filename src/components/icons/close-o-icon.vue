<template>
  <svg :width="width" :height="height" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.25 7C12.25 4.10156 9.89844 1.75 7 1.75C4.10156 1.75 1.75 4.10156 1.75 7C1.75 9.89844 4.10156 12.25 7 12.25C9.89844 12.25 12.25 9.89844 12.25 7Z" :stroke="color" stroke-width="1.2" stroke-miterlimit="10"/>
      <path d="M8.75 8.75L5.25 5.25" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5.25 8.75L8.75 5.25" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

</template>

<script>
export default {
  name: 'close-o-icon',

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
