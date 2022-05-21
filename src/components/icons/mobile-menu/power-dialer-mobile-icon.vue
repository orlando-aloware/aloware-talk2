<template>
  <svg :width="width" :height="height" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.86486 19.3784H5C2.79086 19.3784 1 17.5875 1 15.3784V5C1 2.79086 2.79086 1 5 1H15.3784C17.5875 1 19.3784 2.79086 19.3784 5V5.86486" :stroke="color" stroke-width="1.5" stroke-linecap="round"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M16.5055 12.6165C16.2913 12.3011 16.2491 12.074 16.4551 11.6326C16.7608 10.977 17.8355 9.40614 18.5269 9.16037C18.8462 9.04683 19.1656 9.12258 19.5438 9.34546C20.6576 10.0015 21.0574 10.989 20.9935 12.2507C20.7776 16.5241 16.5192 20.7776 12.249 20.9935C10.988 21.0574 10.0012 20.6574 9.34529 19.543C9.12253 19.1646 9.04681 18.845 9.16048 18.5256C9.40594 17.8339 10.9759 16.7586 11.6313 16.4527C12.0726 16.2466 12.2993 16.2888 12.6146 16.5031C13.6786 17.2274 13.6657 18.1634 14.9637 17.323C15.9371 16.6928 16.6952 15.9406 17.325 14.9668C18.1649 13.6681 17.2292 13.6811 16.5055 12.6165Z" :stroke="color" stroke-width="1.5"/>
    <path d="M6.02704 6.13513H13.027" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.02704 9.91895H10.027" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'power-dialer-mobile-icon',
  props: {
    width: {
      type: [Number, String],
      default: 22
    },
    height: {
      type: [Number, String],
      default: 22
    },
    color: {
      type: String,
      default: '#A3A3A3'
    }
  }
}
</script>
