<template>
  <svg :width="width" :height="height" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.5 10.6965V14C15.5 15.6569 14.1569 17 12.5 17H4.5C2.84315 17 1.5 15.6569 1.5 14V4C1.5 2.34315 2.84315 1 4.5 1H12.5C14.1569 1 15.5 2.34315 15.5 4V6.64864" :stroke="color" stroke-width="1.2" stroke-linecap="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.862 13.1757C12.7155 13.3222 12.4297 13.4792 12.2322 13.5244L10.5313 13.9135C10.2671 13.9739 10.1025 13.8061 10.1623 13.5446L10.5515 11.844C10.5975 11.6428 10.7574 11.3571 10.9015 11.2131L15.2577 6.85766C15.6385 6.47694 16.2537 6.47477 16.6444 6.86535L17.2118 7.43267C17.5968 7.81764 17.6027 8.43589 17.2179 8.82066L12.862 13.1757Z" :stroke="color" stroke-width="1.2"/>
    <path d="M5.08997 5.66602H11.8181" :stroke="color" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M5.08997 9H8.48997" :stroke="color" stroke-width="1.2" stroke-linecap="round"/>
  </svg>
</template>

<script>
export default {
  name: 'scripts-icon',
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
