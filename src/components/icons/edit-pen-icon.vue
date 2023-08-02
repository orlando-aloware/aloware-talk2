<template>
  <svg :width="width" :height="height" viewBox="0 0 20 20" :fill="color" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.123 5.68359L14.3125 8.87401" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M4 16L4.31459 13.0361C4.35008 12.7017 4.57079 12.2386 4.80975 11.9996L12.2711 4.53585C12.9875 3.81924 14.1532 3.82349 14.8655 4.53598L15.4604 5.13107C16.1769 5.84775 16.1828 7.00375 15.4605 7.72627L7.99917 15.19C7.76119 15.428 7.28827 15.6508 6.96296 15.6853L4 16Z" :stroke="color" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'edit-pen-icon',

  props: {
    color: {
      type: String,
      default: '#62666E',
      required: false
    },

    height: {
      type: String,
      default: '20',
      required: false
    },

    width: {
      type: String,
      default: '20',
      required: false
    }
  }
}
</script>
